import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const { data, error } = await supabase.from('vehicles').select('*').limit(1);
  if (error) {
    console.error('Error fetching vehicle:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Vehicle columns found:', Object.keys(data[0]));
    console.log('Sample data:', data[0]);
  } else {
    console.log('No data in vehicles table.');
  }
}

checkSchema();
