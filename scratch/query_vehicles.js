import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

console.log('supabaseUrl:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*');

  if (error) {
    console.error('Error fetching vehicles:', error);
    return;
  }

  console.log(`Fetched ${data.length} vehicles from DB:`);
  data.forEach(v => {
    console.log(`- ID: ${v.id}, Name: "${v.name}", Code: "${v.code}", Status: "${v.status}", ShowOnLanding: ${v.show_on_landing}, BatteryType: ${v.battery_type}, Notes: "${v.notes}"`);
  });
}

run();
