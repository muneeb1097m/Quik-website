'use client';

import { SignalCard } from '@/components/SignalCard';
import { Car, Cpu, Globe, Trophy } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { NewsEvent, Signal } from '@/types';
import { useState } from 'react';
import Link from 'next/link';

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
                    <img
                        src={story.imageUrl}
                        alt={story.headline}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
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

            <div className="relative z-10 glass-panel w-fit px-3 py-1 rounded-full text-[10px] font-bold text-white bg-white/10 backdrop-blur-md mb-3 border border-white/20">
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

// Animation Variants
// Animation Variants
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const textReveal: Variants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { duration: 0.5, ease: "circOut" } }
};

export function LandingPage({ signals, events, mainStory, mainStoryEvent, gridStories, sideStories }: LandingPageProps) {

    const getEvent = (id: string) => events.find(e => e.id === id);
    const [mainImageError, setMainImageError] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans selection:bg-brand-green/20 selection:text-slate-900">

            {/* Ambient Light Orbs - Subtle & Soft */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-brand-green/5 rounded-full blur-[120px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.4, 0.3],
                        y: [0, 50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-[100px]"
                />
            </div>

            <main className="max-w-[1600px] mx-auto px-8 pt-40 pb-20 relative z-10">

                {/* HERO: Asymmetrical Bento Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid lg:grid-cols-12 gap-6 h-[600px] mb-20"
                >

                    {/* Main Card (Left) */}
                    <div className="lg:col-span-8 h-full block">
                        <Link href={mainStory ? `/news/${mainStory.id}` : '#'} className="block h-full">
                            <motion.div
                                variants={fadeInUp}
                                className="relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-sm hover:shadow-2xl hover:shadow-brand-green/10 transition-all duration-700 h-full"
                            >
                                {/* Parallax Image Container */}
                                <div className="absolute inset-0 overflow-hidden">
                                    {mainStory ? (
                                        !mainImageError && mainStory.imageUrl ? (
                                            <motion.img
                                                src={mainStory.imageUrl}
                                                alt={mainStory.headline}
                                                onError={() => setMainImageError(true)}
                                                className="w-full h-full object-cover opacity-90"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        ) : (
                                            <motion.img
                                                src="https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=2940&auto=format&fit=crop"
                                                alt="News Fallback"
                                                className="w-full h-full object-cover opacity-40 grayscale contrast-125"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                            />
                                        )
                                    ) : (
                                        <div className="w-full h-full bg-slate-800" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-90" />
                                </div>

                                {mainStory && (
                                    <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="flex items-center gap-3 mb-6"
                                        >
                                            <div className="glass-panel px-4 py-1.5 rounded-full border-brand-green/20 bg-brand-green/10 text-white text-sm font-bold shadow-[0_0_20px_rgba(255,236,215,0.2)] backdrop-blur-md">
                                                {mainStoryEvent?.category || 'Trending'}
                                            </div>
                                        </motion.div>
                                        <div className="overflow-hidden">
                                            <motion.h2
                                                initial={{ y: "100%" }}
                                                animate={{ y: 0 }}
                                                transition={{ duration: 0.8, ease: "circOut", delay: 0.2 }}
                                                className="text-5xl lg:text-7xl font-extrabold text-white leading-[1] max-w-4xl tracking-tight mb-6 drop-shadow-xl"
                                            >
                                                {mainStory.headline}
                                            </motion.h2>
                                        </div>
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.6 }}
                                            className="flex items-center gap-4 text-slate-300 font-medium"
                                        >
                                            <span>{mainStoryEvent?.sources[0]?.name || 'N/A'}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-400" />
                                            <span suppressHydrationWarning>{new Date(mainStory.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                        </motion.div>
                                    </div>
                                )}
                            </motion.div>
                        </Link>
                    </div>

                    {/* Sub Grid (Right) */}
                    <motion.div
                        variants={staggerContainer}
                        className="lg:col-span-4 flex flex-col gap-6 h-full"
                    >
                        {gridStories.map((story) => {
                            const evt = getEvent(story.eventId);
                            return (
                                <motion.div variants={fadeInUp} key={story.id} className="flex-1">
                                    <GridStoryCard story={story} event={evt} />
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </motion.div>

                {/* Lower Section Feed */}
                <div className="grid lg:grid-cols-12 gap-12">

                    <div className="lg:col-span-8">
                        <motion.h3
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3"
                        >
                            <Cpu className="w-6 h-6 text-slate-400 animate-pulse" />
                            Raw Feed
                        </motion.h3>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {signals.map((signal, index) => {
                                const event = getEvent(signal.eventId);
                                if (!event) return null;

                                // Make every 5th card span full width for variety
                                const isWide = (index + 1) % 5 === 0;

                                return (
                                    <motion.div
                                        key={signal.id}
                                        variants={fadeInUp}
                                        className={isWide ? 'md:col-span-2' : ''}
                                        whileHover={{ y: -5 }}
                                    >
                                        <SignalCard signal={signal} event={event} />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-28 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="glass-panel rounded-3xl p-8 border border-slate-200 bg-white/50 backdrop-blur-xl"
                            >
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    Most Read Today
                                </h3>
                                <div className="space-y-6">
                                    {sideStories.map((story, i) => (
                                        <Link key={story.id} href={`/news/${story.id}`} className="block relative z-10">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.05 * i }}
                                                className="group cursor-pointer mb-6 last:mb-0"
                                            >
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
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
