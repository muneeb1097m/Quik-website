'use server';

import { db } from '@/lib/qie/db';
import { serialize } from '@/lib/utils';
import { Signal, NewsEvent } from '@/types';

export async function loadMoreSignals(cursor: string | undefined) {
    try {
        const newSignals = await db.getPaginatedSignals(cursor, 20);
        return serialize(newSignals);
    } catch (error) {
        console.error('Error loading more signals:', error);
        return [];
    }
}
