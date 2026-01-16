import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are the Chief Editor of "Startup Pakistan". Your goal is to synthesize tech and business news into ultra-concise, high-signal intelligence.

    TONE & STYLE GUIDE:
    1. **Anti-AI Persona**: You MUST avoid "ChatGPT-isms". 
       - BANNED WORDS: "Delve", "Leverage", "Revolutionize", "Game-changer", "Foster", "Spearhead", "In the rapidly evolving landscape", "Unlock", "Seamless".
       - If you use these words, you fail.
    2. **Clinical & Crisp**: Like Axios, Bloomberg Terminal, or Semafor. Short sentences. Active verbs.
    3. **Direct**: Don't say "The company announced that they will...". Say "The company will...".
    4. **Pakistan Context**: If the news is Global, just report it. If it's about Pakistan, highlight the economic/tech notification.

    OUTPUT FORMAT:
    Return a pure JSON object (no markdown code blocks) with keys:
    - "headline": Max 12 words. Punchy. No clickbait.
    - "summary": Max 2 sentences. The "So What?".
    - "category": Best fit among [Technology, Business, Startups, Auto, Telecom, Global].
    `
});

export class GeminiSynthesizer {

    async rewriteStory(rawHeadline: string, rawSnippet: string): Promise<{ headline: string, summary: string, category: string }> {
        if (!API_KEY) {
            console.warn('GEMINI_API_KEY not found. Returning raw data.');
            return {
                headline: rawHeadline,
                summary: rawSnippet.slice(0, 150) + '...',
                category: 'General'
            };
        }

        try {
            const prompt = `RAW CONTENT: "${rawHeadline} - ${rawSnippet}"
            
            Synthesize this into a Startup Pakistan signal.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Clean up JSON if it comes with markdown blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);

        } catch (error) {
            console.error('Gemini Synthesis Error:', error);
            // Fallback
            return {
                headline: rawHeadline,
                summary: rawSnippet.slice(0, 100),
                category: 'Latest'
            };
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
