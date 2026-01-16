import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

console.log('DEBUG: DATABASE_URL is', process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED');
console.log('DEBUG: Current directory:', process.cwd());

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
    // --- SEED DATA ---

    // 1. PAKISTAN (Startup Pakistan)
    await createStory('Record Remittance Flow', 'Pakistan', 'December Jackpot! Pakistan Receives $3.6 Billion in Worker\'s Remittance.', 'State Bank of Pakistan confirms a record-breaking inflow, stabilizing foreign reserves.', 'State Bank', 'https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?q=80&w=2957&auto=format&fit=crop');
    await createStory('Karachi Green City', 'Pakistan', 'Karachi Mayor Announces 100-Day "Green City" Projects.', 'New initiative includes 50 new parks and solar streetlights across District Central.', 'KMC Official', 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=2874&auto=format&fit=crop');
    await createStory('IT Exports Surge', 'Pakistan', 'Pakistan IT Exports Cross $300 Million in November.', 'The monthly figure marks an all-time high, driven by freelance growth.', 'MoIT', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop');
    await createStory('Gwadar Port Activity', 'Pakistan', 'Gwadar Port Handles Record Cargo Shipment', 'Operational capacity increases as new cranes are installed.', 'Gwadar Pro', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2940&auto=format&fit=crop');
    await createStory('Lahore Smog Reduction', 'Pakistan', 'Artificial Rain Successful in Lowering Lahore Smog Levels', 'Punjab government plans weekly cloud seeding operations.', 'Env Ministry', 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?q=80&w=2940&auto=format&fit=crop');

    // 2. TECHNOLOGY
    await createStory('Tesla FSD Milestone', 'Technology', 'Tesla Driver Completes 4,000 KM Trip on FSD v14 without Disengagement.', 'The journey from Lisbon to Berlin showcases the new capabilities of the neural net planner.', 'AutoDaily', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2940&auto=format&fit=crop');
    await createStory('GPT-5 Rumors', 'Technology', 'OpenAI CEO Hints at "Materially Better" GPT-5 in Late 2026', 'New model expected to feature long-horizon reasoning and agentic capabilities.', 'TechCrunch', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop');
    await createStory('Apple Vision Air', 'Technology', 'Apple Supply Chain Leaks "Budget" Vision Headset for 2026', 'Targeting $1500 price point to capture mass market adoption.', '9to5Mac', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2874&auto=format&fit=crop');
    await createStory('Nvidia H200', 'Technology', 'Nvidia Announces H200 Chips are "Sold Out" Until 2027', 'AI infrastructure demand shows no signs of slowing down.', 'The Verge', 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop');
    await createStory('SpaceX Starship', 'Technology', 'Starship Successfully Catches Booster on Fifth Attempt', 'Mechazilla tower proves viability of rapid reuse.', 'SpaceX', 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2940&auto=format&fit=crop');

    // 3. ECONOMY (Business)
    await createStory('PSX All-Time High', 'Economy', 'PSX 100 Index Breaches 110,000 Points Mark.', 'Investor confidence rallies following IMF tranche release and stable rupee parity.', 'Dawn Business', 'https://images.unsplash.com/photo-1611974765270-ca12586343bb?q=80&w=2940&auto=format&fit=crop');
    await createStory('Gold Prices Drop', 'Economy', 'Gold Prices Drop by Rs. 5000 per Tola in Local Market', 'Global correction impacts local bullion rates significantly.', 'ForexPK', 'https://images.unsplash.com/photo-1610375461246-83df859d849d?q=80&w=2940&auto=format&fit=crop');
    await createStory('Oil Prices Surge', 'Economy', 'Oil Jumps to $85/Barrel correct Amid Middle East Tensions', 'Supply chain concerns drive futures higher.', 'Bloomberg', 'https://images.unsplash.com/photo-1542332213-9b5a5a7fadfc?q=80&w=2940&auto=format&fit=crop');
    await createStory('Inflation Data', 'Economy', 'Inflation Falls to Single Digits for First Time in 3 Years', 'PBS data shows CPI at 9.4% for the month of January.', 'PBS', 'https://images.unsplash.com/photo-1526304640156-62ae536fa47c?q=80&w=2940&auto=format&fit=crop');
    await createStory('Startup Funding', 'Economy', 'Pakistan Startups Raise $15M in Q1 2026', 'Fintech and Logistics sectors lead the investment recovery.', 'Magnitt', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?q=80&w=2940&auto=format&fit=crop');

    // 4. INTERNATIONAL
    await createStory('SpaceX Satellites', 'International', 'SpaceX Launches 60 V3 Satellites, Expanding Direct-to-Cell.', 'Service now active in Philippines and Japan.', 'Reuters', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2940&auto=format&fit=crop');
    await createStory('US Elections', 'International', 'Early Polling Shows Tight Race in Swing States', 'Analysts predict record voter turnout in upcoming midterms.', 'CNN', 'https://images.unsplash.com/photo-1540910419868-474947be5c14?q=80&w=2878&auto=format&fit=crop');
    await createStory('EU AI Act', 'International', 'European Union Passes Landmark AI Regulation Act', 'Tech giants must comply with new transparency rules by 2027.', 'BBC', 'https://images.unsplash.com/photo-1473186578172-c141e6798cf4?q=80&w=2873&auto=format&fit=crop');
    await createStory('China EV Markets', 'International', 'China EV Makers Capture 20% of European Market Share', 'Exports surge despite new tariff discussions.', 'Global Times', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2940&auto=format&fit=crop');
    await createStory('Global Warming', 'International', '2025 Confirmed as Hottest Year on Record', 'UN Climate report calls for immediate emission cuts.', 'UN News', 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2940&auto=format&fit=crop');

    // 5. SPORTS
    await createStory('Champions Trophy', 'Sports', 'PCB Unveils Schedule for Champions Trophy 2026', 'Lahore to host the final match at Gaddafi Stadium.', 'PCB', 'https://images.unsplash.com/photo-1531415074968-bc08640daf13?q=80&w=2940&auto=format&fit=crop');
    await createStory('Babar Azam Century', 'Sports', 'Babar Azam Scores 20th ODI Century against Australia', 'Captain leads team to a comfortable victory in Sydney.', 'ESPN', 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?q=80&w=2940&auto=format&fit=crop');
    await createStory('Football World Cup', 'Sports', 'FIFA Announces Host Cities for 2030 World Cup', 'Matches to be held across three continents for the first time.', 'FIFA', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=2940&auto=format&fit=crop');
    await createStory('Olympics Prep', 'Sports', 'Pakistan Arshad Nadeem Begins Training for LA 2028', 'Gold medalist eyes new world record.', 'Geo Sports', 'https://images.unsplash.com/photo-1610986682547-79753c15647f?q=80&w=2940&auto=format&fit=crop');
    await createStory('PSL Draft', 'Sports', 'PSL 11 Draft: Top International Players Sign Up', 'Steve Smith and Joe Root join the league for the first time.', 'PSL', 'https://images.unsplash.com/photo-1512719994953-eab550925ddf?q=80&w=2940&auto=format&fit=crop');

    // 6. AUTO
    await createStory('Toyota Hybrid', 'Auto', 'Toyota Indus Launches Corolla Cross Hybrid Local Assembly', 'Pricing starts at PKR 9.5 Million.', 'PakWheels', 'https://images.unsplash.com/photo-1632245889029-e4179042d50d?q=80&w=2940&auto=format&fit=crop');
    await createStory('Kia EV5', 'Auto', 'Kia Teases EV5 Launch in Pakistan for Late 2026', 'Electric SUV effectively replaces the Sportage lineup.', 'CarSpirit', 'https://images.unsplash.com/photo-1555626040-3b731028e874?q=80&w=2940&auto=format&fit=crop');
    await createStory('Suzuki Alto', 'Auto', 'Suzuki Alto Remains Best Selling Car in January', 'Sales volume doubles year-on-year.', 'PAMA', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2940&auto=format&fit=crop');
    await createStory('Petrol Prices', 'Auto', 'Petroleum Levy Increased to Rs. 80 per Liter', 'Impact on transport fares expected immediately.', 'OGRA', 'https://images.unsplash.com/photo-1522259645607-be78f3d61fb3?q=80&w=2940&auto=format&fit=crop');
    await createStory('Changan Deepal', 'Auto', 'Changan Deepal L07 Sedan Spotted Testing in Lahore', 'Premium EV challenger to enter market soon.', 'AutoJournal', 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=2940&auto=format&fit=crop');

    // 7. TELECOM
    await createStory('5G Auction', 'Telecom', 'PTA Finalizes 5G Spectrum Auction for June', 'Three major operators confirm participation.', 'PTA', 'https://images.unsplash.com/photo-1544197150-b99a580bbc7c?q=80&w=2940&auto=format&fit=crop');
    await createStory('Fiber Expansion', 'Telecom', 'PTCL Connects 100th City with Flash Fiber', 'High-speed internet penetration reaches 15%.', 'PTCL', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2940&auto=format&fit=crop');
    await createStory('Starlink License', 'Telecom', 'Starlink Receives NOC for Pakistan Operations', 'Satellite internet to serve remote areas of Balochistan.', 'PropPakistani', 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?q=80&w=2940&auto=format&fit=crop');
    await createStory('Telecom Tax', 'Telecom', 'Telecom Sector Demands Tax Rationalization', 'CEOs meet with Finance Minister.', 'Jazz', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2940&auto=format&fit=crop');
    await createStory('Zong 4G', 'Telecom', 'Zong 4G User Base Hits 50 Million Milestone', 'Network coverage expanded to Northern Areas.', 'Zong', 'https://images.unsplash.com/photo-1562408590-e32931084e23?q=80&w=2940&auto=format&fit=crop');

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
