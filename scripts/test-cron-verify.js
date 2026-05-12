
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

// Mock Pollination Provider logic from src/lib/qie/image-providers.ts
class PollinationProvider {
    constructor() {
        this.name = 'Pollination';
    }

    async generate(prompt, category) {
        try {
            const fullPrompt = `${category} ${prompt}, vibrant, news photography, 8k, ultra detailed`;
            const encodedPrompt = encodeURIComponent(fullPrompt);

            // Logic copied from src/lib/qie/image-providers.ts
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://quiknews.online';
            console.log('Base URL used:', baseUrl);

            return `${baseUrl}/api/generate-image?prompt=${encodedPrompt}`;
        } catch (error) {
            console.error("Pollination generation failed:", error);
            return null;
        }
    }
}

async function testCronVerification() {
    console.log('Testing Cron Image Verification Logic...');

    const provider = new PollinationProvider();
    const prompt = 'Futuristic city skyline at sunset';
    const category = 'Technology';

    console.log(`Generating URL for provider: ${provider.name}...`);
    const candidateUrl = await provider.generate(prompt, category);

    if (!candidateUrl) {
        console.error('Provider returned no URL.');
        return;
    }

    console.log(`Candidate URL: ${candidateUrl}`);
    console.log('Attempting to fetch (verify) image...');

    try {
        const startTime = Date.now();
        // Simulate cron fetch with 30s timeout
        const check = await fetch(candidateUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'QuikNews/1.0 (Monitor)' },
            signal: AbortSignal.timeout(30000)
        });
        const duration = Date.now() - startTime;
        console.log(`Fetch completed in ${duration}ms`);

        if (check.ok) {
            const contentType = check.headers.get('content-type');
            const size = parseInt(check.headers.get('content-length') || '0');
            console.log(`SUCCESS: Status ${check.status}, Type: ${contentType}, Size: ${size} bytes`);

            if (size < 150000) {
                const buffer = await check.arrayBuffer();
                const text = new TextDecoder().decode(buffer.slice(0, 2048)).toLowerCase();
                console.log('Start of response body:', text.substring(0, 100));
            }
        } else {
            console.error(`FAILURE: Status ${check.status} ${check.statusText}`);
            const text = await check.text();
            console.error('Error Body:', text.substring(0, 500));
        }

    } catch (error) {
        console.error('FETCH ERROR:', error.message);
        if (error.name === 'TimeoutError') {
            console.error('Operation timed out!');
        }
    }
}

testCronVerification();
