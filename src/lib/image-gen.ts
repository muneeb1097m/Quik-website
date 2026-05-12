const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

/**
 * Generates an AI image URL using a distributed strategy:
 * 1. Cloudflare Workers AI (High Reliability, Fast)
 * 2. Other Providers (as fallback)
 */

// Available models
export const MODELS = {
  CLOUDFLARE: {
    SDXL: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    FLUX_SCHNELL: '@cf/black-forest-labs/flux-1-schnell',
  }
};

/**
 * Generates a news image URL.
 * Automatically uses Cloudflare (via API Proxy) or other providers.
 */
export function generateNewsImage(title: string, category: string, model: string = MODELS.CLOUDFLARE.FLUX_SCHNELL): string {
  const keywords = extractKeywords(title, category);

  // Pollinations.ai advanced cinematic prompt
  const basePrompt = `Generate a cinematic, hyper-realistic 4K news image representing the headline: "${keywords}". Visually depict the main subject and consequence of the event in a dramatic photojournalistic style. Ultra-detailed, natural lighting, high contrast, realistic skin tones, depth of field, professional camera photography, sharp focus, emotional intensity, documentary realism. Shot with a 50mm lens, DSLR quality, cinematic color grading, realistic shadows, atmospheric depth. 16:9 aspect ratio, ultra HD. No text, no logos, no watermark.`;
  const prompt = basePrompt;
  const encodedPrompt = encodeURIComponent(prompt);

  // Return Proxy URL so we can hide API Key on server
  return `/api/generate-image?prompt=${encodedPrompt}`;
}

/**
 * Server-side function to generate image using Pollinations.ai
 * Supports authenticated usage via POLLINATIONS_API_KEY
 */
export async function generateImageWithPollination(prompt: string) {
  const apiKey = process.env.POLLINATIONS_API_KEY;

  if (!apiKey) {
    throw new Error('Pollinations API Key is missing. Anonymous usage is disabled.');
  }

  const encodedPrompt = encodeURIComponent(prompt);
  // Enforce Flux model and use API key
  let url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&model=flux`;

  const headers: Record<string, string> = {
    'User-Agent': 'QuikNews/1.0',
    'Authorization': `Bearer ${apiKey}`
  };

  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  });

  if (!response.ok) {
    throw new Error(`Pollination API Error: ${response.status} ${response.statusText}`);
  }

  return await response.arrayBuffer();
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
    // .toLowerCase() // Keep case for acronyms
    .split(' ')
    .filter(word => word.length >= 2) // Allow 2 letter words (AI, US, UK, EU)
    .slice(0, 15)
    .join(' ');

  return `${category} ${cleanTitle}`;
}

