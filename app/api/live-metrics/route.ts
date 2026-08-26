import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const sessionCookie = req.headers.get('cookie');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_SERVER_URI}/logs/metrics/stream`;

    const response = await fetch(backendUrl, {
        headers: { cookie: sessionCookie },
        cache: 'no-store',
    });

    if (!response.body) {
        return NextResponse.json(
            { error: 'Upstream stream unavailable' },
            { status: 502 }
        );
    }

    return new NextResponse(response.body, {
        status: response.status,
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}