'use client';

import { SignalCard } from '@/components/SignalCard';
import { Car, Cpu, Globe, Trophy } from 'lucide-react';
import { NewsEvent, Signal } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LandingPageProps {
    signals: Signal[];
    events: NewsEvent[]; // Passing all events for lookup
    // trending: Signal[]; // Not used in the UI directly, derived data passed as `mainStory` etc.
    mainStory: Signal | undefined;
    mainStoryEvent: NewsEvent | undefined;
    gridStories: Signal[];
    sideStories: Signal[];
}

// Internal component for Grid Stories to handle their own image error state
const GridStoryCard = ({ story, event }: { story: Signal, event: NewsEvent | undefined }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <Link href={`/news/${story.id}`} className="relative flex-1 group cursor-pointer overflow-hidden rounded-[2rem] bg-slate-900 p-8 flex flex-col justify-end shadow-sm hover:shadow-lg transition-all min-h-[260px]">
            {/* Background Image */}
            <div className="absolute inset-0 bg-slate-800">
                {!imageError && story.imageUrl ? (
                    <Image
                        src={story.imageUrl}
                        alt={story.headline}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        onError={() => setImageError(true)}
                        className="object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    // Fallback "Smart" Image based on Category/Keywords
                    <div className="w-full h-full relative overflow-hidden bg-slate-100">
                        <img
                            src={(() => {
                                const text = (story.headline + ' ' + (event?.category || '')).toLowerCase();
                                if (text.includes('finance') || text.includes('stock') || text.includes('economy') || text.includes('market') || text.includes('bank'))
                                    return "https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=2940&auto=format&fit=crop";
                                if (text.includes('tech') || text.includes('ai') || text.includes('cyber') || text.includes('digital') || text.includes('crypto'))
                                    return "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop";
                                if (text.includes('sport') || text.includes('cricket') || text.includes('football'))
                                    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2940&auto=format&fit=crop";
                                if (text.includes('politics') || text.includes('govt') || text.includes('minister'))
                                    return "https://images.unsplash.com/photo-1529101091760-61df6be34fc8?q=80&w=2940&auto=format&fit=crop";

                                return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2940&auto=format&fit=crop";
                            })()}
                            alt="News Fallback"
                            className="w-full h-full object-cover opacity-50 grayscale contrast-125"
                            onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2940&auto=format&fit=crop";
                            }}
                        />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            </div>

            <div className="relative z-10 glass-panel w-fit px-3 py-1 rounded-full text-[10px] font-bold text-white bg-black/60 backdrop-blur-md mb-3 border border-white/20 shadow-sm">
                {event?.category || 'News'}
            </div>

            <h3 className="relative z-10 text-2xl font-extrabold text-white leading-tight drop-shadow-lg line-clamp-3">
                {story.headline}
            </h3>
            <div className="relative z-10 mt-3 flex items-center gap-2 text-slate-300 text-xs font-medium">
                <span suppressHydrationWarning>{new Date(story.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
        </Link>
    );
};

export function LandingPage({ signals, events, mainStory, mainStoryEvent, gridStories, sideStories }: LandingPageProps) {

    const getEvent = (id: string) => events.find(e => e.id === id);
    const [mainImageError, setMainImageError] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-brand-green/20 selection:text-slate-900">

            {/* Ambient Light Orbs - Optimized using CSS Animation instead of JS Motion Loop */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[60px] animate-pulse-slow" />
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[50px] animate-pulse-slower" />
            </div>

            <main className="max-w-[1600px] mx-auto px-4 md:px-8 pt-24 lg:pt-40 pb-20 relative z-10">

                {/* HERO: Asymmetrical Bento Grid - RESTORED INSTANT RENDER (LCP FIX) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-auto min-h-[500px] lg:h-[600px] mb-12 lg:mb-20">

                    {/* Main Card (Left) */}
                    <div className="lg:col-span-8 h-[500px] lg:h-full block">
                        <Link href={mainStory ? `/news/${mainStory.id}` : '#'} className="block h-full">
                            <div className="relative group cursor-pointer overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-900 shadow-sm hover:shadow-2xl hover:shadow-brand-green/10 transition-all duration-700 h-full">
                                {/* Static Image Container - No Framer Motion Delay */}
                                <div className="absolute inset-0 overflow-hidden transform transition-transform duration-1000 group-hover:scale-105">
                                    {mainStory ? (
                                        !mainImageError && mainStory.imageUrl ? (
                                            <Image
                                                src={mainStory.imageUrl}
                                                alt={mainStory.headline}
                                                fill
                                                priority={true} // Critical for LCP
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                                className="object-cover opacity-90"
                                                onError={() => setMainImageError(true)}
                                            />
                                        ) : (
                                            <Image
                                                src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2940&auto=format&fit=crop"
                                                alt="News Fallback"
                                                fill
                                                priority={true}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                                className="object-cover opacity-40 grayscale contrast-125"
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-slate-800" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90 pointer-events-none" />
                                </div>

                                {mainStory && (
                                    <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end">
                                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                                            <div className="glass-panel px-4 py-1.5 rounded-full border-white/20 bg-black/60 text-white text-xs md:text-sm font-bold shadow-sm backdrop-blur-md">
                                                {mainStoryEvent?.category || 'Trending'}
                                            </div>
                                        </div>
                                        <div className="overflow-hidden">
                                            <h2 className="text-3xl md:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] md:leading-[1] max-w-4xl tracking-tight mb-4 md:mb-6 drop-shadow-xl">
                                                {mainStory.headline}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-4 text-slate-300 font-medium text-sm md:text-base">
                                            <span>{mainStoryEvent?.sources[0]?.name || 'N/A'}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                                            <span suppressHydrationWarning>{new Date(mainStory.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Sub Grid (Right) */}
                    <div className="lg:col-span-4 flex flex-col md:flex-row lg:flex-col gap-4 md:gap-6 h-auto lg:h-full">
                        {gridStories.map((story) => {
                            const evt = story.event || getEvent(story.eventId);
                            return (
                                <div key={story.id} className="flex-1 min-h-[260px]">
                                    <GridStoryCard story={story} event={evt} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Lower Section Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    <div className="lg:col-span-8">
                        <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-6 md:mb-8 flex items-center gap-3">
                            <Cpu className="w-6 h-6 text-slate-400" />
                            Raw Feed
                        </h3>
                        {/* Performance: Removed expensive framer-motion stagger animations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {signals.map((signal, index) => {
                                // Use the event embedded in signal if available, otherwise look it up
                                // If still not found, we don't hide it anymore per user request, we just fallback
                                const event = signal.event || getEvent(signal.eventId) || {
                                    id: 'unknown',
                                    title: 'News',
                                    category: 'Technology', // Default generic
                                    status: 'Live',
                                    detectedAt: new Date(),
                                    lastUpdatedAt: new Date(),
                                    confidenceScore: 0,
                                    sources: []
                                } as any as NewsEvent;

                                // Make every 5th card span full width for variety
                                const isWide = (index + 1) % 5 === 0;

                                return (
                                    <div
                                        key={signal.id}
                                        className={isWide ? 'md:col-span-2' : ''}
                                    >
                                        <SignalCard signal={signal} event={event} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-8">
                            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/50 backdrop-blur-xl">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Most Read Today
                                </h3>
                                <div className="space-y-6">
                                    {sideStories.map((story, i) => (
                                        <Link key={story.id} href={`/news/${story.id}`} className="block relative z-10">
                                            <div className="group cursor-pointer mb-6 last:mb-0">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-bold text-brand-red">Global</span>
                                                    <span className="text-xs text-slate-300">•</span>
                                                    <span className="text-xs text-slate-500" suppressHydrationWarning>
                                                        {new Date(story.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                                                    {story.headline}
                                                </h4>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
