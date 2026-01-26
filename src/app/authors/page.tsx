import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Our Team | Quik',
    description: 'Meet the team and AI behind Quik News.',
};

export default function AuthorsPage() {
    return (
        <main className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                        Meet the Team
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        The humans and machines behind your daily intelligence.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Founder / Human Editor */}
                    <div className="group">
                        <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    M
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Muneeb</h2>
                                    <p className="text-blue-600 dark:text-blue-400 font-medium">Founder & Editor-in-Chief</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Tech entrepreneur and full-stack engineer passionate about information density. Muneeb built Quik to solve the problem of "doomscrolling" by using AI to extract only the most valuable signals from the global noise.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                                    Twitter / X
                                </a>
                                <a href="#" className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                                    LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* AI Editor */}
                    <div className="group">
                        <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    AI
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">Quik AI</h2>
                                    <p className="text-purple-600 dark:text-purple-400 font-medium">Head of Synthesis</p>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Powered by Google's Gemini 1.5 Flash, Quik AI processes millions of data points daily. It never sleeps, has no political bias, and is optimized purely for finding the "So What?" in every story.
                            </p>
                            <div className="flex gap-4 items-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    Online Now
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-bold mb-4">Want to join us?</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        We are looking for human editors to work alongside our AI.
                    </p>
                    <a
                        href="mailto:jobs@quik.news"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Apply Now
                    </a>
                </div>
            </div>
        </main>
    );
}
