
export interface ImageProvider {
    name: string;
    generate(prompt: string, category: string): Promise<string | null>;
}

export const POLLINATIONS_MODELS = {
    FLUX: 'flux',
    TURBO: 'turbo',
};

const POLLINATIONS_API_KEY = (process as any).env.POLLINATIONS_API_KEY;

export class PollinationsProvider implements ImageProvider {
    name = 'Pollinations';
    private model: string;

    constructor(model: string = POLLINATIONS_MODELS.FLUX) {
        this.model = model;
    }

    async generate(prompt: string, category: string): Promise<string | null> {
        const seed = Math.floor(Math.random() * 1000000);
        // Use a simplified prompt logic here or call existing util if needed
        // Recreating logic from image-gen.ts to keep it self-contained in providers or we can reuse
        // For now, let's keep the logic similar to existing
        const cleanedPrompt = `${category} ${this.cleanTitle(prompt)} news photography style, highly detailed, 8k resolution, journalism`;
        const encodedPrompt = encodeURIComponent(cleanedPrompt);

        let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${this.model}&seed=${seed}&nologo=true&enhance=true&private=true`;

        if (POLLINATIONS_API_KEY) {
            url += `&token=${POLLINATIONS_API_KEY}`;
        }

        return url;
    }

    private cleanTitle(title: string): string {
        return title
            .replace(/[^\w\s]/g, '')
            .toLowerCase()
            .split(' ')
            .filter(word => word.length > 3)
            .slice(0, 6)
            .join(' ');
    }
}

export class HercaiProvider implements ImageProvider {
    name = 'Hercai';

    async generate(prompt: string, category: string): Promise<string | null> {
        try {
            const fullPrompt = `${category} ${prompt}, news photography style, highly detailed, 8k resolution, journalism`;
            // Hercai V3 URL
            const url = `https://hercai.onrender.com/v3/text2image?prompt=${encodeURIComponent(fullPrompt)}`;

            // We use fetch to get the JSON response
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'QuikNews/1.0',
                },
                signal: AbortSignal.timeout(15000) // 15s timeout
            });

            if (!response.ok) {
                console.warn(`Hercai API error: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();
            // Hercai v3 response format: { "url": "...", "status": 200 }
            if (data && data.url) {
                return data.url;
            }

            return null;

        } catch (error) {
            console.error("Hercai generation failed:", error);
            return null;
        }
    }
}

export class HuggingFaceProvider implements ImageProvider {
    name = 'HuggingFace';
    private apiKey: string;

    constructor() {
        this.apiKey = (process as any).env.HF_API_KEY || '';
    }

    async generate(prompt: string, category: string): Promise<string | null> {
        if (!this.apiKey) return null;

        try {
            console.log("Generating with HuggingFace...");
            const response = await fetch(
                "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ inputs: `${category} ${prompt}, news photography, 8k` }),
                    signal: AbortSignal.timeout(20000)
                }
            );

            if (!response.ok) {
                console.warn(`HF Error: ${response.status}`);
                return null;
            }

            // HF returns binary image logic would be here.
            // Assuming for now it returns binary, which we can't easily handle without upload.
            // BUT, we can convert to Base64 data URI if it's small enough?
            // Let's return null for now until we confirm we want to use storage.
            // User asked to put it in .env, so I assume they want it implemented.
            // Let's implement Airforce first fully.

            return null;
        } catch (e) {
            return null;
        }
    }
}

export class AirforceProvider implements ImageProvider {
    name = 'Airforce';
    private apiKey: string;

    constructor() {
        this.apiKey = (process as any).env.AIRFORCE_API_KEY || '';
    }

    async generate(prompt: string, category: string): Promise<string | null> {
        if (!this.apiKey) return null;

        const url = 'https://api.airforce/v1/images/generations';
        try {
            // We need to use "v1/images/generations" which is OpenAI compatible
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: `${category} ${prompt}`,
                    size: "1024x1024",
                    model: "flux"
                }),
                signal: AbortSignal.timeout(20000)
            });

            if (!res.ok) {
                console.warn(`Airforce Error: ${res.status}`);
                return null;
            }

            const data = await res.json();
            if (data.data && data.data[0] && data.data[0].url) {
                return data.data[0].url;
            }
            return null;
        } catch (e) {
            console.error("Airforce failed:", e);
            return null;
        }
    }
}
