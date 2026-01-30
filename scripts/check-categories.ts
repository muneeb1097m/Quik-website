
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking category distribution...');

    // Group by category and count
    const distribution = await prisma.newsEvent.groupBy({
        by: ['category'],
        _count: {
            category: true,
        },
    });

    console.log('Category Distribution:');
    distribution.forEach((item: any) => {
        console.log(`${item.category}: ${item._count.category}`);
    });

    // Also check the most recent 10 items to see what's coming in
    const recent = await prisma.newsEvent.findMany({
        take: 10,
        orderBy: {
            detectedAt: 'desc',
        },
        select: {
            title: true,
            category: true,
            detectedAt: true
        }
    });

    console.log('\nMost Recent 10 Events:');
    recent.forEach((item: any) => {
        console.log(`[${item.category}] ${item.title} (${item.detectedAt.toISOString()})`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
