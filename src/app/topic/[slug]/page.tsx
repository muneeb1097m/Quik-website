import { getTopic, getAllTopics, isTopicIndexable } from '@/lib/topics';
import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { generateTopicCollectionSchema, generateBreadcrumbSchema, getBaseUrl } from '@/lib/seo';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Layers, ChevronRight } from 'lucide-react';

export const revalidate = 14400; // 4 hours
export const dynamicParams = true;

export async function generateStaticParams() {
    return getAllTopics().map((topic) => ({
        slug: topic.slug,
    }));
}

interface TopicPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
    const { slug } = await params;
    const topic = getTopic(slug);

    if (!topic) {
        return {
            title: 'Topic Not Found | Quik',
            robots: { index: false, follow: false },
        };
    }

    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}/topic/${topic.slug}`;

    // Query signals for indexability check
    const signals = await db.getSignals(topic.parentCategory as string, 20);
    const indexable = isTopicIndexable(topic, signals.length);

    return {
        title: `${topic.name} News & Intelligence Analysis | Quik`,
        description: topic.description,
        openGraph: {
            title: `${topic.name} News & Intelligence Analysis | Quik`,
            description: topic.description,
            url: canonicalUrl,
            type: 'website',
        },
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: indexable,
            follow: true,
        },
    };
}

export default async function TopicHubPage({ params }: TopicPageProps) {
    const { slug } = await params;
    const topic = getTopic(slug);

    if (!topic) {
        notFound();
    }

    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}/topic/${topic.slug}`;

    // Query signals matching topic parent category
    const signals = await db.getSignals(topic.parentCategory as string, 30);

    const collectionSchema = generateTopicCollectionSchema(topic, signals);
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: topic.parentCategory, url: `/${topic.parentCategory.toLowerCase()}` },
        { name: topic.name, url: `/topic/${topic.slug}` },
    ]);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Background Gradients */}
            <div className="fixed top-[-10%] right-[-10%] w-[700px] h-[700px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 relative z-10">
                {/* Visible Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <Link href={`/${topic.parentCategory.toLowerCase()}`} className="hover:text-slate-900 transition-colors">
                        {topic.parentCategory}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-900 font-bold">{topic.name}</span>
                </nav>

                {/* Topic Header */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/40 mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3.5 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-xs font-bold uppercase tracking-wider">
                            Topic Hub
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                            Parent: {topic.parentCategory}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                        {topic.name}
                    </h1>

                    <p className="text-slate-600 text-base md:text-lg max-w-3xl leading-relaxed mb-8 font-medium">
                        {topic.description}
                    </p>

                    {/* Related Topics & Entities */}
                    {topic.relatedTopics.length > 0 && (
                        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" />
                                Related Topics:
                            </span>
                            {topic.relatedTopics.map((relSlug) => {
                                const relTopic = getTopic(relSlug);
                                if (!relTopic) return null;
                                return (
                                    <Link
                                        key={relSlug}
                                        href={`/topic/${relSlug}`}
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                                    >
                                        {relTopic.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Latest Intelligence Stream */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brand-blue" />
                        Latest {topic.name} Intelligence &amp; Signals
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {signals.map((signal: any) => {
                            const event = signal.event || {
                                id: signal.eventId || 'unknown',
                                title: 'News',
                                category: topic.parentCategory,
                                status: 'Live',
                                detectedAt: new Date(),
                                lastUpdatedAt: new Date(),
                                confidenceScore: 0.9,
                                sources: [],
                            };
                            return <SignalCard key={signal.id} signal={signal} event={event} />;
                        })}
                        {signals.length === 0 && (
                            <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
                                Real-time intelligence signals for {topic.name} are currently syncing.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
