
import { PollinationsProvider, HercaiProvider, POLLINATIONS_MODELS } from '../lib/qie/image-providers';

async function testProviders() {
    console.log("Starting Image Provider Test...");

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
            // Hercai URLs might need a GET to be useful or might be direct.
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`Hercai Status: ${res.status}`);
        }
    } catch (e) {
        console.error("Hercai failed:", e);
    }
}

testProviders();
