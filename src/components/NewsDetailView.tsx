// @ts-nocheck
'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, Clock, Share2, Shield, Calendar, Globe, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsUrl } from '@/lib/utils';

// Define Props - using 'any' to speed up migration, ideal would be full types
interface NewsDetailViewProps {
    signal: any;
    event: any;
    related: any[];
}

const FormattedReport = ({ content }: { content: string }) => {
    if (!content) return null;

    // Split content into blocks by double newlines or single newlines with Markdown markers
    const rawParagraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    return (
        <div className="space-y-6 text-base md:text-lg text-slate-700 leading-relaxed font-sans">
            {rawParagraphs.map((block, index) => {
                const trimmed = block.trim();

                // 1. Heading (### or ##)
                if (trimmed.startsWith('#') || trimmed.startsWith('###') || trimmed.startsWith('##')) {
                    const headingText = trimmed.replace(/^#+\s*/, '');
                    return (
                        <div key={index} className="pt-6 pb-2 border-b border-slate-100 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-slate-900 rounded-full flex-shrink-0" />
                            <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {headingText}
                            </h4>
                        </div>
                    );
                }

                // 2. Bullet List (- or *)
                if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.includes('\n- ')) {
                    const items = trimmed.split('\n').filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '));
                    return (
                        <ul key={index} className="space-y-3 my-4 pl-1">
                            {items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-slate-800 font-medium text-base md:text-lg shadow-2xs">
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-900 mt-2 flex-shrink-0" />
                                    <span>{item.replace(/^[-*]\s*/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                // 3. Blockquote (> )
                if (trimmed.startsWith('>')) {
                    const quoteText = trimmed.replace(/^>\s*/, '');
                    return (
                        <blockquote key={index} className="my-6 p-6 rounded-2xl bg-slate-900 text-white font-medium text-lg md:text-xl leading-relaxed shadow-sm border-l-4 border-emerald-400 italic">
                            "{quoteText}"
                        </blockquote>
                    );
                }

                // 4. Regular Paragraphs
                return (
                    <p key={index} className="text-slate-700 text-base md:text-lg leading-relaxed font-normal">
                        {trimmed}
                    </p>
                );
            })}
        </div>
    );
};

export default function NewsDetailView({ signal, event, related }: NewsDetailViewProps) {

    // --- CLIENT SIDE LOGIC ---
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePinterestShare = () => {
        if (typeof window === 'undefined') return;
        const pageUrl = window.location.href;
        const mediaUrl = signal?.imageUrl || '';
        const description = encodeURIComponent(`${signal?.headline || 'News'} - Quik News`);
        const pinterestUrl = `https://www.pinterest.com/pin/create/button/?url=${encodeURIComponent(pageUrl)}&media=${encodeURIComponent(mediaUrl)}&description=${description}`;
        window.open(pinterestUrl, '_blank', 'noopener,noreferrer,width=750,height=600');
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
            <div
                className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between"
            >
                <Link href="/" className="font-bold text-slate-900 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                </Link>
                <div className="font-bold text-slate-900 truncate max-w-md">{signal.headline}</div>
                <div className="w-20" /> {/* Spacer */}
            </div>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-20 relative z-10">

                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Intelligence Feed
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Context & Metadata */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8 order-2 lg:order-1">
                        {/* Status Card - Sticky only on Desktop */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:sticky lg:top-8 relative z-20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-brand-green fill-brand-green/20" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verification Status</div>
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
                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Category</span>
                                    <span className="font-medium text-brand-blue px-2 py-0.5 bg-brand-blue/10 rounded-full">{event.category}</span>
                                </div>
                            </div>

                            {/* Share & Pinterest Buttons */}
                            <div className="space-y-3 mt-6">
                                <button
                                    onClick={handleShare}
                                    aria-label="Share Article"
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98]"
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                    {copied ? 'Link Copied' : 'Share Intelligence'}
                                </button>

                                <button
                                    onClick={handlePinterestShare}
                                    aria-label="Pin on Pinterest"
                                    className="w-full flex items-center justify-center gap-2 bg-[#E60023] text-white font-bold py-3 rounded-xl hover:bg-[#ad081b] transition-all active:scale-[0.98] shadow-sm"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                                    </svg>
                                    Pin on Pinterest
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <article
                            className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden"
                        >
                            {/* AI Badge */}
                            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                                <Sparkles className="w-32 h-32" />
                            </div>

                            {/* Header */}
                            <header className="mb-8 md:mb-10 relative z-10">
                                <h1
                                    className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-4 md:mb-6 tracking-tight"
                                >
                                    {signal.headline}
                                </h1>
                            </header>

                            {/* Main Image */}
                            {signal.imageUrl && (
                                <div
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
                                        }}
                                    />
                                </div>
                            )}

                            {/* Detailed Report */}
                            <div className="prose prose-base md:prose-lg text-slate-600 leading-relaxed max-w-none">
                                <p className="text-sm text-slate-400 mb-8 italic">
                                    Intelligence report synthesized for precision. Verified source updates below.
                                </p>
                                {signal.fullReport && (
                                    <div className="mt-12 pt-12 border-t border-slate-200">
                                        <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">Detailed Report</h3>
                                        <FormattedReport content={signal.fullReport} />
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
                                        <Link key={item.id} href={getNewsUrl(item)} className="block h-full">
                                            <div className="group h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all overflow-hidden flex flex-col hover:-translate-y-1">
                                                {item.imageUrl && (
                                                    <div className="h-48 overflow-hidden relative">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.headline}
                                                            fill
                                                            unoptimized={true}
                                                            sizes="(max-width: 768px) 100vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors mb-2 line-clamp-2">
                                                        {item.headline}
                                                    </h4>
                                                    <div className="mt-auto pt-2 text-xs text-slate-500 font-medium" suppressHydrationWarning>
                                                        {new Date(item.generatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {new Date(item.generatedAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </div>
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

