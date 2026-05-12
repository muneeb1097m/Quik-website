export class GoogleImageSearcher {
    private apiKey: string;
    private cseId: string;

    constructor() {
        this.apiKey = process.env.GOOGLE_API_KEY || '';
        this.cseId = process.env.GOOGLE_CSE_ID || '';
    }

    async search(query: string): Promise<string | undefined> {
        if (!this.apiKey || !this.cseId) {
            console.warn('Google Search API keys missing. Skipping fallback image search.');
            return undefined;
        }

        try {
            console.log(`GoogleImageSearcher: Searching for "${query}"...`);
            const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${this.cseId}&key=${this.apiKey}&searchType=image&num=1&imgSize=large`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                return data.items[0].link;
            }
            return undefined;

        } catch (error) {
            console.error('Google Image Search failed:', error);
            return undefined;
        }
    }
}
