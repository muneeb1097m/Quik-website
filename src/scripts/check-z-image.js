
const https = require('https');

async function checkZImage() {
    console.log("Checking Z-Image via HF API...");

    // Model ID from user's snippet
    const model = 'Tongyi-MAI/Z-Image-Turbo';
    const url = `https://api-inference.huggingface.co/models/${model}`;

    // HF expects JSON
    const body = JSON.stringify({
        inputs: "futuristic city"
    });

    console.log(`Testing: ${url}`);

    // We try to read the key from .env if possible, but for this script we might need to hardcode a dummy or expect rejection
    // Let's try anonymous first

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': 'Bearer ...' // If validation fails, we know it's not public/free
            },
            body: body,
            signal: controller.signal
        });
        clearTimeout(timeout);

        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log("Response:", text.slice(0, 500));

    } catch (e) {
        console.log(`Error: ${e.message}`);
    }
}

checkZImage();
