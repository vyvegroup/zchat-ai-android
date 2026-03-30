import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await db.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    // Get last message for each session
    const sessionsWithPreview = await Promise.all(
      sessions.map(async (session) => {
        const lastMessage = await db.chatMessage.findFirst({
          where: { sessionId: session.id },
          orderBy: { createdAt: 'desc' },
        });
        return {
          id: session.id,
          title: session.title,
          createdAt: session.createdAt.toISOString(),
          updatedAt: session.updatedAt.toISOString(),
          messageCount: session._count.messages,
          lastMessage: lastMessage?.content || '',
        };
      })
    );

    return NextResponse.json(sessionsWithPreview);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sessions';
    console.error('Sessions GET error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await db.chatSession.create({
      data: {
        title: body.title || 'Cuộc trò chuyện mới',
      },
    });

    return NextResponse.json({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create session';
    console.error('Sessions POST error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
