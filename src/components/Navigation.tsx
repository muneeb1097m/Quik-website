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

    return (
        <header className="absolute top-0 left-0 right-0 z-50 px-8 py-2 flex items-center justify-between pointer-events-none">

            {/* Logo (Left) */}
            <div className="pointer-events-auto flex-shrink-0">
                <Link href="/">
                    <img
                        src="/logo.png"
                        alt="Quik News"
                        className="h-32 w-auto object-contain"
                    />
                </Link>
            </div>

            {/* Nav Pill (Center) */}
            <nav className="pointer-events-auto absolute left-1/2 -translate-x-1/2">
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

            {/* Date (Right) */}
            <div className="pointer-events-auto flex-shrink-0">
                <CurrentDate />
            </div>

        </header>
    );
}
