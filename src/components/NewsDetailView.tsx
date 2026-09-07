// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ArrowLeft, Clock, Share2, Shield, Calendar, Globe, Sparkles, Check, ChevronRight, ExternalLink, UserCheck, Layers } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getNewsUrl, decodeHtmlEntities } from '@/lib/utils';
import { extractEntities } from '@/lib/seo';
import { AdsterraBanner } from '@/components/ads/AdsterraBanner';
import { AdsterraNative } from '@/components/ads/AdsterraNative';
import { ADSTERRA_CONFIG } from '@/lib/adsterra';

interface NewsDetailViewProps {
    signal: any;
    event: any;
    author?: any;
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
                            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                                {headingText}
                            </h3>
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
                            &ldquo;{quoteText}&rdquo;
                        </blockquote>
                    );
                }

                // 4. Regular Paragraphs
                return (
                    <React.Fragment key={index}>
                        <p className="text-slate-700 text-base md:text-lg leading-relaxed font-normal">
                            {trimmed}
                        </p>
                        {index === 1 && (
                            <div className="my-6 flex justify-center not-prose">
                                <div className="w-full flex justify-center">
                                    <div className="hidden sm:block">
                                        <AdsterraBanner
                                            adKey={ADSTERRA_CONFIG.banner468x60.key || ADSTERRA_CONFIG.banner300x250.key}
                                            width={ADSTERRA_CONFIG.banner468x60.key ? 468 : 300}
                                            height={ADSTERRA_CONFIG.banner468x60.key ? 60 : 250}
                                            formatName="In-Article Banner"
                                            scriptDomain={ADSTERRA_CONFIG.banner468x60.scriptDomain}
                                        />
                                    </div>
                                    <div className="block sm:hidden">
                                        <AdsterraBanner
                                            adKey={ADSTERRA_CONFIG.banner320x50.key}
                                            width={320}
                                            height={50}
                                            formatName="Mobile Banner"
                                            scriptDomain={ADSTERRA_CONFIG.banner320x50.scriptDomain}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default function NewsDetailView({ signal, event, author, related }: NewsDetailViewProps) {
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

    if (!signal || !event) return null;

    const matchedTopics = extractEntities(`${signal.headline} ${signal.summary} ${signal.fullReport || ''}`);
    const sources = event.sources || [];
    const authorData = author || {
        name: 'Quik Editorial Desk',
        role: 'Autonomous Newsroom & Verification Desk',
        slug: 'quik-editorial-team',
    };

    const publishedDate = new Date(signal.generatedAt || Date.now());
    const updatedDate = event.lastUpdatedAt ? new Date(event.lastUpdatedAt) : null;
    const isUpdated = updatedDate && updatedDate.getTime() > publishedDate.getTime() + 60000;

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-green/20 selection:text-slate-900">
            {/* Background Gradient Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[60px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[60px] animate-pulse-slower" />
            </div>

            {/* Top Bar Navigation */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="font-bold text-slate-900 flex items-center gap-2 text-sm hover:text-brand-blue transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                </Link>
                <div className="font-bold text-slate-900 truncate max-w-md text-sm hidden md:block">{signal.headline}</div>
                <div className="w-20" />
            </div>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-20 relative z-10">
                {/* Visible Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href={`/${(event.category || 'news').toLowerCase()}`} className="hover:text-slate-900 transition-colors">
                        {event.category || 'News'}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-900 font-bold truncate max-w-xs">{signal.headline}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column: Context & Metadata */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8 order-2 lg:order-1">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:sticky lg:top-24 relative z-20 space-y-6">
                            {/* Editorial Byline Card */}
                            <div className="pb-6 border-b border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    Editorial Attribution
                                </div>
                                <Link href={`/author/${authorData.slug}`} className="flex items-center gap-3 group">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center text-base shrink-0 group-hover:scale-105 transition-transform">
                                        {authorData.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors flex items-center gap-1.5">
                                            {authorData.name}
                                            <UserCheck className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <div className="text-xs text-slate-500">{authorData.role}</div>
                                    </div>
                                </Link>
                            </div>

                            {/* Verification Badge */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verification Status</div>
                                    <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                                        Verified Signal
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Dates & Categories */}
                            <div className="space-y-3 text-xs md:text-sm">
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Clock className="w-4 h-4" /> Published</span>
                                    <span className="font-medium text-slate-900" suppressHydrationWarning>
                                        {publishedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {publishedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {isUpdated && (
                                    <div className="flex justify-between py-2 border-b border-slate-100 text-emerald-700 font-medium">
                                        <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Updated</span>
                                        <span suppressHydrationWarning>
                                            {updatedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {updatedDate?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Category</span>
                                    <Link href={`/${(event.category || 'news').toLowerCase()}`} className="font-medium text-brand-blue px-2.5 py-0.5 bg-brand-blue/10 rounded-full hover:bg-brand-blue/20 transition-colors">
                                        {event.category}
                                    </Link>
                                </div>
                            </div>

                            {/* Transparent AI & Fact-Check Disclosure */}
                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-2">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    AI &amp; Fact-Checking Transparency
                                </div>
                                <p className="leading-relaxed">
                                    This report is autonomously synthesized from verified primary reporting and cross-referenced by Quik Intelligence.
                                </p>
                                <Link href="/editorial-policy" className="inline-flex items-center gap-1 text-brand-blue font-bold hover:underline">
                                    Read Editorial Policy <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>

                            {/* Share Buttons */}
                            <div className="space-y-3 pt-2">
                                <button
                                    onClick={handleShare}
                                    aria-label="Share Article"
                                    className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] text-sm"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                                    {copied ? 'Link Copied to Clipboard' : 'Share Intelligence'}
                                </button>

                                <button
                                    onClick={handlePinterestShare}
                                    aria-label="Pin on Pinterest"
                                    className="w-full flex items-center justify-center gap-2 bg-[#E60023] text-white font-bold py-3 rounded-xl hover:bg-[#ad081b] transition-all active:scale-[0.98] shadow-sm text-sm"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
                                    </svg>
                                    Pin on Pinterest
                                </button>
                            </div>

                            {/* Adsterra Sidebar Banner */}
                            <div className="pt-4 border-t border-slate-100 flex flex-col items-center">
                                {ADSTERRA_CONFIG.banner300x250.key ? (
                                    <AdsterraBanner
                                        adKey={ADSTERRA_CONFIG.banner300x250.key}
                                        width={300}
                                        height={250}
                                        formatName="Sidebar Banner"
                                        scriptDomain={ADSTERRA_CONFIG.banner300x250.scriptDomain}
                                    />
                                ) : (
                                    <AdsterraBanner
                                        adKey={ADSTERRA_CONFIG.banner160x300.key}
                                        width={160}
                                        height={300}
                                        formatName="Sidebar 160x300"
                                        scriptDomain={ADSTERRA_CONFIG.banner160x300.scriptDomain}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <article className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                            {/* Header */}
                            <header className="mb-8 md:mb-10 relative z-10">
                                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 leading-[1.1] mb-4 md:mb-6 tracking-tight">
                                    {decodeHtmlEntities(signal.headline)}
                                </h1>
                            </header>

                            {/* Main Image */}
                            {signal.imageUrl && (
                                <div className="mb-8 md:mb-10 rounded-2xl md:rounded-3xl overflow-hidden relative aspect-video shadow-lg">
                                    <Image
                                        src={signal.imageUrl}
                                        alt={signal.headline}
                                        fill
                                        unoptimized={true}
                                        priority={true}
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 800px"
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            {/* Lead Summary */}
                            {signal.summary && (
                                <div className="text-lg md:text-xl text-slate-900 font-semibold leading-relaxed mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-2xs">
                                    {decodeHtmlEntities(signal.summary)}
                                </div>
                            )}

                            {/* Detailed Report */}
                            <div className="prose prose-base md:prose-lg text-slate-700 leading-relaxed max-w-none">
                                {signal.fullReport ? (
                                    <FormattedReport content={signal.fullReport} />
                                ) : (
                                    <p className="text-slate-600">No extended report available.</p>
                                )}
                            </div>

                            {/* Matched Topic Entities */}
                            {matchedTopics.length > 0 && (
                                <div className="mt-10 pt-6 border-t border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5" />
                                        Covered Topics &amp; Entities
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {matchedTopics.map((topic) => (
                                            <Link
                                                key={topic.slug}
                                                href={`/topic/${topic.slug}`}
                                                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-colors"
                                            >
                                                #{topic.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Source Attribution Box */}
                            {sources.length > 0 && (
                                <div className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200/80">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                                        <Globe className="w-4 h-4 text-slate-700" />
                                        Primary Reporting &amp; Verification Sources
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {sources.map((src: any) => (
                                            <a
                                                key={src.id || src.url}
                                                href={src.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 hover:border-slate-400 transition-colors shadow-2xs"
                                            >
                                                {src.name || 'Verified Media Source'}
                                                <ExternalLink className="w-3 h-3 text-slate-400" />
                                            </a>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-3 leading-normal">
                                        Quik News synthesizes verified facts across international press reporting. Original reporting belongs to the attributed outlets above.
                                    </p>
                                </div>
                            )}
                        </article>

                        {/* Adsterra Native Banner Unit */}
                        <AdsterraNative
                            widgetKey={ADSTERRA_CONFIG.nativeBanner.key}
                            scriptUrl={ADSTERRA_CONFIG.nativeBanner.scriptUrl}
                        />

                        {/* Related Stories */}
                        {related.length > 0 && (
                            <div className="mt-16">
                                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-brand-blue" />
                                    Related Intelligence Coverage
                                </h3>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {related.map((item: any) => (
                                        <Link key={item.id} href={getNewsUrl(item)} className="block h-full group">
                                            <div className="h-full bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all overflow-hidden flex flex-col hover:-translate-y-1">
                                                {item.imageUrl && (
                                                    <div className="h-48 overflow-hidden relative">
                                                        <Image
                                                            src={item.imageUrl}
                                                            alt={item.headline}
                                                            fill
                                                            unoptimized={true}
                                                            sizes="(max-width: 768px) 100vw, 33vw"
                                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-6 flex flex-col flex-1">
                                                    <h4 className="font-bold text-slate-900 group-hover:text-brand-blue transition-colors mb-2 line-clamp-2">
                                                        {decodeHtmlEntities(item.headline)}
                                                    </h4>
                                                    <div className="mt-auto pt-2 text-xs text-slate-500 font-medium" suppressHydrationWarning>
                                                        {new Date(item.generatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
