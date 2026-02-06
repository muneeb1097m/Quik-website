import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithPollination } from '@/lib/image-gen';

export const runtime = 'edge'; // Use Edge Runtime for speed

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');
    const provider = searchParams.get('provider') || 'pollination'; // 'pollination' | 'cloudflare'

    if (!prompt) {
        return new NextResponse('Missing prompt', { status: 400 });
    }

    try {
        let imageBuffer: ArrayBuffer;

        if (provider === 'cloudflare') {
            // Use Real Cloudflare
            // Note: This requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in env
            // Using generateImageWithCloudflare from lib
            // We need to import it properly.
            const { generateImageWithCloudflare } = await import('@/lib/image-gen');
            imageBuffer = await generateImageWithCloudflare(prompt);
        } else {
            // Default: Pollinations.ai Proxy
            const { generateImageWithPollination } = await import('@/lib/image-gen');
            imageBuffer = await generateImageWithPollination(prompt);
        }

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/jpeg', // Most providers return JPEG/PNG
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Image generation error:', error);
        return new NextResponse(`Failed to generate image: ${error.message}`, { status: 500 });
    }
}
