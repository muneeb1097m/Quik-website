import { GoogleGenerativeAI } from '@google/generative-ai';
import { stripHtml, decodeHtmlEntities } from '@/lib/utils';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are the Senior Executive Editor of "Quik Intelligence". Your mission is to synthesize raw news reporting into rich, authoritative, highly-structured intelligence reports.

    TONE & EDITORIAL STANDARDS:
    1. **Anti-AI Persona**: Strictly avoid generic AI clichés and buzzwords.
       - BANNED WORDS/PHRASES: "Delve", "Leverage", "Revolutionize", "Game-changer", "Foster", "Spearhead", "In the rapidly evolving landscape", "Unlock", "Seamless", "Testament to", "A beacon of".
    2. **Factual & Authoritative**: Write with journalistic precision like Bloomberg Terminal, Financial Times, or Reuters.
    3. **Evidence-Based Guardrails**:
       - Under NO circumstances should you speculate on predictions or manufacture quotes/facts.
       - Only include "Confirmed Next Steps" if verified launch dates, regulatory deadlines, or announced public plans exist in the source material.
    4. **Original Voice**: Synthesize as an objective Quik intelligence report without mentioning CTAs, subscription prompts, or self-promotional text.
    `
});

export class GeminiSynthesizer {

    async rewriteStory(rawHeadline: string, rawSnippet: string): Promise<{ headline: string, summary: string, category: string, fullReport: string }> {
        if (!API_KEY) {
            console.warn('GEMINI_API_KEY not found. Returning raw data.');
            const fallbackSummary = stripHtml(rawSnippet).slice(0, 150) + '...';
            return {
                headline: rawHeadline,
                summary: fallbackSummary,
                category: 'Technology',
                fullReport: stripHtml(rawSnippet)
            };
        }

        try {
            const prompt = `RAW HEADLINE: "${rawHeadline}"
RAW CONTENT: "${rawSnippet}"

TASK: Synthesize this into a structured, highly valuable Quik news intelligence report.

STRUCTURE REQUIREMENTS:
1. "headline": Factual, punchy, active-voice headline (25-90 characters). No clickbait.
2. "summary": Exactly 2 clear, informative sentences (40-80 words) summarizing the core event and its primary consequence.
3. "category": "Technology" | "Business" | "Pakistan" | "Global" | "Sports" | "AI" | "Auto" | "Startups"
4. "fullReport": Multi-section Markdown report:
   ### Key Developments
   - Bulleted breakdown of essential facts, numbers, dates, and confirmed announcements.
   
   ### Why It Matters
   - 1 concise paragraph explaining the strategic, economic, or technological significance.
   
   ### Background & Context
   - 1 concise paragraph providing relevant preceding history or context.
   
   ### Confirmed Next Steps (ONLY include if specific dates/deadlines/launches were mentioned in the source; otherwise omit entirely).

Format output STRICTLY as a JSON object:
{
  "headline": "...",
  "summary": "...",
  "category": "...",
  "fullReport": "..."
}`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Clean up JSON if it comes with markdown blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultJson = JSON.parse(cleanText);

            const headline = decodeHtmlEntities(resultJson.headline || rawHeadline);
            const summary = decodeHtmlEntities(resultJson.summary || stripHtml(rawSnippet).slice(0, 140));
            const category = resultJson.category || 'Technology';
            const fullReport = decodeHtmlEntities(resultJson.fullReport || stripHtml(rawSnippet));

            return {
                headline,
                summary,
                category,
                fullReport
            };

        } catch (error) {
            console.error('Gemini Synthesis Error:', error);
            return {
                headline: rawHeadline,
                summary: stripHtml(rawSnippet).slice(0, 140),
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
            const prompt = `From the following list of news articles, identify the SINGLE most high-impact, trending, or significant story for an international audience interested in Global Affairs, Technology, AI, Innovation, and Business. 
            Prioritize global breaking news, major tech advancements, and world business trends. Regional/local stories should only be selected if they represent major historic events.
            
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
            const prompt = `Extract a single, 2-word visual keyword from this headline for an image search. 
            Headline: "${headline}"
            Output (Just the words):`;

            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        } catch {
            return 'Technology';
        }
    }
}
