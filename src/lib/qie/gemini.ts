import { GoogleGenerativeAI } from '@google/generative-ai';
import { stripHtml, decodeHtmlEntities } from '@/lib/utils';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-3.6-flash',
    systemInstruction: `You are the Chief Investigative Editor and Senior Columnist of "Quik News". Your mission is to write authoritative, comprehensive, in-depth journalistic news analysis articles (600 - 1,000 words). Every article must be thorough, analytical, engaging, and structured with rich Markdown headings to satisfy the highest Google Search, Google News, and E-E-A-T editorial standards.

    TONE & EDITORIAL STANDARDS:
    1. **Anti-AI Persona**: Write like a veteran Financial Times, Bloomberg, or Reuters investigative journalist. Strictly avoid AI clichés: "Delve", "Leverage", "Revolutionize", "Game-changer", "Foster", "Spearhead", "In the rapidly evolving landscape", "Unlock", "Seamless", "Testament to", "A beacon of".
    2. **Substance & Depth**: Never write superficial snippets or 2-sentence summaries. Explore root causes, key stakeholders, concrete statistics, broader economic/market impacts, and historical context.
    3. **Evidence-Based Guardrails**: Ground all facts, figures, and direct quotes in the reported facts. Frame broader insights as analytical context.
    4. **Original Voice**: Produce an independent, authoritative Quik News intelligence report without boilerplate artifacts ("Read more...", "The post appeared first on...").
    `
});

export class GeminiSynthesizer {

    async rewriteStory(rawHeadline: string, rawSnippet: string): Promise<{ headline: string, summary: string, category: string, fullReport: string }> {
        const cleanedSnippet = stripHtml(rawSnippet)
            .replace(/The post .* appeared first on .*/gi, '')
            .replace(/Read More\s*.*/gi, '')
            .trim();

        if (!API_KEY) {
            console.warn('GEMINI_API_KEY not found. Returning raw data.');
            const fallbackSummary = cleanedSnippet.slice(0, 150) + '...';
            return {
                headline: rawHeadline,
                summary: fallbackSummary,
                category: 'Technology',
                fullReport: cleanedSnippet
            };
        }

        try {
            const prompt = `RAW HEADLINE: "${rawHeadline}"
RAW SOURCE CONTENT:
"${cleanedSnippet}"

TASK: Produce an exhaustive, full-length, comprehensive news analysis article (600 to 900+ words) suitable for Google News, Google Search indexing, and professional news readers.

STRUCTURE REQUIREMENTS:
1. "headline": Authoritative, factual, active-voice, SEO-optimized headline (35-90 characters). No clickbait.
2. "summary": A compelling 2-sentence executive summary (45-80 words) summarizing the core event and its primary consequence.
3. "category": "Technology" | "Business" | "Pakistan" | "Global" | "Sports" | "AI" | "Auto" | "Startups"
4. "fullReport": An extensive, high-value Markdown article (600 - 900+ words) strictly formatted with the following sections:
   
   Start directly with 2 to 3 rich, detailed introductory paragraphs explaining the news event, the main figures, the latest announcements, and the immediate context.
   
   ### Key Developments & Policy Breakdown
   - Provide 4 to 6 detailed bullet points breaking down specific data points, dates, policy decisions, and verified statements.
   
   ### In-Depth Analysis & Real-World Impact
   - 2 to 3 detailed paragraphs analyzing the economic, market, regulatory, or societal ripple effects. Explain what this means for stakeholders, consumers, or industry competitors.
   
   ### Background, Preceding Events & Historical Context
   - 2 detailed paragraphs explaining the broader history and timeline. Mention preceding policy shifts, previous market conditions, or earlier related developments.
   
   > [A compelling pull-quote or central takeaway summarizing the broader significance]
   
   ### Strategic Outlook & What to Watch Next
   - 2 detailed paragraphs analyzing upcoming implementation timelines, potential obstacles, upcoming regulatory decisions, or what readers should monitor in the coming weeks.

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
