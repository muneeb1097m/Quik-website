
import { generateNewsImage } from '../lib/image-gen';

// We can now directly test the functionality by importing it, 
// ensuring that 'extractKeywords' (which is not exported) is working correctly 
// by observing the URL generated.

const testCases = [
    { title: "US and UK agree on new AI safety standards", category: "Technology" },
    { title: "Oil prices surge as war escalates in Middle East", category: "Business" },
    { title: "Review: The new VW ID.4 is a solid EV", category: "Auto" },
    { title: "Pakistan vs India: T20 World Cup Match", category: "Sports" },
];

console.log("--- Testing Fixed Logic via generateNewsImage URL ---");
testCases.forEach(tc => {
    const url = generateNewsImage(tc.title, tc.category);
    // Decode the prompt from the URL to see what keywords were used
    const promptMatch = url.match(/prompt=([^&]+)/);
    if (promptMatch) {
        const decodedPrompt = decodeURIComponent(promptMatch[1]);
        console.log(`Title: "${tc.title}"`);
        console.log(`Generated Prompt: "${decodedPrompt}"`);
        console.log("---");
    } else {
        console.log(`Failed to parse URL for "${tc.title}": ${url}`);
    }
});
