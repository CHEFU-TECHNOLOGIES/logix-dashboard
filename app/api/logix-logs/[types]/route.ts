import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ types: string }> }
) {
    const { types } = await params;
    const sessionCookie = req.headers.get('cookie');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const targetType = types; // 'logs' or 'stream'
    const searchParams = req.nextUrl.searchParams.toString();
    const backendUrl = getApiUrl(`/logix/logs${targetType === 'stream' ? '/stream' : ''}${searchParams ? `?${searchParams}` : ''}`);

    const response = await fetch(backendUrl, {
        headers: {
            cookie: sessionCookie,
        },
        cache: 'no-store',
    });

    return new NextResponse(response.body, {
        status: response.status,
        headers: {
            'Content-Type': response.headers.get('Content-Type') || 'application/json',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
        },
    });
}