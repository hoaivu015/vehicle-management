import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing query:');
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .neq('status', 'SOLD')
    .or('show_on_landing.is.null,show_on_landing.eq.true')
    .order('id', { ascending: false });

  if (error) {
    console.error('Query failed with error:', error);
  } else {
    console.log(`Query succeeded! Fetched ${data.length} vehicles.`);
  }
}

run();
