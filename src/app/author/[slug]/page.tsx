import { getAuthor, getAllAuthors } from '@/lib/authors';
import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { generateAuthorProfileSchema, getBaseUrl } from '@/lib/seo';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Twitter, Linkedin, Globe, Sparkles } from 'lucide-react';

export const revalidate = 43200; // 12 hours
export const dynamicParams = true;

export async function generateStaticParams() {
    return getAllAuthors().map((author) => ({
        slug: author.slug,
    }));
}

interface AuthorPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
    const { slug } = await params;
    const author = getAuthor(slug);

    if (!author || author.slug !== slug) {
        return {
            title: 'Author Not Found | Quik',
            robots: { index: false, follow: false },
        };
    }

    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}/author/${author.slug}`;

    return {
        title: `${author.name} - ${author.role} | Quik News`,
        description: author.bio,
        openGraph: {
            title: `${author.name} - ${author.role} | Quik News`,
            description: author.bio,
            url: canonicalUrl,
            type: 'profile',
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
    const { slug } = await params;
    const author = getAuthor(slug);

    if (!author || author.slug !== slug) {
        notFound();
    }

    // Fetch recent articles
    const signals = await db.getSignals(undefined, 24);
    const authorSchema = generateAuthorProfileSchema(author);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(authorSchema) }}
            />

            {/* Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[700px] h-[700px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 relative z-10">
                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href="/authors"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Editorial Directory
                    </Link>
                </div>

                {/* Author Card */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/40 mb-16">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar / Badge */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center text-white text-4xl font-extrabold shadow-lg shrink-0 overflow-hidden relative">
                            {author.name.slice(0, 2).toUpperCase()}
                        </div>

                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                    {author.name}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Verified Editorial Byline
                                </span>
                            </div>

                            <p className="text-brand-blue font-bold text-base md:text-lg mb-4">
                                {author.role}
                            </p>

                            <p className="text-slate-600 leading-relaxed text-base md:text-lg mb-6 max-w-3xl">
                                {author.bio}
                            </p>

                            {/* Areas of Coverage */}
                            <div className="mb-6">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Areas of Coverage &amp; Expertise
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {author.areasOfCoverage.map((area) => (
                                        <span
                                            key={area}
                                            className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Social Profiles */}
                            {author.socials && (
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                                    {author.socials.twitter && (
                                        <a
                                            href={author.socials.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                                        >
                                            <Twitter className="w-3.5 h-3.5" />
                                            Twitter / X
                                        </a>
                                    )}
                                    {author.socials.linkedin && (
                                        <a
                                            href={author.socials.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" />
                                            LinkedIn
                                        </a>
                                    )}
                                    <Link
                                        href="/editorial-policy"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
                                    >
                                        <Globe className="w-3.5 h-3.5" />
                                        Editorial Standards
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Authored / Synthesized Coverage */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-blue" />
                        Intelligence Coverage by {author.name}
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {signals.map((signal: any) => {
                            const event = signal.event || {
                                id: signal.eventId || 'unknown',
                                title: 'News',
                                category: 'Technology',
                                status: 'Live',
                                detectedAt: new Date(),
                                lastUpdatedAt: new Date(),
                                confidenceScore: 0.9,
                                sources: [],
                            };
                            return <SignalCard key={signal.id} signal={signal} event={event} />;
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
