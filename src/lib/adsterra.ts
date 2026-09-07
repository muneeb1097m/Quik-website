// Adsterra Ad Units Configuration
// Pre-filled with your Adsterra Unit IDs from quiknews.online dashboard

export interface AdsterraUnitConfig {
    id: string;
    name: string;
    width?: number;
    height?: number;
    key?: string;
    scriptUrl?: string;
}

export const ADSTERRA_CONFIG = {
    // 1. Social Bar (Sticky notification / push banner)
    socialBar: {
        id: '31131328',
        name: 'SocialBar_1',
        scriptUrl: process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_URL || 'https://pl31231827.profitableratecpmnetwork.com/0d/29/23/0d2923efe4b6805fa2a29d52e033d7fd.js',
    },
    // 2. Popunder (Background popup on user tap/click)
    popunder: {
        id: '31131331',
        name: 'Popunder_1',
        scriptUrl: process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_URL || 'https://pl31231830.profitableratecpmnetwork.com/c7/ac/5e/c7ac5e966d288658b139991c199346eb.js',
    },
    // 3. Native Banner (Content recommendation widget)
    nativeBanner: {
        id: '31131330',
        name: 'NativeBanner_1',
        key: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_KEY || 'de1d4c2d2dc58cc294eaabeba888f3bb',
        scriptUrl: process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_URL || 'https://pl31231829.profitableratecpmnetwork.com/de1d4c2d2dc58cc294eaabeba888f3bb/invoke.js',
    },
    // 4. Banner 728x90 (Desktop Leaderboard)
    banner728x90: {
        id: '31131336',
        name: '728x90_1',
        width: 728,
        height: 90,
        key: process.env.NEXT_PUBLIC_ADSTERRA_728x90_KEY || '56f59c1088c061af1b86d0f030e36391',
        scriptDomain: 'www.highrevenueformat.com',
    },
    // 5. Banner 300x250 (Medium Rectangle - High CPM)
    banner300x250: {
        id: '31131338',
        name: '300x250_1',
        width: 300,
        height: 250,
        key: process.env.NEXT_PUBLIC_ADSTERRA_300x250_KEY || '1f6a578bb0f6ddc39a93a39cd478bed4',
        scriptDomain: 'www.highrevenueformat.com',
    },
    // 6. Banner 160x600 (Wide Skyscraper)
    banner160x600: {
        id: '31131337',
        name: '160x600_1',
        width: 160,
        height: 600,
        key: process.env.NEXT_PUBLIC_ADSTERRA_160x600_KEY || '',
    },
    // 7. Banner 320x50 (Mobile Leaderboard)
    banner320x50: {
        id: '31131335',
        name: '320x50_1',
        width: 320,
        height: 50,
        key: process.env.NEXT_PUBLIC_ADSTERRA_320x50_KEY || '36e32ce8a77cef0509c82fb602ae6583',
        scriptDomain: 'www.highrevenueformat.com',
    },
    // 8. Banner 468x60 (Tablet / In-article Banner)
    banner468x60: {
        id: '31131333',
        name: '468x60_1',
        width: 468,
        height: 60,
        key: process.env.NEXT_PUBLIC_ADSTERRA_468x60_KEY || 'c245515e9b57f787138489cec14634a9',
        scriptDomain: 'www.highrevenueformat.com',
    },
    // 9. Banner 160x300 (Half Skyscraper)
    banner160x300: {
        id: '31131334',
        name: '160x300_1',
        width: 160,
        height: 300,
        key: process.env.NEXT_PUBLIC_ADSTERRA_160x300_KEY || '14100b7709ca5b785d38070b903fdc92',
        scriptDomain: 'www.highrevenueformat.com',
    },
    // 10. Smartlink
    smartlink: {
        id: '31131332',
        name: 'Smartlink_1',
        url: process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URL || '',
    },
};
