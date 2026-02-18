// @ts-nocheck
'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Clock, Share2, Shield, Calendar, Globe, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';

// Define Props - using 'any' to speed up migration, ideal would be full types
interface NewsDetailViewProps {
    signal: any;
    event: any;
    related: any[];
}

export default function NewsDetailView({ signal, event, related }: NewsDetailViewProps) {

    // --- CLIENT SIDE LOGIC ---
    const [copied, setCopied] = useState(false);
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Animation Variants
    // Animation Variants
    // Animation Variants
    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
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

    if (!signal || !event) return null; // Safety check

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-green/20 selection:text-slate-900">
            {/* Background Gradient Orbs - Optimized */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[60px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[60px] animate-pulse-slower" />
            </div>

            {/* Footer Navigation bar */}
            <motion.div
                style={{ opacity: headerOpacity }}
                className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between"
            >
                <Link href="/" className="font-bold text-slate-900 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                </Link>
                <div className="font-bold text-slate-900 truncate max-w-md">{signal.headline}</div>
                <div className="w-20" /> {/* Spacer */}
            </motion.div>

            <main ref={containerRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-20 relative z-10">

                {/* Back Link */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Intelligence Feed
                    </Link>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Context & Metadata */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="lg:col-span-4 space-y-6 lg:space-y-8 order-2 lg:order-1"
                    >
                        {/* Status Card - Sticky only on Desktop */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:sticky lg:top-8 relative z-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-brand-green fill-brand-green/20" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Verification Status</div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2">
                                        Verified Signal
                                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Detected</span>
                                    <span className="font-medium text-slate-900">12 mins ago</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Globe className="w-4 h-4" /> Sources</span>
                                    <span className="font-medium text-slate-900">{event.sources ? event.sources.length : 0} Independent</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Category</span>
                                    <span className="font-medium text-brand-blue px-2 py-0.5 bg-brand-blue/10 rounded-full">{event.category}</span>
                                </div>
                            </div>

                            {/* Share Button logic reused */}
                            <button
                                onClick={handleShare}
                                className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                            >
                                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                {copied ? 'Link Copied' : 'Share Intelligence'}
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <motion.article
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            {/* AI Badge */}
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <Sparkles className="w-32 h-32" />
                            </div>

                            {/* Header */}
                            <header className="mb-8 md:mb-10 relative z-10">
                                <motion.h1
                                    variants={fadeInUp}
                                    className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-4 md:mb-6 tracking-tight"
                                >
                                    {signal.headline}
                                </motion.h1>
                                <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
                                    {event.sources && event.sources.map((source: any) => (
                                        <div key={source.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            {source.name}
                                        </div>
                                    ))}
                                </motion.div>
                            </header>

                            {/* Main Image */}
                            {signal.imageUrl && (
                                <motion.div
                                    variants={fadeInUp}
                                    className="mb-8 md:mb-10 rounded-2xl md:rounded-3xl overflow-hidden relative aspect-video shadow-lg"
                                >
                                    <Image
                                        src={signal.imageUrl}
                                        alt={signal.headline}
                                        fill
                                        unoptimized={true}
                                        priority={true}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                        className="object-cover"
                                        onError={(e) => {
                                            // Next/Image onError handling is limited, usually parent div handles hiding
                                            // or we can use a state to switch to fallback, but for now we keep simple
                                        }}
                                    />
                                </motion.div>
                            )}

                            {/* Main Summary Box */}
                            <motion.div
                                variants={fadeInUp}
                                className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-6 md:p-8 mb-8 md:mb-10 relative"
                            >
                                <h3 className="text-brand-green font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Quik AI Summary
                                </h3>
                                <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed m-0 font-serif">
                                    {signal.summary}
                                </p>
                            </motion.div>

                            {/* Detailed Report */}
                            <div className="prose prose-base md:prose-lg text-slate-600 leading-relaxed max-w-none">
                                <motion.p variants={fadeInUp}>
                                    This report was automatically generated by the Quik Intelligence Engine (QIE).
                                    Our systems continuously monitor global events to bring you confirmed updates as they happen.
                                </motion.p>
                                {signal.fullReport && (
                                    <motion.div
                                        variants={fadeInUp}
                                        className="mt-12 pt-12 border-t border-slate-200"
                                    >
                                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Detailed Report</h3>
                                        <div className="space-y-6 text-base md:text-lg text-slate-700 leading-relaxed font-serif">
                                            {signal.fullReport.split('\n\n').map((para: string, i: number) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.article>

                        {/* Related Stories */}
                        {related.length > 0 && (
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                variants={staggerContainer}
                                className="mt-20"
                            >
                                <motion.h3 variants={fadeInUp} className="text-2xl font-bold text-slate-900 mb-8">Related Intelligence</motion.h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {related.map((item: any) => (
                                        <Link key={item.id} href={`/news/${item.id}`} className="block h-full">
                                            <motion.div
                                                variants={fadeInUp}
                                                whileHover={{ y: -5 }}
                                                className="group h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all overflow-hidden flex flex-col"
                                            >
                                                {item.imageUrl && (
                                                    <div className="h-48 overflow-hidden relative">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.headline}
                                                            fill
                                                            unoptimized={true}
                                                            sizes="(max-width: 768px) 100vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => {
                                                                // e.currentTarget.style.display = 'none'; // Not working on Next/Image component
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors mb-2 line-clamp-2">
                                                        {item.headline}
                                                    </h4>
                                                    <div className="mt-auto pt-2 text-xs text-slate-500 font-medium" suppressHydrationWarning>
                                                        {new Date(item.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(item.generatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
