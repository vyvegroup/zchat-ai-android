import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

interface GelbooruPost {
  id: number;
  file_url: string;
  preview_url: string;
  sample_url: string;
  tags: string;
  score: number;
  rating: string;
  width: number;
  height: number;
  image: string;
  directory: string;
}

async function searchGelbooru(query: string, limit: number = 6): Promise<Array<{
  url: string;
  name: string;
  thumbnail: string;
  source: string;
  tags?: string[];
  score?: number;
}>> {
  try {
    const params = new URLSearchParams({
      page: 'dapi',
      s: 'post',
      q: 'index',
      json: '1',
      tags: query,
      limit: String(limit),
      pid: '0',
    });

    const apiUrl = `https://gelbooru.com/index.php?${params.toString()}`;
    const response = await fetch(apiUrl, {
      headers: { 'User-Agent': 'VenCode-App/4.0' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const posts: GelbooruPost[] = await response.json();
    if (!Array.isArray(posts)) return [];

    return posts
      .filter((post) => post.sample_url || post.file_url)
      .slice(0, limit)
      .map((post) => ({
        url: post.sample_url || post.file_url,
        full_url: post.file_url || post.sample_url,
        name: post.tags?.split(' ').slice(0, 6).join(', ') || 'Gelbooru',
        thumbnail: post.preview_url || post.sample_url || post.file_url,
        source: 'Gelbooru',
        tags: post.tags?.split(' ').slice(0, 15) || [],
        score: post.score || 0,
      }));
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const finalPrompt = systemPrompt || 'Bạn là VenCode AI. Trả lời bằng tiếng Việt.';

    // Save user message
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage.role === 'user') {
      await db.chatMessage.create({
        data: {
          sessionId,
          role: 'user',
          content: lastUserMessage.content,
        },
      });

      const messageCount = await db.chatMessage.count({
        where: { sessionId },
      });
      if (messageCount === 1) {
        const title =
          lastUserMessage.content.length > 40
            ? lastUserMessage.content.substring(0, 40) + '...'
            : lastUserMessage.content;
        await db.chatSession.update({
          where: { id: sessionId },
          data: { title },
        });
      }
    }

    // Build messages for AI
    const aiMessages = [
      { role: 'system', content: finalPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    // Call AI
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: aiMessages,
    });

    let aiResponse = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    // Check if AI wants to search for images on Gelbooru
    let imageResults: Array<{
      url: string;
      name: string;
      thumbnail: string;
      source: string;
      tags?: string[];
      score?: number;
    }> | null = null;

    const imageSearchMatch = aiResponse.match(/\[IMAGE_SEARCH:\s*(.+?)\s*\]/i);
    if (imageSearchMatch) {
      const searchQuery = imageSearchMatch[1];
      imageResults = await searchGelbooru(searchQuery, 6);
      aiResponse = aiResponse.replace(/\[IMAGE_SEARCH:\s*.+?\s*\]/gi, '');
    }

    const imgIntentMatch = aiResponse.match(/\[SEARCH_IMAGES:\s*(.+?)\s*\]/i);
    if (!imageResults && imgIntentMatch) {
      const searchQuery = imgIntentMatch[1];
      imageResults = await searchGelbooru(searchQuery, 6);
      aiResponse = aiResponse.replace(/\[SEARCH_IMAGES:\s*.+?\s*\]/gi, '');
    }

    // Save assistant response
    await db.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    await db.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      content: aiResponse,
      images: imageResults,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Chat API error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
