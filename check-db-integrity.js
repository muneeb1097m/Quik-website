
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

async function check() {
    const { count: eventCount } = await supabase.from('NewsEvent').select('*', { count: 'exact', head: true });
    const { count: signalCount } = await supabase.from('Signal').select('*', { count: 'exact', head: true });
    
    console.log('Events in DB:', eventCount);
    console.log('Signals in DB:', signalCount);

    // Check if signals have corresponding events
    const { data: orphans } = await supabase.from('Signal').select('id, eventId').limit(10);
    console.log('Sample Signals:', orphans);
    
    if (orphans && orphans.length > 0) {
        const eventIds = orphans.map(s => s.eventId);
        const { data: events } = await supabase.from('NewsEvent').select('id').in('id', eventIds);
        console.log('Found matching events for signals:', events.length);
    }
}

check();
