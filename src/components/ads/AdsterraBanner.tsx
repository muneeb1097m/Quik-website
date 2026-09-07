'use client';

import React, { useState, useEffect } from 'react';

interface AdsterraBannerProps {
    adKey?: string;
    width: number;
    height: number;
    formatName?: string;
    scriptDomain?: string;
    className?: string;
}

export function AdsterraBanner({
    adKey,
    width,
    height,
    formatName = 'Banner Ad',
    scriptDomain = 'www.highrevenueformat.com',
    className = '',
}: AdsterraBannerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Clean HTML document for the isolated iframe
    const iframeSrcDoc = adKey
        ? `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
    </style>
</head>
<body>
    <script type="text/javascript">
        atOptions = {
            'key': '${adKey}',
            'format': 'iframe',
            'height': ${height},
            'width': ${width},
            'params': {}
        };
    </script>
    <script type="text/javascript" src="//${scriptDomain}/${adKey}/invoke.js"></script>
</body>
</html>`
        : null;

    return (
        <div className={`flex flex-col items-center justify-center my-4 ${className}`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 select-none">
                Advertisement
            </span>
            <div
                style={{ width: `${width}px`, minHeight: `${height}px`, maxWidth: '100%' }}
                className="relative bg-slate-50 border border-dashed border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shadow-2xs"
            >
                {isMounted && iframeSrcDoc ? (
                    <iframe
                        srcDoc={iframeSrcDoc}
                        width={width}
                        height={height}
                        title={`Adsterra ${formatName}`}
                        className="border-0 overflow-hidden block"
                        scrolling="no"
                        loading="lazy"
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-xs font-semibold text-slate-500">{formatName}</span>
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5">{width} &times; {height}</span>
                        <span className="text-[10px] text-brand-blue/70 mt-1 font-medium">Ready for Adsterra Key</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdsterraBanner;
