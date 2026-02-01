
import { HercaiProvider } from '../lib/qie/image-providers';

async function testProviders() {
    console.log("Starting Image Provider Test...");

    // Pollination test removed

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
