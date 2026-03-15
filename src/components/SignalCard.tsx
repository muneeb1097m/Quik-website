'use client';
import { Signal, NewsEvent } from '@/types';
import { useState } from 'react';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface SignalCardProps {
    signal: Signal;
    event: NewsEvent;
    onClick?: () => void;
}

export function SignalCard({ signal, event, onClick }: SignalCardProps) {
    const [imageError, setImageError] = useState(false);

    // Mapping categories to brand colors
    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'International': return 'text-brand-red bg-brand-red/10 border-brand-red/30 hover:bg-brand-red/20';
            case 'Politics': // Mapping Politics to local Green for demo
            case 'Technology': return 'text-slate-900 bg-brand-green/20 border-brand-green/50 hover:bg-brand-green/30';
            case 'Sports': return 'text-slate-900 bg-brand-green/20 border-brand-green/50 hover:bg-brand-green/30';
            default: return 'text-slate-900 bg-brand-green/20 border-brand-green/50 hover:bg-brand-green/30';
        }
    };

    const showImage = signal.imageUrl && !imageError;

    return (
        <Link href={`/news/${signal.id}`} className="block group h-full">
            <div
                onClick={onClick}
                className="group relative bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col items-start"
            >
                {/* Image Area - Always rendered now */}
                <div className="mb-6 -mx-8 -mt-8 aspect-video overflow-hidden relative bg-slate-100 w-[calc(100%+4rem)]">
                    {showImage ? (
                        <>
                            <Image
                                src={signal.imageUrl || ''}
                                alt={signal.headline}
                                fill
                                unoptimized={true}
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                onError={() => setImageError(true)}
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                        </>
                    ) : (
                        // Fallback Gradient
                        <div className="w-full h-full relative overflow-hidden bg-slate-100">
                            {/* Fallback "Smart" Image based on Category/Keywords */}
                            <img
                                src={(() => {
                                    const text = (event.title + ' ' + event.category).toLowerCase();
                                    if (text.includes('finance') || text.includes('stock') || text.includes('economy') || text.includes('market') || text.includes('bank'))
                                        return "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=2940&auto=format&fit=crop";
                                    if (text.includes('tech') || text.includes('ai') || text.includes('cyber') || text.includes('digital'))
                                        return "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop";
                                    if (text.includes('sport') || text.includes('cricket') || text.includes('football'))
                                        return "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2940&auto=format&fit=crop";
                                    if (text.includes('politics') || text.includes('govt') || text.includes('minister'))
                                        return "https://images.unsplash.com/photo-1541872703-74c59636a226?q=80&w=2940&auto=format&fit=crop";

                                    // Default Abstract
                                    return "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2940&auto=format&fit=crop";
                                })()}
                                alt="News Fallback"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-start justify-between mb-4 w-full">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getCategoryColor(event.category)}`}>
                        {event.category}
                    </span>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span suppressHydrationWarning>{new Date(signal.generatedAt || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                    </div>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 mb-3 leading-snug tracking-tight group-hover:text-slate-600 transition-colors">
                    {signal.headline}
                </h3>

                <p className="text-slate-500 text-base leading-relaxed line-clamp-2 font-medium">
                    {signal.summary}
                </p>
            </div>
        </Link>
    );
}
