import { SignalCard } from './SignalCard';

export function SignalCardSkeleton() {
    return (
        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm h-full flex flex-col animate-pulse">
            <div className="mb-6 -mx-8 -mt-8 aspect-video bg-slate-200 rounded-t-[2rem]" />
            <div className="flex justify-between mb-4 w-full">
                <div className="h-6 w-20 bg-slate-200 rounded-full" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
            </div>
            <div className="h-8 w-full bg-slate-200 rounded mb-3" />
            <div className="h-4 w-full bg-slate-200 rounded mb-2" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
        </div>
    );
}

export function SidebarSkeleton() {
    return (
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200 bg-white/50 backdrop-blur-xl animate-pulse">
            <div className="h-4 w-32 bg-slate-200 rounded mb-6" />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="mb-6 last:mb-0">
                    <div className="flex gap-2 mb-2">
                        <div className="h-3 w-10 bg-slate-200 rounded" />
                        <div className="h-3 w-4 bg-slate-200 rounded" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                    <div className="h-5 w-full bg-slate-200 rounded mb-1" />
                    <div className="h-5 w-2/3 bg-slate-200 rounded" />
                </div>
            ))}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 min-h-[500px] lg:h-[600px] mb-12 animate-pulse">
            <div className="lg:col-span-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-200" />
            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="flex-1 bg-slate-200 rounded-[2rem]" />
                <div className="flex-1 bg-slate-200 rounded-[2rem]" />
            </div>
        </div>
    );
}
