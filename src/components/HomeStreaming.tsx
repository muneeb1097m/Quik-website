import { db } from '@/lib/qie/db';
import { SignalCard } from './SignalCard';
import { serialize, decodeHtmlEntities, getNewsUrl } from '@/lib/utils';
import { Cpu, Globe } from 'lucide-react';
import Link from 'next/link';

export async function RawFeedSection() {
    // Fetch signals inside the component to enable streaming
    const signals = await db.getSignals(undefined, 20);
    const serializedSignals = serialize(signals);

    if (serializedSignals.length === 0) return null;

    return (
        <div className="lg:col-span-8">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
                <Cpu className="w-6 h-6 text-slate-400" />
                Latest Updates
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {serializedSignals.map((signal: any, index: number) => {
                    const isWide = (index + 1) % 5 === 0;
                    return (
                        <div key={signal.id} className={isWide ? 'md:col-span-2' : ''}>
                            <SignalCard signal={signal} event={signal.event} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export async function SidebarSection() {
    // Fetch trending for sidebar
    const trending = await db.getSignals('Global', 5);
    const serializedTrending = serialize(trending);

    if (serializedTrending.length === 0) return null;

    return (
        <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-8">
                <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/50 backdrop-blur-xl">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Most Read Today
                    </h3>
                    <div className="space-y-6">
                        {serializedTrending.map((story: any) => (
                            <Link key={story.id} href={getNewsUrl(story)} className="block relative z-10">
                                <div className="group cursor-pointer mb-6 last:mb-0">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-xs font-bold text-brand-red">{story.event?.category || 'Global'}</span>
                                        <span className="text-xs text-slate-300">•</span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(story.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                                        {decodeHtmlEntities(story.headline)}
                                    </h4>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
