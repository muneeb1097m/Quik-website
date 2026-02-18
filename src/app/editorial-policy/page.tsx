import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Editorial Policy | Quik',
    description: 'Our commitment to accuracy, transparency, and ethical AI journalism.',
    alternates: {
        canonical: '/editorial-policy',
    },
};

export default function EditorialPolicyPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-8">
                    Editorial Policy
                </h1>

                <div className="prose dark:prose-invert prose-lg max-w-none">
                    <p className="lead text-xl text-gray-600 dark:text-gray-400 mb-8">
                        At Quik, we leverage advanced Artificial Intelligence to aggregate and synthesize global news. However, we remain committed to the core principles of journalism: accuracy, fairness, and transparency.
                    </p>

                    <section className="mb-10">
                        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">1. AI & Human Oversight</h2>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="mb-0">
                                Our news is curated and summarized by AI algorithms (Powered by Google Gemini), but our editorial standards are defined by humans. We use AI to:
                            </p>
                            <ul className="mt-4 list-disc list-inside space-y-2">
                                <li>Monitor 50+ verified global RSS feeds.</li>
                                <li>Synthesize facts from multiple sources to reduce bias.</li>
                                <li>Highlight key "signals" over noise.</li>
                            </ul>
                            <p className="mt-4 font-medium">
                                We do NOT use AI to hallucinate stories. Every article is based on real-time data from established outlets like Reuters, Bloomberg, and TechCrunch.
                            </p>
                        </div>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">2. Fact-Checking & Accuracy</h2>
                        <p>
                            Accuracy is paramount. Our system cross-references claims across multiple sources before publication. If a story is flagged as unverified or disputed, it is either withheld or clearly labeled.
                        </p>
                        <p className="mt-4">
                            <strong>Corrections:</strong> If we make a mistake, we correct it immediately. Significant corrections are noted at the bottom of the article. You can report errors to <a href="mailto:corrections@quiknews.online" className="text-blue-600 hover:underline">corrections@quiknews.online</a>.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">3. Sourcing & Attribution</h2>
                        <p>
                            We believe in giving credit. Every Quik article is a synthesis of existing reporting, and we explicitly list our sources (with links) at the bottom of every story. We drive traffic back to original publishers.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">4. Independence & Funding</h2>
                        <p>
                            Quik is an independent media platform. We are self-funded and do not accept payment for news coverage. Our revenue comes from transparent advertising and potential premium subscriptions, which never influence our editorial coverage.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">5. Ethics</h2>
                        <p>
                            We adhere to strict ethical guidelines. We do not publish hate speech, harassment, or content that incites violence. Our AI is tuned to be neutral and objective, avoiding sensationalism ("clickbait") in favor of high-signal clarity.
                        </p>
                    </section>

                    <hr className="my-10 border-gray-200 dark:border-gray-800" />

                    <div className="text-sm text-gray-500">
                        <p>Last Updated: January 26, 2026</p>
                        <p>Quik Editorial Board<br />Islamabad, Pakistan</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
