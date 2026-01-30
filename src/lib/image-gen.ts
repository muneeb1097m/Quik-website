const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

/**
 * Generates an AI image URL using a distributed strategy:
 * 1. Cloudflare Workers AI (High Reliability, Fast)
 * 2. Pollinations.ai (Backup, Free)
 */

// Available models
export const MODELS = {
  POLLINATIONS: {
    FLUX: 'flux',
    TURBO: 'turbo',
  },
  CLOUDFLARE: {
    SDXL: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    FLUX_SCHNELL: '@cf/black-forest-labs/flux-1-schnell',
  }
};

/**
 * Generates a news image URL.
 * Automatically rotates between Pollinations (Direct) and Cloudflare (via API Proxy).
 */
export function generateNewsImage(title: string, category: string, model: string = MODELS.POLLINATIONS.FLUX): string {
  const keywords = extractKeywords(title, category);
  const seed = Math.floor(Math.random() * 1000000);

  // Use a more detailed news-optimized prompt
  const prompt = `${keywords} news photography style, award winning photo journalism, highly detailed, 8k resolution, realistic lighting, in the style of Associated Press`;
  const encodedPrompt = encodeURIComponent(prompt);

  // 50% chance to use Cloudflare (via our API), 50% Pollinations
  // This distributes the load and cost
  const useCloudflare = Math.random() > 0.5;

  if (useCloudflare) {
    // Return URL to our new API route
    // Note: We encode the full prompt to ensure consistent generation
    return `/api/generate-image?prompt=${encodedPrompt}`;
  }

  // Pollinations URL (Fallback / Primary Alternative)
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=${model}&seed=${seed}&nologo=true&enhance=true&private=true`;

  if (POLLINATIONS_API_KEY) {
    url += `&token=${POLLINATIONS_API_KEY}`;
  }

  return url;
}

/**
 * Server-side function to generate image using Cloudflare
 * (Use this in API routes or Server Actions)
 */
export async function generateImageWithCloudflare(prompt: string) {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    throw new Error('Cloudflare credentials missing');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${MODELS.CLOUDFLARE.FLUX_SCHNELL}`,
    {
      headers: { Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}` },
      method: "POST",
      body: JSON.stringify({ prompt: prompt, num_steps: 4 }),
    }
  );

  if (!response.ok) {
    throw new Error(`Cloudflare AI Error: ${response.statusText}`);
  }

  // Returns binary image data (stream/blob)
  return await response.arrayBuffer();
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
