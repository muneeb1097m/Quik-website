'use client';

import { useEffect, useState } from 'react';

export function CurrentDate() {
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        // Format: Friday, January 09, 2026
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: '2-digit'
        };
        setDateStr(now.toLocaleDateString('en-US', options));
    }, []);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return <span className="text-xs font-mono text-slate-400">{dateStr}</span>;
}
