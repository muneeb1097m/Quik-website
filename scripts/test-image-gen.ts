import { generateNewsImage } from '../src/lib/image-gen';

const title = "SpaceX Launches Starship";
const category = "Technology";

const url = generateNewsImage(title, category);

console.log("Test Title:", title);
console.log("Test Category:", category);
console.log("Generated URL:", url);

if (url.includes("pollinations.ai") && url.includes("flux")) {
    console.log("SUCCESS: URL structure is correct.");
} else {
    console.error("FAILURE: URL structure is incorrect.");
}
