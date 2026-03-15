
require('dotenv').config();
const { db } = require('./src/lib/qie/db');

async function test() {
    console.log('Fetching a single signal...');
    // We'll use getSignals since we don't have an ID handy
    const signals = await db.getSignals(undefined, 1);
    if (signals.length > 0) {
        const signal = signals[0];
        console.log('generatedAt type:', typeof signal.generatedAt);
        console.log('generatedAt value:', signal.generatedAt);
        try {
            console.log('Calling .toISOString()...');
            console.log(signal.generatedAt.toISOString());
        } catch (e) {
            console.error('FAILED to call .toISOString():', e.message);
        }
    } else {
        console.log('No signals found.');
    }
}

test();
