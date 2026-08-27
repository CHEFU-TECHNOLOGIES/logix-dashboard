import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/config';

export async function GET(req: NextRequest) {
    const sessionCookie = req.headers.get('cookie');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const backendUrl = getApiUrl(`/logs${searchParams ? `?${searchParams}` : ''}`);

    try {
        const response = await fetch(backendUrl, {
            headers: { cookie: sessionCookie },
            cache: 'no-store',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch {
        return NextResponse.json({ error: 'Log service unavailable' }, { status: 502 });
    }
}