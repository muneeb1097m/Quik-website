import { Cpu, Globe } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Ambient Light Orbs Skeleton */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-slate-200/50 rounded-full blur-[60px]" />
                <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-[50px]" />
            </div>

            <main className="max-w-[1600px] mx-auto px-4 md:px-8 pt-24 lg:pt-40 pb-20 relative z-10 animate-pulse">

                {/* HERO: Asymmetrical Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-auto min-h-[500px] lg:h-[600px] mb-12 lg:mb-20">

                    {/* Main Card (Left) */}
                    <div className="lg:col-span-8 h-[500px] lg:h-full block">
                        <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-200 h-full w-full shadow-sm">
                            <div className="absolute inset-0 p-6 md:p-12 flex flex-col justify-end">
                                <div className="w-24 h-8 bg-slate-300 rounded-full mb-6" />
                                <div className="space-y-4 mb-6">
                                    <div className="w-full h-8 md:h-12 bg-slate-300 rounded-lg" />
                                    <div className="w-2/3 h-8 md:h-12 bg-slate-300 rounded-lg" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-4 bg-slate-300 rounded" />
                                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                                    <div className="w-16 h-4 bg-slate-300 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub Grid (Right) */}
                    <div className="lg:col-span-4 flex flex-col md:flex-row lg:flex-col gap-4 md:gap-6 h-auto lg:h-full">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex-1 min-h-[260px] bg-slate-200 rounded-[2rem] p-8 flex flex-col justify-end">
                                <div className="w-16 h-6 bg-slate-300 rounded-full mb-3" />
                                <div className="space-y-2 mb-3">
                                    <div className="w-full h-6 bg-slate-300 rounded" />
                                    <div className="w-3/4 h-6 bg-slate-300 rounded" />
                                </div>
                                <div className="w-16 h-3 bg-slate-300 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lower Section Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-3 mb-6 md:mb-8">
                            <Cpu className="w-6 h-6 text-slate-300" />
                            <div className="h-8 w-32 bg-slate-200 rounded" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => {
                                const isWide = i === 5;
                                return (
                                    <div
                                        key={i}
                                        className={`bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-full flex flex-col ${isWide ? 'md:col-span-2' : ''}`}
                                    >
                                        <div className="mb-6 -mx-8 -mt-8 aspect-video bg-slate-200" />
                                        <div className="flex justify-between mb-4">
                                            <div className="w-20 h-6 bg-slate-200 rounded-full" />
                                            <div className="w-16 h-4 bg-slate-200 rounded" />
                                        </div>
                                        <div className="space-y-3 mb-3">
                                            <div className="w-full h-8 bg-slate-200 rounded" />
                                            <div className="w-4/5 h-8 bg-slate-200 rounded" />
                                        </div>
                                        <div className="space-y-2 mt-auto">
                                            <div className="w-full h-4 bg-slate-100 rounded" />
                                            <div className="w-full h-4 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <div className="sticky top-28 space-y-8">
                            <div className="rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/50">
                                <div className="flex items-center gap-2 mb-6 text-slate-300">
                                    <Globe className="w-4 h-4" />
                                    <div className="h-4 w-32 bg-slate-200 rounded" />
                                </div>
                                <div className="space-y-8">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex gap-2">
                                                <div className="w-12 h-3 bg-slate-200 rounded" />
                                                <div className="w-12 h-3 bg-slate-200 rounded" />
                                            </div>
                                            <div className="w-full h-5 bg-slate-200 rounded" />
                                            <div className="w-2/3 h-5 bg-slate-200 rounded" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>
        </div>
    );
}
