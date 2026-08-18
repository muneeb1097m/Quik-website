import { db } from '@/lib/qie/db';
import { SignalCard } from '@/components/SignalCard';
import { notFound } from 'next/navigation';
import { NewsEvent } from '@/types';
import { getAllTopics } from '@/lib/topics';
import { generateBreadcrumbSchema, getBaseUrl } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Layers } from 'lucide-react';

// Performance: Enable ISR with 4-hour revalidation
export const revalidate = 14400;
export const dynamicParams = false;

const VALID_CATEGORIES = ['tech', 'business', 'global', 'ai', 'auto', 'pakistan', 'sports'];

const CATEGORY_NAMES: Record<string, string> = {
    tech: 'Technology',
    business: 'Business & Markets',
    global: 'Global Affairs',
    ai: 'Artificial Intelligence',
    auto: 'Automotive & EV',
    pakistan: 'Startup Pakistan',
    sports: 'Sports & Athletics',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    tech: 'Real-time intelligence on software breakthroughs, consumer hardware, cybersecurity, cloud infrastructure, and big tech earnings.',
    business: 'In-depth coverage of global financial markets, macroeconomic trends, central bank policies, inflation, venture capital, and corporate deals.',
    global: 'Synthesized geopolitical intelligence, international diplomacy, world economic forums, and verified breaking global headlines.',
    ai: 'Frontier AI models, generative algorithms, neural architectures, semiconductor computing, and enterprise artificial intelligence adoption.',
    auto: 'Electric vehicles, autonomous driving systems, battery technologies, charging infrastructure, and next-generation mobility.',
    pakistan: 'Tech startups, venture funding, economic reforms, digital infrastructure, and entrepreneurship across Pakistan.',
    sports: 'International cricket, ICC tournaments, football leagues, motorsport, and major competitive athletic championships.',
};

export async function generateStaticParams() {
    return VALID_CATEGORIES.map((category) => ({
        category,
    }));
}

interface PageProps {
    params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { category } = await params;
    const lowerCategory = category.toLowerCase();

    if (!VALID_CATEGORIES.includes(lowerCategory)) {
        return {
            title: 'Category Not Found | Quik',
            description: 'The requested category could not be found.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const title = CATEGORY_NAMES[lowerCategory] || (category.charAt(0).toUpperCase() + category.slice(1));
    const description = CATEGORY_DESCRIPTIONS[lowerCategory] || `Latest ${title} news and verified intelligence on Quik.`;
    const baseUrl = getBaseUrl();
    const canonicalUrl = `${baseUrl}/${lowerCategory}`;

    return {
        title: `${title} News & Intelligence Updates | Quik`,
        description,
        openGraph: {
            title: `${title} News & Intelligence Updates | Quik`,
            description,
            url: canonicalUrl,
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

export default async function CategoryPage({ params }: PageProps) {
    const { category } = await params;
    const lowerCategory = category.toLowerCase();

    if (!VALID_CATEGORIES.includes(lowerCategory)) {
        notFound();
    }

    const title = CATEGORY_NAMES[lowerCategory] || (category.charAt(0).toUpperCase() + category.slice(1));
    const description = CATEGORY_DESCRIPTIONS[lowerCategory];

    const signals = await db.getSignals(category, 50);

    // Find topics under this category
    const relevantTopics = getAllTopics().filter(t => {
        const parent = t.parentCategory.toLowerCase();
        return parent === lowerCategory || (lowerCategory === 'tech' && (parent === 'ai' || parent === 'technology'));
    });

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: title, url: `/${lowerCategory}` },
    ]);

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Breadcrumb Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-[20%] right-[-10%] w-[600px] h-[600px] bg-brand-red/5 rounded-full blur-[100px] pointer-events-none" />

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-24 relative z-10">
                {/* Visible Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span className="text-slate-900 font-bold">{title}</span>
                </nav>

                {/* Category Header */}
                <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-200 shadow-sm mb-12">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        {title} News &amp; Signals
                    </h1>
                    <p className="text-slate-600 text-base md:text-lg max-w-3xl leading-relaxed font-medium mb-6">
                        {description}
                    </p>

                    {/* Subtopic Pills */}
                    {relevantTopics.length > 0 && (
                        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                                <Layers className="w-3.5 h-3.5" />
                                Subtopics:
                            </span>
                            {relevantTopics.map((topic) => (
                                <Link
                                    key={topic.slug}
                                    href={`/topic/${topic.slug}`}
                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors border border-slate-200/60"
                                >
                                    #{topic.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Signals Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {signals.map((signal: any) => {
                        const event = signal.event as unknown as NewsEvent;
                        if (!event) return null;
                        return <SignalCard key={signal.id} signal={signal as any} event={event} />;
                    })}
                    {signals.length === 0 && (
                        <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
                            No news signals available for {title} right now.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
