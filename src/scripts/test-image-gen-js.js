
const https = require('https');

// Simple fetch polyfill or use native fetch if node 18+
// Assuming Node 18+ which has native fetch.

// Pollination test removed

class HercaiProvider {
    constructor() {
        this.name = 'Hercai';
    }

    async generate(prompt, category) {
        try {
            const fullPrompt = `${category} ${prompt}, news photography style, highly detailed, 8k resolution, journalism`;
            // Hercai V3 URL
            const url = `https://hercai.onrender.com/v3/text2image?prompt=${encodeURIComponent(fullPrompt)}`;

            console.log(`Fetching Hercai: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'QuikNews/1.0',
                },
                signal: AbortSignal.timeout(15000)
            });

            if (!response.ok) {
                console.warn(`Hercai API error: ${response.status} ${response.statusText}`);
                return null;
            }

            const data = await response.json();
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

async function testProviders() {
    console.log("Starting Image Provider Test (JS)...");

    // Test Pollinations (Flux)
    console.log("\nTesting Pollinations (Flux)...");
    const pollProvider = new PollinationsProvider(POLLINATIONS_MODELS.FLUX);
    try {
        const url = await pollProvider.generate("Futuristic city skyline", "Technology");
        console.log(`Pollinations URL: ${url}`);
        if (url) {
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`Pollinations Status: ${res.status}`);
        }
    } catch (e) {
        console.error("Pollinations failed:", e);
    }

    // Test Hercai
    console.log("\nTesting Hercai...");
    const hercaiProvider = new HercaiProvider();
    try {
        const url = await hercaiProvider.generate("Futuristic city skyline", "Technology");
        console.log(`Hercai URL: ${url}`);
        if (url) {
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`Hercai Status: ${res.status}`);
        }
    } catch (e) {
        console.error("Hercai failed:", e);
    }
}

testProviders();
