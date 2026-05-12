import { GoogleGenerativeAI } from '@google/generative-ai';
import { stripHtml } from '@/lib/utils';

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: `You are the Chief Editor of "Quik". Your goal is to synthesize tech and business news into ultra-concise, high-signal intelligence.

    TONE & STYLE GUIDE:
    1. **Anti-AI Persona**: You MUST avoid "ChatGPT-isms". 
       - BANNED WORDS: "Delve", "Leverage", "Revolutionize", "Game-changer", "Foster", "Spearhead", "In the rapidly evolving landscape", "Unlock", "Seamless".
    2. **Clinical & Crisp**: Like Axios, Bloomberg Terminal, or Semafor. Short sentences. Active verbs.
    3. **Direct**: Don't say "The company announced that they will...". Say "The company will...".
    
    CRITICAL CONSTRAINTS (QUALITY CONTROL):
    - **NO ATTRIBUTIONS**: Do NOT mention ANY source, publisher, or platform name (e.g., Dawn, Reuters, TechCrunch, ProPakistani). 
    - **NO SOURCE LINKS/CTAs**: Strictly forbidden to invite users to "follow", "visit", "view more on", or "subscribe to" any external platform.
    - **NO AUTHOR BIOS**: Delete any mentions of authors, journalists, or contributors.
    - **NO HALLUCINATIONS**: Discard boilerplate content.
    
    BANNED CONTENT PATTERNS (REMOVE IMMEDIATELY):
    - "Get the latest news from..."
    - "Follow us on..."
    - "Visit [Source] for more..."
    - "Reported by [Source]..."
    - "According to [Source]..."
    
    - **ORIGINAL PERSONA**: You are the SOLE CREATOR of this content. Do NOT synthesize as a "summary of someone else's work". Write as if the news was discovered, verified, and written entirely by the QuikNews team.
    
    The final output must read as an original Quik intelligence report. If a sentence contains a source name, DELETE the entire sentence. Never include links, CTAs, or source attributions.
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
                fullReport: stripHtml(rawSnippet) // Fallback to snippet
            };
        }

        try {
            const prompt = `RAW CONTENT: "${rawHeadline} - ${rawSnippet}"
            
            Synthesize this into a Quik intelligence signal.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Clean up JSON if it comes with markdown blocks
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const resultJson = JSON.parse(cleanText);
            return {
                ...resultJson,
                summary: '' // No longer generating summary
            };

        } catch (error) {
            console.error('Gemini Synthesis Error:', error);
            // Fallback
            return {
                headline: rawHeadline,
                summary: stripHtml(rawSnippet).slice(0, 100),
                category: 'Technology',
                fullReport: stripHtml(rawSnippet) // Fallback to snippet if failed
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



