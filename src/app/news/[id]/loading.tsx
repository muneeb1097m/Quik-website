export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Background Gradient Orbs (Simplified) */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-slate-200/50 rounded-full blur-[100px]" />
            </div>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 lg:pt-32 pb-20 relative z-10 animate-pulse">

                {/* Back Link Placeholder */}
                <div className="h-6 w-32 bg-slate-200 rounded mb-8" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Left Column: Context & Metadata */}
                    <div className="lg:col-span-4 space-y-6 lg:space-y-8 order-2 lg:order-1">
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-64">
                            {/* Status Card Skeleton */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-200" />
                                <div className="space-y-2">
                                    <div className="h-3 w-20 bg-slate-200 rounded" />
                                    <div className="h-4 w-32 bg-slate-200 rounded" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-slate-100 rounded" />
                                <div className="h-4 w-full bg-slate-100 rounded" />
                                <div className="h-4 w-full bg-slate-100 rounded" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-8 order-1 lg:order-2">
                        <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-12 shadow-sm border border-slate-100">

                            {/* Headline */}
                            <div className="h-10 md:h-14 w-3/4 bg-slate-200 rounded-lg mb-4 md:mb-6" />
                            <div className="h-10 md:h-14 w-1/2 bg-slate-200 rounded-lg mb-8" />

                            {/* Sources Pills */}
                            <div className="flex gap-3 mb-10">
                                <div className="h-8 w-24 bg-slate-200 rounded-full" />
                                <div className="h-8 w-24 bg-slate-200 rounded-full" />
                            </div>

                            {/* Main Image */}
                            <div className="mb-8 md:mb-10 rounded-2xl md:rounded-3xl bg-slate-200 aspect-video w-full" />

                            {/* Summary Box */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 mb-8 md:mb-10 space-y-3">
                                <div className="h-4 w-1/4 bg-slate-200 rounded" />
                                <div className="h-4 w-full bg-slate-200 rounded" />
                                <div className="h-4 w-full bg-slate-200 rounded" />
                                <div className="h-4 w-2/3 bg-slate-200 rounded" />
                            </div>

                            {/* Text Body */}
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-slate-100 rounded" />
                                <div className="h-4 w-full bg-slate-100 rounded" />
                                <div className="h-4 w-5/6 bg-slate-100 rounded" />
                                <div className="h-4 w-full bg-slate-100 rounded" />
                                <div className="h-4 w-3/4 bg-slate-100 rounded" />
                            </div>

                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
