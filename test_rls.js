import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRLS() {
  console.log("--- Testing RLS ---");
  
  // Try to read from 'users' table - should ideally be protected
  const { data: users, error: userError } = await supabase.from('users').select('*');
  console.log("Read 'users' table:", userError ? `BLOCKED: ${userError.message}` : `ALLOWED (${users.length} rows)`);

  // Try to insert into 'employees' - should be strictly protected
  const { error: empError } = await supabase.from('employees').insert([{ name: 'HACKER_TEST', email: 'hacker@test.com' }]);
  console.log("Insert into 'employees':", empError ? `BLOCKED: ${empError.message}` : "ALLOWED (SECURITY RISK!)");

  // Try to read 'vehicles'
  const { data: vehicles, error: vehError } = await supabase.from('vehicles').select('*').limit(1);
  console.log("Read 'vehicles' table:", vehError ? `BLOCKED: ${vehError.message}` : `ALLOWED (${vehicles?.length || 0} rows)`);
}

testRLS();
