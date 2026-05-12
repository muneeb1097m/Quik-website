
const https = require('https');

async function checkHF() {
    console.log("Checking HuggingFace Anonymous...");

    const url = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

    // HF expects JSON
    const body = JSON.stringify({
        inputs: "futuristic city"
    });

    console.log(`Testing: ${url}`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // No Authorization header
            },
            body: body,
            signal: controller.signal
        });
        clearTimeout(timeout);

        console.log(`Status: ${res.status}`);
        if (res.ok) {
            console.log("Content-Type:", res.headers.get('content-type'));
            // If image/jpeg, we are good!
            if (res.headers.get('content-type').includes('image')) {
                console.log("SUCCESS: Got an image!");
            } else {
                const json = await res.json();
                console.log("JSON:", JSON.stringify(json).slice(0, 200));
            }
        } else {
            const text = await res.text();
            console.log("Response:", text.slice(0, 200));
        }

    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

checkHF();
