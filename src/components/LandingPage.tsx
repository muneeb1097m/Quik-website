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
    mainStory: Signal | undefined;
    mainStoryEvent: NewsEvent | undefined;
    gridStories: Signal[];
    children: React.ReactNode;
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
                        unoptimized={true}
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
                <span suppressHydrationWarning>
                    {(() => {
                        const d = new Date(story.generatedAt || Date.now());
                        return isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    })()}
                </span>
            </div>
        </Link>
    );
};

export function LandingPage({ mainStory, mainStoryEvent, gridStories, children }: LandingPageProps) {
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
                                                unoptimized={true}
                                                priority={true} // Critical for LCP
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
                                            <span suppressHydrationWarning>
                                                {(() => {
                                                    const d = new Date(mainStory.generatedAt || Date.now());
                                                    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                                })()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Sub Grid (Right) */}
                    <div className="lg:col-span-4 flex flex-col md:flex-row lg:flex-col gap-4 md:gap-6 h-auto lg:h-full">
                        {gridStories.map((story) => {
                            const evt = (story as any).event;
                            return (
                                <div key={story.id} className="flex-1 min-h-[260px]">
                                    <GridStoryCard story={story} event={evt} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content injected via Streaming Server Components */}
                {children}

            </main>
        </div>
    );
}
