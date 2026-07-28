import { GoogleGenerativeAI } from '@google/generative-ai';
import { stripHtml } from '@/lib/utils';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are the Senior Executive Editor of "Quik Intelligence". Your mission is to synthesize raw news into rich, highly-detailed, in-depth intelligence reports.

    TONE & STYLE GUIDE:
    1. **Anti-AI Persona**: Strictly avoid generic AI buzzwords.
       - BANNED WORDS: "Delve", "Leverage", "Revolutionize", "Game-changer", "Foster", "Spearhead", "In the rapidly evolving landscape", "Unlock", "Seamless".
    2. **Detailed & Authoritative**: Provide thorough context, key facts, figures, background details, and implications. Write like Bloomberg Terminal, Financial Times, or Semafor.
    3. **Multi-Paragraph Structure**: Write a complete, comprehensive report consisting of 3 to 5 distinct paragraphs separated by double line breaks (\n\n). Do NOT summarize in 1 short sentence!
    4. **Original Voice**: Write as an original Quik intelligence report. Never mention any source names, publishers, journalists, CTAs, or links.
    `
});

export class GeminiSynthesizer {

    async rewriteStory(rawHeadline: string, rawSnippet: string): Promise<{ headline: string, summary: string, category: string, fullReport: string }> {
        if (!API_KEY) {
            console.warn('GEMINI_API_KEY not found. Returning raw data.');
            return {
                headline: rawHeadline,
                summary: stripHtml(rawSnippet).slice(0, 150) + '...',
                category: 'General',
                fullReport: stripHtml(rawSnippet)
            };
        }

        try {
            const prompt = `RAW HEADLINE: "${rawHeadline}"
RAW CONTENT: "${rawSnippet}"

TASK: Synthesize this into a detailed, comprehensive Quik intelligence report.
Write an in-depth, multi-paragraph report (at least 250-400 words across 3-4 structured paragraphs separated by double newlines).
Include:
1. Main Event & Key Highlights (What happened in detail)
2. Critical Facts, Numbers, & Background Context
3. Strategic Impact / Why it matters for the industry or region

Format your output STRICTLY as a JSON object:
{
  "headline": "Punchy, accurate headline",
  "category": "Technology | Business | Pakistan | Global | Sports | AI | Auto | Startups",
  "fullReport": "Paragraph 1...\n\nParagraph 2...\n\nParagraph 3...\n\nParagraph 4..."
}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Clean up JSON if it comes with markdown blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultJson = JSON.parse(cleanText);
            return {
                headline: resultJson.headline || rawHeadline,
                summary: '',
                category: resultJson.category || 'Technology',
                fullReport: resultJson.fullReport || stripHtml(rawSnippet)
            };

        } catch (error) {
            console.error('Gemini Synthesis Error:', error);
            return {
                headline: rawHeadline,
                summary: stripHtml(rawSnippet).slice(0, 100),
                category: 'Technology',
                fullReport: stripHtml(rawSnippet)
            };
        }
    }

    async selectTrendingStory(items: { headline: string, contentSnippet: string }[]): Promise<number> {
        if (!API_KEY || items.length === 0) return 0;
        if (items.length === 1) return 0;

        try {
            const list = items.map((item, index) => `${index}: ${item.headline} - ${item.contentSnippet.slice(0, 100)}`).join('\n');
            const prompt = `From the following list of news articles, identify the SINGLE most "trending", high-impact, or significant story for a Pakistan-based tech/business audience. 
            Consider urgency, global/national importance, and relevance to technology/startups.
            
            ARTICLES:
            ${list}
            
            Return ONLY the index number (0, 1, 2, etc.) of the selected article. No text, just the number.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text().trim();
            const index = parseInt(text);

            if (isNaN(index) || index < 0 || index >= items.length) {
                console.warn(`Gemini returned invalid index: ${text}. Defaulting to 0.`);
                return 0;
            }

            return index;
        } catch (error) {
            console.error('Gemini Selection Error:', error);
            return 0;
        }
    }

    async extractVisualKeyword(headline: string): Promise<string> {
        if (!API_KEY) return 'Technology';

        try {
            const prompt = `Extract a single, 2-word visual keyword from this headline for a Google Image Search. 
            Headline: "${headline}"
            Output (Just the words):`;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch (e) {
            return 'Technology';
        }
    }
}



