
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
            const fullPrompt = `${category} ${prompt}, vibrant, news photography, 8k, ultra detailed`;
            const encodedPrompt = encodeURIComponent(fullPrompt);

            // Return Absolute Proxy URL to use authenticated server-side generation
            // FIX: Cron job runs on server where relative URLs fail
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quik.news';
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
            // Fix: No slicing to 50 chars to preserve context
            const cleanTitle = prompt.replace(/[^\w\s]/g, '').toLowerCase();
            const encodedPrompt = encodeURIComponent(`${category} ${cleanTitle}, vibrant color, news photography, 8k resolution`);
            // Use ?provider=cloudflare to trigger real Cloudflare generation
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quik.news';
            return `${baseUrl}/api/generate-image?prompt=${encodedPrompt}&provider=cloudflare`;
        } catch (e) {
            console.error("Cloudflare URL generation failed:", e);
            return null;
        }
    }
}
