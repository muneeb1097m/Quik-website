'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Clock, Share2, Shield, Calendar, Globe, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';

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

    if (!signal || !event) return null; // Safety check

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-green/20 selection:text-slate-900">
            {/* ... Rest of JSX remains EXACTLY the same ... */}

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

            <main ref={containerRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">

                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Intelligence Feed
                    </Link>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">

                    {/* Left Column: Context & Metadata */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm sticky top-8">
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
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-8">
                        <article className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                            {/* AI Badge */}
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <Sparkles className="w-32 h-32" />
                            </div>

                            {/* Header */}
                            <header className="mb-10 relative z-10">
                                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight">
                                    {signal.headline}
                                </h1>
                                <div className="flex flex-wrap gap-4">
                                    {event.sources && event.sources.map((source: any) => (
                                        <div key={source.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 border border-slate-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                            {source.name}
                                        </div>
                                    ))}
                                </div>
                            </header>

                            {/* Main Summary Box */}
                            <div className="bg-brand-green/5 border border-brand-green/10 rounded-2xl p-8 mb-10 relative">
                                <h3 className="text-brand-green font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Quik AI Summary
                                </h3>
                                <p className="text-xl text-slate-800 font-medium leading-relaxed m-0 font-serif">
                                    {signal.summary}
                                </p>
                            </div>

                            {/* Detailed Report */}
                            <div className="prose prose-lg text-slate-600 leading-relaxed max-w-none">
                                <p>
                                    This report was automatically generated by the Quik Intelligence Engine (QIE).
                                    Our systems continuously monitor global events to bring you confirmed updates as they happen.
                                </p>
                                {signal.fullReport && (
                                    <div className="mt-12 pt-12 border-t border-slate-200">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Detailed Report</h3>
                                        <div className="space-y-6 text-lg text-slate-700 leading-relaxed font-serif">
                                            {signal.fullReport.split('\n\n').map((para: string, i: number) => (
                                                <p key={i}>{para}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </article>

                        {/* Related Stories */}
                        {related.length > 0 && (
                            <div className="mt-20">
                                <h3 className="text-2xl font-bold text-slate-900 mb-8">Related Intelligence</h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {related.map((item: any) => (
                                        <Link key={item.id} href={`/news/${item.id}`} className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
                                            <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors mb-2 line-clamp-2">
                                                {item.headline}
                                            </h4>
                                            <div className="text-xs text-slate-500 font-medium">{item.generatedAt}</div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
