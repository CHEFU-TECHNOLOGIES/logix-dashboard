import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const sessionCookie = req.headers.get('cookie');
    if (!sessionCookie) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams.toString();
    const backendUrl = `${process.env.NEXT_PUBLIC_SERVER_URI}/logs?${searchParams}`;

    const response = await fetch(backendUrl, {
        headers: { cookie: sessionCookie },
        cache: 'no-store',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}