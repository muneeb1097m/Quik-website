import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret')?.trim();
    const expectedSecret = (process.env.CRON_SECRET || process.env.REVALIDATE_SECRET || '').trim();

    if (expectedSecret && secret !== expectedSecret) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    try {
        const path = searchParams.get('path')?.trim();
        if (path) {
            revalidatePath(path);
        }
        revalidatePath('/', 'page');
        revalidatePath('/news', 'page');
        revalidatePath('/news/[id]', 'page');
        revalidatePath('/rss.xml');
        (revalidateTag as any)('signals');
        return NextResponse.json({ revalidated: true, now: Date.now() });
    } catch (err: any) {
        return NextResponse.json({ message: 'Error revalidating', error: err.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    return POST(req);
}
