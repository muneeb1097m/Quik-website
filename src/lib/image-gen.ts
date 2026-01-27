const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;

/**
 * Generates an AI image URL using Pollinations.ai.
 * Rotates between multiple cost-effective models to distribute load.
 */
// Available models
export const POLLINATIONS_MODELS = {
  FLUX: 'flux',
  TURBO: 'turbo',
  // 'flux-realism', 'any-dark' // other potential models if needed
};

/**
 * Generates an AI image URL using Pollinations.ai.
 * Allows specifying a model, defaults to FLUX.
 */
export function generateNewsImage(title: string, category: string, model: string = POLLINATIONS_MODELS.FLUX): string {
  const keywords = extractKeywords(title, category);

  // Random seed for variety
  const seed = Math.floor(Math.random() * 1000000);

  const prompt = `${keywords} news photography style, highly detailed, 8k resolution, journalism`;
  const encodedPrompt = encodeURIComponent(prompt);

  // Construct URL with selected model
  // Added "nologo=true" and "enhance=true"
  // Added "private=true" to potentially avoid some caching/tracking
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${model}&seed=${seed}&nologo=true&enhance=true&private=true`;

  if (POLLINATIONS_API_KEY) {
    url += `&token=${POLLINATIONS_API_KEY}`;
  }

  return url;
}

/**
 * Extract relevant keywords from title and category
 */
function extractKeywords(title: string, category: string): string {
  const cleanTitle = title
    .replace(/[^\w\s]/g, '')
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 6)
    .join(' ');

  return `${category} ${cleanTitle}`;
}

