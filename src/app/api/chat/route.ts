import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, systemPrompt } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Use provided system prompt or default
    const finalPrompt = systemPrompt || 'Bạn là VenCode AI, một trợ lý AI thông minh và hữu ích. Trả lời bằng tiếng Việt.';

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

      // Auto-generate title from first user message
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

    const aiResponse = completion.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    // Save assistant response
    await db.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: aiResponse,
      },
    });

    // Update session timestamp
    await db.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ content: aiResponse });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Chat API error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
