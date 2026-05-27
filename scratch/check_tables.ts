import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

console.log('supabaseUrl:', supabaseUrl);
console.log('supabaseKey:', supabaseKey ? 'exists' : 'missing');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { error } = await supabase.from('vehicles').select('id').limit(1);
  if (error) {
    console.error('Error connecting to vehicles:', error);
  } else {
    console.log('Connected to vehicles successfully!');
  }

  const { data: configData, error: configError } = await supabase.from('company_settings').select('*').limit(1);
  if (configError) {
    console.log('company_settings table does not exist or error:', configError.message);
  } else {
    console.log('company_settings table exists! Data:', configData);
    if (configData && configData.length > 0) {
      console.log('Columns in company_settings:', Object.keys(configData[0]));
    }
  }
}

checkTables();
