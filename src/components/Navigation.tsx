'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function CurrentDate() {
    const [dateStr, setDateStr] = useState('');
    useEffect(() => {
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        };
        setDateStr(now.toLocaleDateString('en-US', options));
    }, []);
    if (!dateStr) return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return <span className="text-sm font-mono text-slate-500 font-medium">{dateStr}</span>;
}

export function Navigation() {
    const pathname = usePathname();
    const navItems = ['About', 'Tech', 'Business', 'Telecom', 'Global', 'Auto', 'Pakistan', 'Sports'];
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <header className="absolute top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between pointer-events-none">

            {/* Logo (Left) */}
            <div className="pointer-events-auto flex-shrink-0 relative z-50">
                <Link href="/">
                    <img
                        src="/logo.png"
                        alt="Quik News"
                        className="h-20 md:h-32 w-auto object-contain"
                    />
                </Link>
            </div>

            {/* Desktop Nav Pill (Center) */}
            <nav className="pointer-events-auto absolute left-1/2 -translate-x-1/2 hidden lg:block">
                <div className="glass-panel px-8 py-4 rounded-full flex items-center gap-8 shadow-2xl backdrop-blur-xl border border-white/40">
                    <Link
                        href="/"
                        className={`text-base font-bold transition-all ${pathname === '/' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        Home
                    </Link>
                    <div className="w-px h-4 bg-slate-300" />
                    {navItems.map((item) => {
                        const href = `/${item.toLowerCase()}`;
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={item}
                                href={href}
                                className={`text-base font-medium transition-all ${isActive
                                    ? 'text-slate-900 font-bold relative after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:rounded-full after:bg-brand-green after:shadow-[0_0_10px_rgba(255,236,215,0.8)]'
                                    : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {item}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* Mobile Menu Toggle (Right) */}
            <div className="pointer-events-auto lg:hidden relative z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-center text-slate-900"
                >
                    {isOpen ? (
                        // Close Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                    ) : (
                        // Menu Icon
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" /></svg>
                    )}
                </button>
            </div>

            {/* Mobile Menu Drawer */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-50 z-40 flex flex-col pt-32 px-8 pointer-events-auto lg:hidden">
                    <nav className="flex flex-col gap-6">
                        <Link
                            href="/"
                            className={`text-2xl font-bold ${pathname === '/' ? 'text-slate-900' : 'text-slate-500'}`}
                        >
                            Home
                        </Link>
                        {navItems.map((item) => {
                            const href = `/${item.toLowerCase()}`;
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={item}
                                    href={href}
                                    className={`text-2xl font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}
                                >
                                    {item}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            )}

            {/* Date (Right - Desktop Only) */}
            <div className="pointer-events-auto flex-shrink-0 hidden lg:block">
                <CurrentDate />
            </div>

        </header>
    );
}
