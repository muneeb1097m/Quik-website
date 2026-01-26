import { NextRequest, NextResponse } from 'next/server';
import { detectIntent } from '@/lib/chatbot/intent-detector';
import { findFAQMatch } from '@/lib/chatbot/faq';
import { searchNews } from '@/lib/chatbot/news-search';
import { ChatbotAgent } from '@/lib/qie/gemini';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequest {
    message: string;
    conversationHistory?: ChatMessage[];
}

// Rate limiting helper (simple in-memory, upgrade to Redis/KV for production)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 messages per minute

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];

    // Remove old timestamps
    const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

    if (recentTimestamps.length >= RATE_LIMIT_MAX) {
        return false;
    }

    recentTimestamps.push(now);
    rateLimitMap.set(ip, recentTimestamps);
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { error: 'Rate limit exceeded. Please wait a moment before sending more messages.' },
                { status: 429 }
            );
        }

        const body: ChatRequest = await request.json();
        const { message, conversationHistory = [] } = body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Invalid message' },
                { status: 400 }
            );
        }

        // Detect user intent
        const intentResult = detectIntent(message);

        let response: string;
        let articles: any[] = [];
        let requiresEmail = false;

        switch (intentResult.intent) {
            case 'FAQ': {
                // Try to find FAQ match
                const faqResponse = findFAQMatch(message);
                if (faqResponse) {
                    response = faqResponse;

                    // Check if this FAQ triggers lead capture
                    if (faqResponse.includes('Please share your email') || faqResponse.includes('provide your email')) {
                        requiresEmail = true;
                    }
                } else {
                    // Fallback to AI if no FAQ match
                    const chatbot = new ChatbotAgent();
                    const context = conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`);
                    response = await chatbot.respondToUser(message, context);
                }
                break;
            }

            case 'NEWS_SEARCH': {
                const searchResult = await searchNews(message, intentResult.metadata?.category);
                response = searchResult.message;
                articles = searchResult.articles;
                break;
            }

            case 'BUSINESS_INQUIRY': {
                response = "I'd love to help with your business inquiry! To connect you with our team, please provide your email address and a brief description of what you're interested in (advertising, partnership, or other).";
                requiresEmail = true;
                break;
            }

            case 'GENERAL':
            default: {
                // Use AI for general conversation
                const chatbot = new ChatbotAgent();
                const context = conversationHistory.slice(-5).map(m => `${m.role}: ${m.content}`);
                response = await chatbot.respondToUser(message, context);
                break;
            }
        }

        return NextResponse.json({
            response,
            intent: intentResult.intent,
            articles: articles.length > 0 ? articles : undefined,
            requiresEmail,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
