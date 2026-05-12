
require('dotenv').config({ path: '.env' }); // Load .env file explicitly if needed, or just require('dotenv').config() 
const https = require('https');

async function checkAirforce() {
    console.log("Checking Airforce API (POST)...");

    const url = 'https://api.airforce/v1/images/generations';

    // OpenAI compatible body
    const body = JSON.stringify({
        prompt: "futuristic city",
        n: 1,
        size: "1024x1024",
        model: "flux-2-dev" // Found via API check
    });

    console.log(`Testing: ${url}`);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.AIRFORCE_API_KEY}`
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

checkAirforce();
