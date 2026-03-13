import { NextRequest, NextResponse } from 'next/server';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Get Cloudflare context (env bindings)
        // Ensure you have an AI binding in wrangler.toml
        const ctx = getRequestContext();
        if (!ctx.env.AI) {
            console.error('AI binding not found in Cloudflare Environment');
            // Fallback mock response for local dev without Wrangler
            return NextResponse.json({
                role: 'model',
                content: 'I am running locally without Cloudflare AI bindings. Please deploy or run via Wrangler.'
            });
        }

        // Cloudflare Workers AI expects messages in { role: 'user' | 'assistant' | 'system', content: 'string' }
        const cfMessages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant for Quik, an AI-powered global news website. You answer questions about news, current events, technology, and summarize articles. Be concise, objective, and helpful.'
            },
            ...messages.map((msg: any) => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content
            }))
        ];

        // Call the LLaMA-3 model using Cloudflare Workers AI
        const response = await ctx.env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: cfMessages,
        });

        // @ts-ignore - response.response exists on standard generation types
        const responseText = response.response || (response as any).result?.response;

        return NextResponse.json({
            role: 'model',
            content: responseText || "I couldn't process that request right now."
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}
