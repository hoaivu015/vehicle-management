import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing query with fallback:');
  
  let { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .neq('status', 'SOLD')
    .or('show_on_landing.is.null,show_on_landing.eq.true')
    .order('id', { ascending: false });

  console.log('Initial result:', { hasData: !!data, error });

  if (error && (error.message.includes('column') || error.message.includes('show_on_landing'))) {
    console.warn('Fallback triggered!');
    const fallbackResult = await supabase
      .from('vehicles')
      .select('*')
      .neq('status', 'SOLD')
      .order('id', { ascending: false });
    data = fallbackResult.data;
    error = fallbackResult.error;
    console.log('Fallback result:', { hasData: !!data, error });
  }

  if (error) {
    console.error('Final error:', error);
  } else {
    console.log(`Final success! Fetched ${data.length} vehicles.`);
  }
}

run();
