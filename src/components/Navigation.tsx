'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

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
    return <span className="text-sm font-mono text-slate-500 font-medium">{dateStr}</span>;
}

export function Navigation() {
    const pathname = usePathname();
    const navItems = ['About', 'Tech', 'Business', 'AI', 'Global', 'Auto', 'Pakistan', 'Sports'];
    const [isOpen, setIsOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Prevent body scrolling when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <header className="absolute top-0 left-0 right-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between pointer-events-none">

            {/* Logo (Left) */}
            <div className="pointer-events-auto flex-shrink-0 relative z-50">
                <Link href="/" aria-label="Home">
                    <Image
                        src="/logo.png"
                        alt="Quik News"
                        height={80}
                        width={120}
                        className="h-20 md:h-32 w-auto object-contain"
                        priority
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

            {/* Mobile Menu Toggle Button (Header Right) */}
            <div className="pointer-events-auto lg:hidden relative z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isOpen}
                    className="w-12 h-12 rounded-full bg-white/90 text-slate-900 border border-slate-200/80 shadow-lg backdrop-blur-md flex items-center justify-center transition-all active:scale-95"
                >
                    {isOpen ? (
                        <X className="w-6 h-6 stroke-[2.5]" />
                    ) : (
                        <Menu className="w-6 h-6 stroke-[2.5]" />
                    )}
                </button>
            </div>

            {/* Mobile Menu Fullscreen Drawer (White Background & Black Text) */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl flex flex-col pointer-events-auto lg:hidden shadow-2xl">
                    {/* Drawer Top Header with Logo & Prominent Close (X) Button */}
                    <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
                        <Link href="/" onClick={() => setIsOpen(false)} aria-label="Home">
                            <Image
                                src="/logo.png"
                                alt="Quik News"
                                height={60}
                                width={100}
                                className="h-14 w-auto object-contain"
                            />
                        </Link>

                        {/* Prominent Cross (X) Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            aria-label="Close menu"
                            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-sm flex items-center justify-center active:scale-95 transition-all"
                        >
                            <X className="w-6 h-6 stroke-[2.5]" />
                        </button>
                    </div>

                    {/* Nav Links List */}
                    <nav className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-4 bg-white">
                        <Link
                            href="/"
                            onClick={() => setIsOpen(false)}
                            className={`text-2xl font-extrabold pb-3 border-b border-slate-100 flex items-center justify-between ${
                                pathname === '/' ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <span>Home</span>
                            {pathname === '/' && <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />}
                        </Link>
                        {navItems.map((item) => {
                            const href = `/${item.toLowerCase()}`;
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={item}
                                    href={href}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-2xl font-bold pb-3 border-b border-slate-100 flex items-center justify-between ${
                                        isActive ? 'text-slate-900 font-extrabold' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <span>{item}</span>
                                    {isActive && <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />}
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
