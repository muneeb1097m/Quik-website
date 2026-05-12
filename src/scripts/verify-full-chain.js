
const https = require('https');

// Mock Env for testing (In real app, this comes from process.env)
// We will try to read the real .env if possible, or just checks what's available
require('dotenv').config(); 

async function testProvider(name, fn) {
    console.log(`\nTesting Provider: ${name}...`);
    try {
        const start = Date.now();
        const url = await fn();
        const duration = Date.now() - start;
        
        if (url) {
            console.log(`✅ SUCCESS (${duration}ms)`);
            console.log(`   URL: ${url}`);
            
            // Validate URL access
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            try {
                const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
                clearTimeout(timeout);
                console.log(`   Access Check: ${res.status} ${res.statusText}`);
            } catch(e) {
                console.log(`   Access Check Failed: ${e.message}`);
            }
        } else {
            console.log(`❌ FAILED (No URL returned)`);
        }
    } catch (e) {
        console.log(`❌ ERROR: ${e.message}`);
    }
}

// Mimic the Providers using fetch
async function run() {
    console.log("=== FINAL SYSTEM VERIFICATION ===");
    console.log("Env Keys:");
    console.log("   AIRFORCE_API_KEY:", process.env.AIRFORCE_API_KEY ? "Loaded (HIDDEN)" : "Not Found");
    console.log("   HF_API_KEY:      ", process.env.HF_API_KEY ? "Loaded (HIDDEN)" : "Not Found");
    console.log("---------------------------------");

    // 1. Airforce
    await testProvider('Airforce', async () => {
        const apiKey = process.env.AIRFORCE_API_KEY;
        if (!apiKey) return null;
        
        const res = await fetch('https://api.airforce/v1/images/generations', {
             method: 'POST',
             headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
             body: JSON.stringify({ prompt: "technology news", size: "1024x1024", model: "flux" })
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        return data.data?.[0]?.url;
    });

    // 2. Pollinations (Flux)
    await testProvider('Pollinations (Flux)', async () => {
        const prompt = encodeURIComponent('technology news photography');
        const url = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&model=flux&seed=${Math.floor(Math.random()*1000)}&nologo=true`;
        // Check if it works
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return url;
    });

    // 3. Hercai
    await testProvider('Hercai', async () => {
        const res = await fetch(`https://hercai.onrender.com/v3/text2image?prompt=technology`, {
             headers: { 'User-Agent': 'QuikNews' }
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        return data.url;
    });
    
    // 4. Pollinations (Turbo)
    await testProvider('Pollinations (Turbo)', async () => {
        const prompt = encodeURIComponent('technology news photography');
        const url = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&model=turbo&seed=${Math.floor(Math.random()*1000)}&nologo=true`;
        const res = await fetch(url, { method: 'HEAD' });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return url;
    });
}

run();
