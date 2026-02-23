import { PrismaClient, NewsEvent, Signal, Brief, Source } from '@prisma/client';
import { generateNewsImage } from '../image-gen';

// Singleton pattern for Prisma Client in Next.js dev environment
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// --- Helper accessors mirroring old API for compatibility ---
export const db = {
    getEvents: async (limit?: number) => {
        return await prisma.newsEvent.findMany({
            include: { sources: true },
            orderBy: { detectedAt: 'desc' },
            take: limit
        });
    },

    getEvent: async (id: string) => {
        return await prisma.newsEvent.findUnique({
            where: { id },
            include: { sources: true, signals: true }
        });
    },

    getSignal: async (id: string) => {
        return await prisma.signal.findUnique({
            where: { id },
            include: {
                event: {
                    include: { sources: true }
                }
            }
        });
    },

    // Cursor-based pagination for infinite scroll
    getPaginatedSignals: async (cursor: string | undefined, limit: number = 20) => {
        const signals = await prisma.signal.findMany({
            take: limit,
            skip: cursor ? 1 : 0, // Skip the cursor itself if present
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { generatedAt: 'desc' },
            include: {
                event: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        sources: true,
                        status: true,
                        detectedAt: true,
                        lastUpdatedAt: true,
                        confidenceScore: true
                    }
                }
            }
        });
        return signals;
    },

    getSignals: async (category?: string, limit?: number, skip?: number) => {
        let whereClause = {};

        if (category) {
            const c = category.toLowerCase();
            let targetCategories: string[] = [category]; // Default to exact match

            // Map URL slug to DB categories (handling both legacy and new Gemini outputs)
            if (c === 'tech') targetCategories = ['Technology', 'technology', 'Tech'];
            else if (c === 'business') targetCategories = ['Business', 'economy', 'Business & Finance'];
            else if (c === 'global') targetCategories = ['Global', 'international', 'World'];
            else if (c === 'ai') targetCategories = ['AI', 'Artificial Intelligence', 'Robotics'];
            else if (c === 'auto') targetCategories = ['Auto', 'Automotive', 'EV', 'Electric Vehicles', 'Cars'];
            else if (c === 'pakistan') targetCategories = ['Pakistan', 'Startup Pakistan'];
            else if (c === 'sports') targetCategories = ['Sports'];
            else targetCategories = [category, c, c.charAt(0).toUpperCase() + c.slice(1)];

            whereClause = {
                event: {
                    category: {
                        in: targetCategories,
                        mode: 'insensitive' // Optional if using Postgres, but good helper
                    }
                }
            };
        }

        // Fetch signals with filter applied at DB level
        const signals = await prisma.signal.findMany({
            where: whereClause,
            select: {
                id: true,
                headline: true,
                summary: true,
                imageUrl: true,
                generatedAt: true,
                eventId: true,
                event: {
                    select: {
                        id: true,
                        title: true,
                        category: true,
                        sources: true,
                        status: true,
                        detectedAt: true,
                        lastUpdatedAt: true,
                        confidenceScore: true
                    }
                }
            },
            orderBy: { generatedAt: 'desc' },
            take: limit,
            skip: skip
        });

        return signals;
    },

    // Optimized single query for homepage data - reduces TTFB significantly
    getHomePageData: async () => {
        // Fetch all data in parallel for maximum performance
        // Select specific fields to reduce payload size (exclude fullReport)
        const commonSignalSelect = {
            id: true,
            headline: true,
            summary: true,
            imageUrl: true,
            generatedAt: true,
            eventId: true,
            event: {
                select: {
                    id: true,
                    title: true,
                    category: true,
                    sources: true
                }
            }
        };

        const [trending, signals, events] = await Promise.all([
            prisma.signal.findMany({
                take: 10, // Reduced from 20 -> 10 (Page only needs ~7)
                orderBy: { generatedAt: 'desc' },
                select: commonSignalSelect
            }),
            prisma.signal.findMany({
                take: 20, // Reduced from 50 -> 20 (Page limit is 20)
                orderBy: { generatedAt: 'desc' },
                select: commonSignalSelect
            }),
            prisma.newsEvent.findMany({
                take: 20, // Reduced from 50 -> 20
                orderBy: { detectedAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    category: true,
                    sources: true
                }
            })
        ]);

        return { trending, signals, events };
    },

    getTrending: async (limit: number = 3) => {
        return await prisma.signal.findMany({
            take: limit,
            orderBy: { generatedAt: 'desc' },
            include: { event: true }
        });
    },



    getExistingUrls: async (urls: string[]) => {
        const found = await prisma.source.findMany({
            where: {
                url: { in: urls }
            },
            select: { url: true } // Only need the URL string
        });
        return new Set(found.map(s => s.url));
    },

    // Setter (used by Cron)
    addEvent: async (data: any) => {
        // "Upsert" logic ideally, but for now simple create
        // Data shape from cron is complex, need to map it back to Prisma schema
        try {
            let { id, title, category, status, detectedAt, sources, signals, imageUrl } = data;

            // Generate AI image if one wasn't provided (or if we want to enforce it)
            // The user requested "whenever a news going to add... create an image"
            // So we will prioritize generating one if the incoming one is missing or generic.
            // For now, let's generate one if imageUrl is missing OR if we want to ensure high quality (optional).
            // Let's assume we always generate a fallback if missing, but maybe we should specificially do it as requested.
            // "whenever a news going to add... create an image" implies we should probably generate one.
            if (!imageUrl) {
                imageUrl = generateNewsImage(title, category);
            }

            // Create Event
            await prisma.newsEvent.create({
                data: {
                    id,
                    title,
                    category,
                    status,
                    detectedAt: new Date(detectedAt),
                    confidenceScore: 0.9,
                    imageUrl,
                    sources: {
                        create: sources.map((s: any) => ({
                            name: s.name,
                            url: s.url,
                            reliabilityScore: s.reliabilityScore,
                            type: s.type
                        }))
                    }
                }
            });

        } catch (e) {
            console.error("DB Add Event Error", e);
        }
    },

    addSignal: async (data: any) => {
        try {
            await prisma.signal.create({
                data: {
                    id: data.id,
                    eventId: data.eventId,
                    headline: data.headline,
                    summary: data.summary,
                    generatedAt: new Date(data.generatedAt),
                    imageUrl: data.imageUrl,
                    fullReport: data.fullReport
                }
            });
        } catch (e) {
            console.error("DB Add Signal Error", e);
        }
    },

    getTodayCount: async () => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        return await prisma.newsEvent.count({
            where: {
                detectedAt: {
                    gte: startOfDay
                }
            }
        });
    }
};
