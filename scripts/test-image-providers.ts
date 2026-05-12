
// Load environment variables
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { GoogleImageSearcher } from '../src/lib/qie/image_search';
import { CloudflareProvider, PollinationProvider } from '../src/lib/qie/image-providers';

async function testtob() {
    console.log("--- Testing Google Image Search ---");
    const searcher = new GoogleImageSearcher();
    const query = "AI Technology News";
    try {
        const googleUrl = await searcher.search(query);
        console.log("Google URL:", googleUrl);
    } catch (e) {
        console.error("Google Search Failed:", e);
    }

    console.log("\n--- Testing Pollination Provider ---");
    const poly = new PollinationProvider();
    try {
        const polyUrl = await poly.generate("AI Robot", "Technology");
        console.log("Pollination URL:", polyUrl);
        // Simulate what cron does:
        if (polyUrl && polyUrl.startsWith('/')) {
            console.error("CRITICAL: Pollination returned a relative URL. Fetch will fail in Cron.");
        }
    } catch (e) {
        console.error("Pollination Failed:", e);
    }

    console.log("\n--- Testing Cloudflare Provider ---");
    const cf = new CloudflareProvider();
    try {
        const cfUrl = await cf.generate("AI Robot", "Technology");
        console.log("Cloudflare URL:", cfUrl);
    } catch (e) {
        console.error("Cloudflare Failed:", e);
    }
}

testtob();
