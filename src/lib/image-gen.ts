/**
 * Generates an AI image URL for a news event using free image generation services.
 * This implementation distributes requests across 10 different models (10% each)
 * to avoid rate limits and provide visual variety.
 */
export function generateNewsImage(title: string, category: string): string {
  // Extract keywords from title for better image generation
  const keywords = extractKeywords(title, category);

  // Generate a random seed to ensure uniqueness and deterministic model selection
  const seed = Math.floor(Math.random() * 1000000);

  // Use one of 10 different models based on the seed (10% probability each)
  return generateMultiModelImage(keywords, seed);
}

/**
 * Extract relevant keywords from title and category
 */
function extractKeywords(title: string, category: string): string {
  // Clean and simplify the title
  const cleanTitle = title
    .replace(/[^\w\s]/g, '') // Remove special characters
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 3) // Remove short words
    .slice(0, 5) // Take first 5 meaningful words
    .join(' ');

  return `${category} ${cleanTitle}`;
}

/**
 * Available models on Pollinations.ai
 * Using 10 distinct models/styles to distribute load and provide variety.
 */
const MODEL_OPTIONS = [
  'flux',             // Standard Flux model
  'flux-realism',     // Photorealistic variant
  'flux-anime',       // Anime style
  'flux-3d',          // 3D render style
  'turbo',            // Fast generation
  'stable-diffusion', // Classic SD
  'midjourney',       // Midjourney style wrapper
  'any-dark',         // Dark aesthetic
  'seedream',         // Surreal/dreamy
  'kontext'           // Context-aware
];

/**
 * Generate image using one of the 10 available models
 */
function generateMultiModelImage(keywords: string, seed: number): string {
  const prompt = `${keywords} news photography style, highly detailed, 8k resolution`;
  const encodedPrompt = encodeURIComponent(prompt);

  // Select model based on the last digit of the seed (0-9)
  const modelIndex = seed % 10;
  const selectedModel = MODEL_OPTIONS[modelIndex];

  // Construct URL with the specific model
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${selectedModel}&seed=${seed}&nologo=true&enhance=true`;
}

