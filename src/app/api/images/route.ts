import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { query, page = 0, limit = 10, rating } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Build tags string for Gelbooru
    const tags = query.trim();

    // Gelbooru API - public, no auth needed
    const params = new URLSearchParams({
      page: 'dapi',
      s: 'post',
      q: 'index',
      json: '1',
      tags: tags,
      limit: String(limit),
      pid: String(page),
    });

    // Optionally add rating filter
    if (rating) {
      params.set('tags', `${tags} rating:${rating}`);
    }

    const apiUrl = `https://gelbooru.com/index.php?${params.toString()}`;

    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'VenCode-App/4.0',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Gelbooru API error', results: [] },
        { status: 502 }
      );
    }

    const posts: GelbooruPost[] = await response.json();
    const results = (Array.isArray(posts) ? posts : [])
      .filter((post) => post.file_url || post.sample_url)
      .map((post) => ({
        id: post.id,
        url: post.sample_url || post.file_url,
        full_url: post.file_url || post.sample_url,
        thumbnail: post.preview_url || post.sample_url || post.file_url,
        name: post.tags?.split(' ').slice(0, 8).join(', ') || 'Gelbooru',
        source: 'Gelbooru',
        tags: post.tags?.split(' ').slice(0, 20) || [],
        score: post.score || 0,
        rating: post.rating || 'safe',
        width: post.width || 0,
        height: post.height || 0,
      }));

    return NextResponse.json({ results, total: results.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Search failed';
    console.error('Gelbooru search error:', error);
    return NextResponse.json({ error: message, results: [] }, { status: 500 });
  }
}
