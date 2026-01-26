
import { generateNewsImage, POLLINATIONS_MODELS } from '../src/lib/image-gen';

// Mock fetch for the test if needed, or use real fetch
// We'll use real fetch to test the API

async function testImageGen() {
    console.log('Testing Image Generation...');

    // Test Flux
    const title = "Future of Artificial Intelligence";
    const category = "Technology";

    console.log('\n--- Testing FLUX ---');
    const urlFlux = generateNewsImage(title, category, POLLINATIONS_MODELS.FLUX);
    console.log('Generated URL:', urlFlux);

    try {
        const res = await fetch(urlFlux);
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));
        console.log('Content-Length:', res.headers.get('content-length'));
    } catch (e) {
        console.error('Fetch failed:', e);
    }

    // Test Turbo
    console.log('\n--- Testing TURBO ---');
    const urlTurbo = generateNewsImage(title, category, POLLINATIONS_MODELS.TURBO);
    console.log('Generated URL:', urlTurbo);

    try {
        const res = await fetch(urlTurbo);
        console.log('Status:', res.status);
        console.log('Content-Type:', res.headers.get('content-type'));
        console.log('Content-Length:', res.headers.get('content-length'));
    } catch (e) {
        console.error('Fetch failed:', e);
    }
}

testImageGen();
