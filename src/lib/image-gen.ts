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

// Curated high-quality images for each category to ensure premium aesthetic
// These are direct links to reliable Unsplash images
const CATEGORY_IMAGES: Record<string, string[]> = {
  'Technology': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1024&auto=format&fit=crop', // Chip/Circuit
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1024&auto=format&fit=crop', // Network
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1024&auto=format&fit=crop', // Cyber
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1024&auto=format&fit=crop', // Matrix code
  ],
  'Business': [
    'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=1024&auto=format&fit=crop', // Stock graph
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1024&auto=format&fit=crop', // Skyscraper
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1024&auto=format&fit=crop', // Handshake/Suit
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1024&auto=format&fit=crop', // Meeting
  ],
  'Global': [
    'https://images.unsplash.com/photo-1529101091760-61df6be34fc8?q=80&w=1024&auto=format&fit=crop', // World/Map
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1024&auto=format&fit=crop', // Globe
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1024&auto=format&fit=crop', // International
  ],
  'Sports': [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1024&auto=format&fit=crop', // Stadium
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1024&auto=format&fit=crop', // Ball
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1024&auto=format&fit=crop', // Generic Sports
  ],
  'Auto': [
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1024&auto=format&fit=crop', // Car
    'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=1024&auto=format&fit=crop', // Electric
  ],
  'AI': [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1024&auto=format&fit=crop', // AI Brain
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1024&auto=format&fit=crop', // Abstract AI
  ],
  'Pakistan': [
    'https://images.unsplash.com/photo-1580219430338-e6b7cb856019?q=80&w=1024&auto=format&fit=crop', // Monument
  ]
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1024&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1024&auto=format&fit=crop'
];

/**
 * Generate (Select) an image from our curated list based on category and seed.
 * This replaces the Pollinations.ai generation which is no longer available/broken.
 */
function generateMultiModelImage(keywords: string, seed: number): string {
  // Finds the best matching category from our list
  let categoryKey = 'Global'; // Default

  // Simple keyword matching to find category
  const lowerKeywords = keywords.toLowerCase();

  if (lowerKeywords.includes('tech') || lowerKeywords.includes('ai') || lowerKeywords.includes('cyber')) categoryKey = 'Technology';
  else if (lowerKeywords.includes('business') || lowerKeywords.includes('finance') || lowerKeywords.includes('economy')) categoryKey = 'Business';
  else if (lowerKeywords.includes('sport') || lowerKeywords.includes('cricket')) categoryKey = 'Sports';
  else if (lowerKeywords.includes('car') || lowerKeywords.includes('auto') || lowerKeywords.includes('vehicle')) categoryKey = 'Auto';
  else if (lowerKeywords.includes('pakistan')) categoryKey = 'Pakistan';

  const options = CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES['Technology'];

  // Deterministic selection based on seed
  const index = seed % options.length;
  return options[index];
}

