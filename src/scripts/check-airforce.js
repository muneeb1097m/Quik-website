
const https = require('https');

async function checkAirforce() {
    console.log("Checking Airforce API...");
    // Try different parameters/endpoints if needed, but start with the one that gave 200
    const urls = [
        'https://api.airforce/v1/imagine?prompt=futuristic%20city',
        'https://api.airforce/imagine?prompt=futuristic%20city'
    ];

    for (const url of urls) {
        console.log(`\nTesting: ${url}`);
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const res = await fetch(url, {
                method: 'GET',
                signal: controller.signal
            });
            clearTimeout(timeout);

            console.log(`Status: ${res.status}`);
            console.log(`Content-Type: ${res.headers.get('content-type')}`);
            console.log(`Content-Length: ${res.headers.get('content-length')}`);

            if (res.headers.get('content-type')?.includes('image')) {
                console.log("SUCCESS: It is an image!");
                return; // Found it
            } else if (res.headers.get('content-type')?.includes('json')) {
                const data = await res.json();
                console.log("JSON:", JSON.stringify(data).slice(0, 200));
            } else {
                const text = await res.text();
                console.log("Text:", text.slice(0, 200));
            }

        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
    }
}

checkAirforce();
