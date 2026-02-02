import { NextRequest, NextResponse } from 'next/server';
import { generateImageWithPollination } from '@/lib/image-gen';

export const runtime = 'edge'; // Use Edge Runtime for speed

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const prompt = searchParams.get('prompt');

    if (!prompt) {
        return new NextResponse('Missing prompt', { status: 400 });
    }

    try {
        // Switch to Pollinations.ai Proxy
        const imageBuffer = await generateImageWithPollination(prompt);

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': 'image/jpeg', // Pollination usually returns JPEG or PNG, safest to assume binary
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error) {
        console.error('Image generation error:', error);
        return new NextResponse('Failed to generate image', { status: 500 });
    }
}
