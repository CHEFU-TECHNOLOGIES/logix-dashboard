import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';

export async function GET(req: NextRequest) {
    const sessionCookie = req.headers.get('cookie');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backendUrl = getApiUrl('/logix/overview');

    try {
        const response = await fetch(backendUrl, {
            headers: { cookie: sessionCookie },
            cache: 'no-store',
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Metrics service unavailable' },
                { status: response.status }
            );
        }

        const overview = await response.json();
        const metrics = {
            ingestRate: Number(overview.ingestRate) || 0,
            backlog: Number(overview.backlog) || 0,
            averageLatency: Number(overview.avgLatency) || 0,
        };

        return new NextResponse(`data: ${JSON.stringify(metrics)}\n\n`, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
            },
        });
    } catch {
        return NextResponse.json({ error: 'Metrics service unavailable' }, { status: 502 });
    }
}