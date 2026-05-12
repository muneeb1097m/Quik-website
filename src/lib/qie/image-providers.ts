
export interface ImageProvider {
    name: string;
    generate(prompt: string, category: string): Promise<string | null>;
}


export class PollinationProvider implements ImageProvider {
    name = 'Pollination';

    async generate(prompt: string, category: string): Promise<string | null> {
        try {
            // Pollination uses GET request with prompt in URL
            // It returns the image directly, so we just return the URL
            const fullPrompt = `Generate a cinematic, hyper-realistic 4K news image representing the headline: "${prompt}". Visually depict the main subject and consequence of the event in a dramatic photojournalistic style. Ultra-detailed, natural lighting, high contrast, realistic skin tones, depth of field, professional camera photography, sharp focus, emotional intensity, documentary realism. Shot with a 50mm lens, DSLR quality, cinematic color grading, realistic shadows, atmospheric depth. 16:9 aspect ratio, ultra HD. No text, no logos, no watermark.`;
            const encodedPrompt = encodeURIComponent(fullPrompt);

            // Return Absolute Proxy URL to use authenticated server-side generation
            // FIX: Cron job runs on server where relative URLs fail
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quiknews.online';
            return `${baseUrl}/api/generate-image?prompt=${encodedPrompt}`;
        } catch (error) {
            console.error("Pollination generation failed:", error);
            return null;
        }
    }
}



// Providers removed: Hercai (Unstable), HuggingFace (Broken), Airforce (Redundant)

export class CloudflareProvider implements ImageProvider {
    name = 'Cloudflare';

    async generate(prompt: string, category: string): Promise<string | null> {
        try {
            // Fix: No slicing to 50 chars to preserve context, but clean weird chars
            const cleanTitle = prompt.replace(/[^\w\s]/g, '');
            const encodedPrompt = encodeURIComponent(`Generate a cinematic, hyper-realistic 4K news image representing the headline: "${cleanTitle}". Visually depict the main subject and consequence of the event in a dramatic photojournalistic style. Ultra-detailed, natural lighting, high contrast, realistic skin tones, depth of field, professional camera photography, sharp focus, emotional intensity, documentary realism. Shot with a 50mm lens, DSLR quality, cinematic color grading, realistic shadows, atmospheric depth. 16:9 aspect ratio, ultra HD. No text, no logos, no watermark.`);
            // Use ?provider=cloudflare to trigger real Cloudflare generation
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quiknews.online';
            return `${baseUrl}/api/generate-image?prompt=${encodedPrompt}&provider=cloudflare`;
        } catch (e) {
            console.error("Cloudflare URL generation failed:", e);
            return null;
        }
    }
}
