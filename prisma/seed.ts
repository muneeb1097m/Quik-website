import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Mock Content Generator
    const generateMockContent = (title: string, context: string) => {
        const p1 = `In a significant development that has captured the attention of analysts, ${title} marks a pivotal moment. The implications extend beyond the immediate context.`;
        const p2 = `Deep diving into the specifics of ${context}, we see a transformation driven by shifting market dynamics. Stakeholders have expressed a mix of optimism and caution.`;
        const p3 = `Expert consensus suggests that this trend is likely to continue. "It is a paradigm shift," remarked a senior analyst.`;
        return `${p1}\n\n${p2}\n\n${p3}`;
    };

    // Helper
    const createStory = async (
        title: string,
        category: string,
        headline: string,
        summary: string,
        sourceName: string,
        imageUrl: string
    ) => {
        const event = await prisma.newsEvent.create({
            data: {
                title,
                category,
                status: 'Live',
                detectedAt: new Date(),
                confidenceScore: 0.95,
                imageUrl,
                sources: {
                    create: {
                        name: sourceName,
                        url: '#',
                        reliabilityScore: 0.95,
                        type: 'Media'
                    }
                },
                signals: {
                    create: {
                        headline,
                        summary,
                        generatedAt: new Date(),
                        imageUrl,
                        fullReport: generateMockContent(title, category)
                    }
                },
                briefs: {
                    create: {
                        bulletPoints: JSON.stringify([headline, summary, `${sourceName} confirmed the details.`]),
                        generatedAt: new Date()
                    }
                }
            }
        });
        console.log(`Created event with id: ${event.id}`);
    };

    // --- SEED DATA ---
    await createStory('Record Remittance Flow', 'Pakistan',
        'December Jackpot! Pakistan Receives $3.6 Billion in Worker\'s Remittance.',
        'State Bank of Pakistan confirms a record-breaking inflow, stabilizing foreign reserves.',
        'State Bank', '/images/news/pakistan-remittance.png'
    );

    await createStory('Karachi Development Projects', 'Pakistan',
        'Karachi Mayor Announces 100-Day "Green City" Projects.',
        'New initiative includes 50 new parks and solar streetlights across District Central.',
        'KMC Official', '/images/news/karachi-projects.png'
    );

    await createStory('Tesla FSD Milestone', 'Technology',
        'Tesla Driver Completes 4,000 KM Trip on FSD v14 without Disengagement.',
        'The journey from Lisbon to Berlin showcases the new capabilities of the neural net planner.',
        'AutoDaily', '/images/news/tesla-fsd.png'
    );

    await createStory('PSX All-Time High', 'Economy',
        'PSX 100 Index Breaches 110,000 Points Mark.',
        'Investor confidence rallies following IMF tranche release and stable rupee parity.',
        'Dawn Business', '/images/news/psx-high.png'
    );

    await createStory('SpaceX Launches 60 V3 Satellites', 'International',
        'SpaceX Launches 60 V3 Satellites, Expanding Direct-to-Cell in Asia.',
        'Service now active in Philippines and Japan, targeting South Asia next.',
        'Reuters', '/images/news/spacex-starlink.png'
    );

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
