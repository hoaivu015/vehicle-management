import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // 1. Get database schema details for show_on_landing if possible
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, name, code, status, show_on_landing')
    .neq('status', 'SOLD');

  if (error) {
    console.error('Error fetching show_on_landing status:', error);
  } else {
    console.log(`Fetched ${data.length} active/available vehicles:`);
    data.forEach(v => {
      console.log(`- ID: ${v.id}, Name: "${v.name}", Code: "${v.code}", Status: "${v.status}", show_on_landing: ${v.show_on_landing} (${typeof v.show_on_landing})`);
    });
  }
}

run();
