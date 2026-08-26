import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ types: string }> }
) {
    const { types } = await params;
    const sessionCookie = req.headers.get('cookie');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.ONE_MINUTE_LOGS_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API Key not configured in environment' },
            { status: 500 }
        );
    }

    const targetType = types; // 'logs' or 'stream'
    const searchParams = req.nextUrl.searchParams.toString();
    const backendUrl = `${process.env.NEXT_PUBLIC_SERVER_URI}/logix/logs${targetType === 'stream' ? '/stream' : ''
        }?${searchParams}`;

    const response = await fetch(backendUrl, {
        headers: {
            'x-api-key': apiKey,
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