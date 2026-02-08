'use client';

import { SignalCard } from '@/components/SignalCard';
import { Car, Cpu, Globe, Trophy } from 'lucide-react';
import { NewsEvent, Signal } from '@/types';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loadMoreSignals } from '@/app/actions';
import { Loader2 } from 'lucide-react';

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
                        unoptimized={true} // Vercel Free Tier Optimization
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
                                    return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2940&auto=format&fit=crop";
                                if (text.includes('tech') || text.includes('ai') || text.includes('cyber') || text.includes('digital') || text.includes('crypto'))
                                    return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop";
                                if (text.includes('sport') || text.includes('cricket') || text.includes('football'))
                                    return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2940&auto=format&fit=crop";
                                if (text.includes('politics') || text.includes('govt') || text.includes('minister'))
                                    return "https://images.unsplash.com/photo-1541872703-74c59636a226?q=80&w=2940&auto=format&fit=crop";

                                return "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop";
                            })()}
                            alt="News Fallback"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop";
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

    // Pagination State
    const [displayedSignals, setDisplayedSignals] = useState<Signal[]>(signals);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        try {
            const lastSignal = displayedSignals[displayedSignals.length - 1];
            const nextBatch = await loadMoreSignals(lastSignal?.id);

            if (nextBatch.length === 0) {
                setHasMore(false);
            } else {
                setDisplayedSignals(prev => [...prev, ...nextBatch as unknown as Signal[]]);
            }
        } catch (error) {
            console.error("Failed to load more:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

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
                                                unoptimized={true} // Vercel Free Tier Optimization
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                                className="object-cover opacity-90"
                                                onError={() => setMainImageError(true)}
                                            />
                                        ) : (
                                            <Image
                                                src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop"
                                                alt="News Fallback"
                                                fill
                                                priority={true}
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                                className="w-full h-full object-cover"
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
                            {displayedSignals.map((signal, index) => {
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

                        {/* Pagination / Load More */}
                        <div className="mt-12 flex justify-center">
                            {hasMore ? (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoadingMore}
                                    className="group relative px-8 py-4 bg-white border border-slate-200 rounded-full font-bold text-slate-900 shadow-sm hover:shadow-xl hover:border-brand-green/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
                                                <span>Loading stories...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Load More Stories</span>
                                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-brand-green/10 transition-colors">
                                                    <svg className="w-3 h-3 text-slate-500 group-hover:text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            ) : (
                                <div className="text-slate-400 text-sm font-medium py-4 px-8 bg-slate-100 rounded-full">
                                    You've reached the end
                                </div>
                            )}
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
