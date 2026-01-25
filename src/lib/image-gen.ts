const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || 'sk_maBugbU2Xpx0D3no5vC1m235Cow3O8y3';

/**
 * Generates an AI image URL using Pollinations.ai.
 * Rotates between multiple cost-effective models to distribute load.
 */
export function generateNewsImage(title: string, category: string): string {
  const keywords = extractKeywords(title, category);

  // Available models (Cost-effective rotation)
  const models = ['flux', 'turbo', 'zimage', 'klein'];

  // Randomly select one model
  const selectedModel = models[Math.floor(Math.random() * models.length)];

  // Random seed for variety
  const seed = Math.floor(Math.random() * 1000000);

  const prompt = `${keywords} news photography style, highly detailed, 8k resolution, journalism`;
  const encodedPrompt = encodeURIComponent(prompt);

  // Construct URL with selected model
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${selectedModel}&seed=${seed}&nologo=true&enhance=true&api_key=${POLLINATIONS_API_KEY}`;
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

