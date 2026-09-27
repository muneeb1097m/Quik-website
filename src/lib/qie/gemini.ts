import { GoogleGenerativeAI } from '@google/generative-ai';
import { stripHtml, decodeHtmlEntities } from '@/lib/utils';

// Ordered by speed, quota availability, and reliability
const CANDIDATE_MODELS = [
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.6-flash',
];

const SYSTEM_INSTRUCTION = `You are the Chief Investigative Editor and Senior Columnist of "Quik News". Your mission is to write authoritative, comprehensive, in-depth journalistic news analysis articles (650 - 1,000 words). Every article must be thorough, analytical, engaging, and structured with rich Markdown headings to satisfy the highest Google Search, Google News, and E-E-A-T editorial standards.

TONE & EDITORIAL STANDARDS:
1. **Anti-AI Persona**: Write like a veteran Financial Times, Bloomberg, or Reuters investigative journalist. Strictly avoid AI clichés: "Delve", "Leverage", "Revolutionize", "Game-changer", "Foster", "Spearhead", "In the rapidly evolving landscape", "Unlock", "Seamless", "Testament to", "A beacon of".
2. **Substance & Depth**: Never write superficial snippets or short 2-sentence summaries. Explore root causes, key stakeholders, concrete statistics, broader economic/market impacts, and historical context.
3. **Evidence-Based Guardrails**: Ground all facts, figures, and direct quotes in the reported facts. Frame broader insights as analytical context.
4. **Original Voice**: Produce an independent, authoritative Quik News intelligence report without boilerplate artifacts ("Read more...", "The post appeared first on...").
`;

export class GeminiSynthesizer {
    private getApiKey(): string {
        return (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
    }

    private getGenAI(): GoogleGenerativeAI | null {
        const key = this.getApiKey();
        if (!key) return null;
        return new GoogleGenerativeAI(key);
    }

    private async callWithModelFallback<T>(
        executor: (modelName: string, genAI: GoogleGenerativeAI) => Promise<T>
    ): Promise<T> {
        const genAI = this.getGenAI();
        if (!genAI) {
            throw new Error('GEMINI_API_KEY or GOOGLE_API_KEY is not configured.');
        }

        let lastError: any = null;

        for (const modelName of CANDIDATE_MODELS) {
            try {
                return await executor(modelName, genAI);
            } catch (err: any) {
                const errMsg = err?.message || String(err);
                console.warn(`[Gemini Fallback] Model "${modelName}" failed (${errMsg.slice(0, 120)}...). Trying next model...`);
                lastError = err;
            }
        }

        throw lastError || new Error('All candidate Gemini models failed.');
    }

    async rewriteStory(
        rawHeadline: string,
        rawSnippet: string
    ): Promise<{ headline: string; summary: string; category: string; fullReport: string; wordCount: number }> {
        const cleanedSnippet = stripHtml(rawSnippet)
            .replace(/The post .* appeared first on .*/gi, '')
            .replace(/Read More\s*.*/gi, '')
            .trim();

        const prompt = `RAW HEADLINE: "${rawHeadline}"
RAW SOURCE CONTENT:
"${cleanedSnippet}"

TASK: Produce an exhaustive, full-length, comprehensive news analysis article (650 to 950+ words) suitable for Google News, Google Search indexing, and professional news readers.

STRUCTURE REQUIREMENTS:
1. "headline": Authoritative, factual, active-voice, SEO-optimized headline (35-90 characters). No clickbait.
2. "summary": A compelling 2-sentence executive summary (45-80 words) summarizing the core event and its primary consequence.
3. "category": "Technology" | "Business" | "Pakistan" | "Global" | "Sports" | "AI" | "Auto" | "Startups"
4. "fullReport": An extensive, high-value Markdown article (650 - 950+ words) strictly formatted with the following sections:
   
   Start directly with 2 to 3 rich, detailed introductory paragraphs explaining the news event, the key figures/organizations involved, the latest announcements, and the immediate context.
   
   ### Key Developments & Policy Breakdown
   - Provide 4 to 6 detailed bullet points breaking down specific data points, dates, policy decisions, and verified statements.
   
   ### In-Depth Analysis & Real-World Impact
   - 2 to 3 detailed paragraphs analyzing the economic, market, regulatory, or societal ripple effects. Explain what this means for stakeholders, consumers, or industry competitors.
   
   ### Background, Preceding Events & Historical Context
   - 2 detailed paragraphs explaining the broader history and timeline. Mention preceding policy shifts, previous market conditions, or earlier related developments.
   
   > [A compelling pull-quote or central takeaway summarizing the broader significance]
   
   ### Strategic Outlook & What to Watch Next
   - 2 detailed paragraphs analyzing upcoming implementation timelines, potential obstacles, upcoming regulatory decisions, or what readers should monitor in the coming weeks.

CRITICAL REQUIREMENT: "fullReport" MUST be a detailed, rich, multi-paragraph markdown article with at least 600 words. Do not truncate.`;

        try {
            const parsed = await this.callWithModelFallback(async (modelName, genAI) => {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: SYSTEM_INSTRUCTION,
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.65,
                    },
                });

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                
                let json: any;
                try {
                    json = JSON.parse(text);
                } catch {
                    const cleaned = text
                        .replace(/```json/gi, '')
                        .replace(/```/gi, '')
                        .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, ' ')
                        .trim();
                    json = JSON.parse(cleaned);
                }

                if (!json.fullReport || typeof json.fullReport !== 'string') {
                    throw new Error('Gemini response missing valid fullReport property.');
                }

                const words = json.fullReport.split(/\s+/).filter(Boolean).length;
                if (words < 350) {
                    throw new Error(`Generated fullReport is too short (${words} words). Minimum required is 400 words.`);
                }

                return {
                    headline: decodeHtmlEntities(json.headline || rawHeadline),
                    summary: decodeHtmlEntities(json.summary || ''),
                    category: json.category || 'Technology',
                    fullReport: decodeHtmlEntities(json.fullReport),
                    wordCount: words,
                };
            });

            return parsed;
        } catch (error) {
            console.error('[Gemini Synthesis Error]: All models failed or produced substandard length:', error);
            throw error; // Re-throw so caller knows NOT to publish incomplete 30-word snippet
        }
    }

    async selectTrendingStory(items: { headline: string; contentSnippet: string }[]): Promise<number> {
        if (items.length <= 1) return 0;

        try {
            const list = items
                .map((item, index) => `${index}: ${item.headline} - ${item.contentSnippet.slice(0, 100)}`)
                .join('\n');
            const prompt = `From the following list of news articles, identify the SINGLE most high-impact, trending, or significant story for an international audience interested in Global Affairs, Technology, AI, Innovation, and Business. 
Prioritize global breaking news, major tech advancements, and world business trends. Regional/local stories should only be selected if they represent major historic events.

ARTICLES:
${list}

Return ONLY the index number (0, 1, 2, etc.) of the selected article. No text, just the number.`;

            return await this.callWithModelFallback(async (modelName, genAI) => {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();
                const index = parseInt(text, 10);

                if (isNaN(index) || index < 0 || index >= items.length) {
                    return 0;
                }
                return index;
            });
        } catch (error) {
            console.error('[Gemini Selection Error]:', error);
            return 0;
        }
    }

    async extractVisualKeyword(headline: string): Promise<string> {
        try {
            const prompt = `Extract a single, 2-word visual keyword from this headline for an image search.
Headline: "${headline}"
Output (Just the 2 words):`;

            return await this.callWithModelFallback(async (modelName, genAI) => {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                return result.response.text().trim() || 'Technology';
            });
        } catch {
            return 'Technology';
        }
    }
}

