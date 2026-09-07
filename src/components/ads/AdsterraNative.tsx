'use client';

import React, { useEffect, useRef } from 'react';

interface AdsterraNativeProps {
    widgetKey?: string;
    scriptUrl?: string;
    className?: string;
}

export function AdsterraNative({
    widgetKey,
    scriptUrl,
    className = '',
}: AdsterraNativeProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const key = widgetKey || 'de1d4c2d2dc58cc294eaabeba888f3bb';
        const src = scriptUrl || `https://pl31231829.profitableratecpmnetwork.com/${key}/invoke.js`;

        const currentRef = containerRef.current;
        if (!currentRef) return;

        // Clear previous content
        currentRef.innerHTML = '';

        // 1. Container div for Adsterra native 4:1 widget
        const targetDiv = document.createElement('div');
        targetDiv.id = `container-${key}`;
        targetDiv.className = 'w-full';
        currentRef.appendChild(targetDiv);

        // 2. Script execution tag
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = src;
        currentRef.appendChild(script);

        return () => {
            if (currentRef) {
                currentRef.innerHTML = '';
            }
        };
    }, [widgetKey, scriptUrl]);

    return (
        <div className={`w-full my-8 ${className}`}>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Sponsored Recommendations
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Adsterra Native</span>
            </div>

            <div className="w-full min-h-[140px] bg-slate-50 border border-slate-200/80 rounded-2xl p-4 overflow-hidden">
                <div ref={containerRef} className="w-full" />
            </div>
        </div>
    );
}

export default AdsterraNative;
