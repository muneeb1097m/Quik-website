import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { NewsEvent } from '@/types';
import type { Metadata } from 'next';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
    title: 'Latest News & Signals | Quik',
    description: 'Browse the latest global news headlines and AI-synthesized intelligence updates on Quik.',
    openGraph: {
        title: 'Latest News & Signals | Quik',
        description: 'Browse the latest global news headlines and AI-synthesized intelligence updates on Quik.',
    },
    alternates: {
        canonical: 'https://quiknews.online/news',
    },
};

export default async function NewsIndexPage() {
    const signals = await db.getSignals(undefined, 40);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="max-w-[1400px] mx-auto px-6 pt-40 pb-20 relative z-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Latest News & Real-Time Signals
                </h1>
                <p className="text-slate-500 mb-8 text-lg">
                    Real-time global news intelligence, synthesized by AI.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {signals.map((signal: any) => {
                        const event = signal.event as unknown as NewsEvent;
                        if (!event) return null;
                        return <SignalCard key={signal.id} signal={signal as any} event={event} />;
                    })}
                    {signals.length === 0 && (
                        <p className="text-slate-500">No news signals available at the moment.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
