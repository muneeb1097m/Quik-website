
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function test() {
    console.log('Fetching a single signal...');
    const { data: signals, error } = await supabase.from('Signal').select('*').limit(1);
    
    if (error) {
        console.error('Supabase Error:', error);
        return;
    }

    if (signals && signals.length > 0) {
        const signal = signals[0];
        console.log('generatedAt type:', typeof signal.generatedAt);
        console.log('generatedAt value:', signal.generatedAt);
        try {
            console.log('Attempting signal.generatedAt.toISOString()...');
            console.log(signal.generatedAt.toISOString());
        } catch (e) {
            console.error('FAILED:', e.message);
        }
        
        try {
            console.log('Attempting new Date(signal.generatedAt).toISOString()...');
            console.log(new Date(signal.generatedAt).toISOString());
        } catch (e) {
            console.error('FAILED (New Date):', e.message);
        }
    } else {
        console.log('No signals found.');
    }
}

test();
