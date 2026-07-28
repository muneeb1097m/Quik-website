import { generateNewsImage } from '../image-gen';
import { triggerIndexNow } from '../indexnow';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const getSupabaseConfig = () => {
    const projectId = process.env.SUPABASE_PROJECT_ID;
    const url = projectId 
        ? `https://${projectId}.supabase.co` 
        : (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL);
    
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                process.env.SUPABASE_ANON_KEY;

    return { 
        url: url || 'https://dummy-build.supabase.co', 
        key: key || 'dummy_key' 
    };
};

const { url: supabaseUrl, key: supabaseKey } = getSupabaseConfig();
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
    },
    global: {
        fetch: (url, options) => fetch(url, options),
    },
});

// Helper accessor for Supabase Events
export const db = {
    getEvents: async (limit?: number) => {
        let query = supabase.from('NewsEvent').select('*, sources:Source(*)').order('detectedAt', { ascending: false });
        if (limit) query = query.limit(limit);
        const { data, error } = await query;
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getRecentHeadlines: async (limit: number = 200) => {
        const { data, error } = await supabase.from('NewsEvent').select('title').order('detectedAt', { ascending: false }).limit(limit);
        if (error) { console.error(error); return []; }
        return (data || []).map((e: any) => e.title);
    },

    getEvent: async (id: string) => {
        return unstable_cache(
            async () => {
                const { data, error } = await supabase.from('NewsEvent')
                    .select('*, sources:Source(*), signals:Signal(*)')
                    .eq('id', id)
                    .single();
                if (error) { console.error(error); return null; }
                return data;
            },
            [`event-${id}-v10`],
            { revalidate: 3600 }
        )();
    },

    getSignal: async (id: string) => {
        return unstable_cache(
            async () => {
                const { data, error } = await supabase.from('Signal')
                    .select('*, event:NewsEvent(*, sources:Source(*))')
                    .eq('id', id)
                    .single();
                if (error) { console.error(error); return null; }
                return data;
            },
            [`signal-${id}-v10`],
            { revalidate: 3600 }
        )();
    },

    getPaginatedSignals: async (cursor: string | undefined, limit: number = 20) => {
        const { data, error } = await supabase.from('Signal')
            .select(`
                *,
                event:NewsEvent(id, title, category, status, detectedAt, lastUpdatedAt, confidenceScore, sources:Source(*))
            `)
            .order('generatedAt', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getSignals: async (category?: string, limit?: number, skip: number = 0) => {
        let targetCategories: string[] = [];
        if (category) {
            const c = category.toLowerCase();
            targetCategories = [category];
            if (c === 'tech') targetCategories = ['Technology', 'technology', 'Tech'];
            else if (c === 'business') targetCategories = ['Business', 'economy', 'Business & Finance'];
            else if (c === 'global') targetCategories = ['Global', 'international', 'World'];
            else if (c === 'ai') targetCategories = ['AI', 'Artificial Intelligence', 'Robotics'];
            else if (c === 'auto') targetCategories = ['Auto', 'Automotive', 'EV', 'Electric Vehicles', 'Cars'];
            else if (c === 'pakistan') targetCategories = ['Pakistan', 'Startup Pakistan'];
            else if (c === 'sports') targetCategories = ['Sports'];
            else targetCategories = [category, c, c.charAt(0).toUpperCase() + c.slice(1)];
        }

        // TEMPORARY: Bypass cache for category debugging
        return unstable_cache(
            async () => {
                let query = supabase.from('Signal')
                    .select(`
                        id, headline, summary, imageUrl, generatedAt, eventId,
                        event:NewsEvent(id, title, category, status, detectedAt, lastUpdatedAt, confidenceScore, sources:Source(*))
                    `)
                    .order('generatedAt', { ascending: false });

                if (targetCategories.length > 0) {
                    query = query.in('NewsEvent.category', targetCategories);
                }

                if (limit) {
                    query = query.range(skip, skip + limit - 1);
                }

                const { data, error } = await query;
                if (error) { console.error("getSignals Error:", error); return []; }
                
                console.log(`[DB] getSignals(${category}): found ${data?.length || 0} signals`);
                
                return data || [];
            },
            [`signals-${category || 'all'}-${limit || 0}-${skip || 0}-v11`],
            { revalidate: 60, tags: ['signals'] } // Cache for 60 seconds
        )();
    },

    getHomePageData: async () => {
        return unstable_cache(
            async () => {
                const commonSignalSelect = `id, headline, summary, imageUrl, generatedAt, eventId, event:NewsEvent(id, title, category, sources:Source(*))`;

                const [trendingReq, signalsReq, eventsReq] = await Promise.all([
                    supabase.from('Signal').select(commonSignalSelect).order('generatedAt', { ascending: false }).limit(10),
                    supabase.from('Signal').select(commonSignalSelect).order('generatedAt', { ascending: false }).limit(20),
                    supabase.from('NewsEvent').select('id, title, category, sources:Source(*)').order('detectedAt', { ascending: false }).limit(20)
                ]);

                if (trendingReq.error) console.error("getHomePageData trending error:", trendingReq.error.message, trendingReq.error.code, trendingReq.error.details);
                if (signalsReq.error) console.error("getHomePageData signals error:", signalsReq.error.message, signalsReq.error.code, signalsReq.error.details);
                if (eventsReq.error) console.error("getHomePageData events error:", eventsReq.error.message, eventsReq.error.code, eventsReq.error.details);

                console.log(`[DB] getHomePageData v10: trending=${trendingReq.data?.length}, signals=${signalsReq.data?.length}`);

                return {
                    trending: trendingReq.data || [],
                    signals: signalsReq.data || [],
                    events: eventsReq.data || []
                };
            },
            ['home-page-data-v10'],
            { revalidate: 3600 }
        )().catch((err: any) => {
            console.error("getHomePageData caught error:", err);
            return { trending: [], signals: [], events: [] };
        });
    },

    getTrending: async (limit: number = 3) => {
        const { data, error } = await supabase.from('Signal')
            .select('*, event:NewsEvent(*)')
            .order('generatedAt', { ascending: false })
            .limit(limit);
        if (error) { console.error(error); return []; }
        return data || [];
    },

    getExistingUrls: async (urls: string[]) => {
        const { data, error } = await supabase.from('Source')
            .select('url')
            .in('url', urls);
        if (error) { console.error(error); return new Set(); }
        return new Set((data || []).map((s: any) => s.url));
    },

    addEvent: async (data: any) => {
        try {
            let { id, title, category, status, detectedAt, sources, imageUrl } = data;

            if (!imageUrl) {
                imageUrl = generateNewsImage(title, category);
            }

            // Insert Event
            const { error: eventError } = await supabase.from('NewsEvent').insert({
                id,
                title,
                category,
                status,
                detectedAt: new Date(detectedAt).toISOString(),
                confidenceScore: 0.9,
                imageUrl
            });

            if (eventError) {
                console.error("DB Add Event Error (insert event):", eventError);
                return;
            }

            // Insert Sources
            if (sources && sources.length > 0) {
                const sourcesData = sources.map((s: any) => ({
                    id: `src_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    eventId: id,
                    name: s.name,
                    url: s.url,
                    reliabilityScore: s.reliabilityScore,
                    type: s.type
                }));
                const { error: sourceError } = await supabase.from('Source').insert(sourcesData);
                if (sourceError) {
                    console.error("DB Add Event Sources Error:", sourceError);
                }
            }
        } catch (e) {
            console.error("DB Add Event Error", e);
        }
    },

    addSignal: async (data: any) => {
        try {
            const { error } = await supabase.from('Signal').insert({
                id: data.id,
                eventId: data.eventId,
                headline: data.headline,
                summary: data.summary,
                generatedAt: new Date(data.generatedAt).toISOString(),
                imageUrl: data.imageUrl,
                fullReport: data.fullReport
            });

            if (error) {
                console.error("DB Add Signal Error:", error);
                return;
            }

            triggerIndexNow(`https://quiknews.online/news/${data.id}`);
        } catch (e) {
            console.error("DB Add Signal Error", e);
        }
    },

    getTodayCount: async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const { count, error } = await supabase.from('NewsEvent')
            .select('*', { count: 'exact', head: true })
            .gte('detectedAt', startOfDay.toISOString());

        if (error) { console.error(error); return 0; }
        return count || 0;
    }
};
