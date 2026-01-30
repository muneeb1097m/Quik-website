
const https = require('https');

async function checkEndpoint(url, name) {
    console.log(`Testing ${name} (${url})...`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        // Try a simple GET or POST depending on common API patterns
        // Most of these wrapper APIs use GET or POST with query params
        // Let's try to fetch a generation
        const checkUrl = `${url}?prompt=futuristic%20city`;

        const res = await fetch(checkUrl, {
            method: 'GET',
            headers: { 'User-Agent': 'QuikNews/1.0' },
            signal: controller.signal
        });
        clearTimeout(timeout);

        console.log(`${name} Status: ${res.status}`);
        if (res.ok) {
            const data = await res.json().catch(() => null);
            console.log(`${name} Data:`, data ? 'JSON received' : 'No JSON');
            if (data && (data.url || data.image)) console.log("SUCCESS: Found image URL!");
        } else {
            console.log(`${name} Response:`, await res.text().slice(0, 100));
        }
    } catch (e) {
        console.log(`${name} Error: ${e.message}`);
    }
}

async function run() {
    // List of potential endpoints found in research
    // NekoAPI often used as current Hercai alternative
    await checkEndpoint('https://api.nekoapi.com/v1/images/generations', 'NekoAPI');
    await checkEndpoint('https://api.nekosapi.com/v3/images/random', 'NekosAPI (Random)'); // Check connectivity

    // "Airforce" is another one often mentioned with Hercai
    await checkEndpoint('https://api.airforce/v1/imagine', 'Airforce');

    // Check Hercai status again
    await checkEndpoint('https://hercai.onrender.com/v3/text2image', 'Hercai');
}

run();
