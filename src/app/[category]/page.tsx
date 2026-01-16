import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { notFound } from 'next/navigation';
import { NewsEvent } from '@/types';

export async function generateStaticParams() {
    return [
        { category: 'tech' },
        { category: 'business' },
        { category: 'telecom' },
        { category: 'global' },
        { category: 'auto' },
        { category: 'pakistan' },
        { category: 'sports' },
    ];
}

interface PageProps {
    params: Promise<{ category: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    const signals = await db.getSignals(category);

    if (!signals.length) {
        // Ideally duplicate mock data for demo if empty, 
        // but db.ts logic handles these categories now.
    }

    const title = category.charAt(0).toUpperCase() + category.slice(1);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-20 relative z-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-8 border-b border-slate-200 pb-4">
                    {category === 'pakistan' ? 'Startup Pakistan' : title} News
                </h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    {signals.map(signal => {
                        const event = signal.event as unknown as NewsEvent;
                        if (!event) return null;
                        return <SignalCard key={signal.id} signal={signal} event={event} />;
                    })}
                    {signals.length === 0 && (
                        <p className="text-slate-500">No signals detected for this category primarily.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
