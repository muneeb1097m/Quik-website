/**
 * Generates an AI image URL for a news event using Pollinations.ai (Flux model).
 * This service is 100% free and requires no API key.
 */
export function generateNewsImage(title: string, category: string): string {
  // Construct a descriptive prompt for the AI
  // We want high quality, photorealistic images that don't look "fake"
  const basePrompt = `editorial photography, 8k, highly detailed, realistic, news image for ${category} category`;
  const subjectPrompt = `showing ${title}`;
  const stylePrompt = `professional journalism, vibrant colors, sharp focus, no text, cinematic lighting`;
  
  const fullPrompt = `${basePrompt}, ${subjectPrompt}, ${stylePrompt}`;
  
  // Encode the prompt for the URL
  const encodedPrompt = encodeURIComponent(fullPrompt);
  
  // Generate a random seed to ensure uniqueness even for same prompts
  const seed = Math.floor(Math.random() * 1000000);
  
  // Construct the Pollinations URL
  // model=flux is generally considered high quality/competitive
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&seed=${seed}&nologo=true`;
}
