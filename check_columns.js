import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Try to find .env file
let envPath = './.env';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('vehicles').select('*').limit(1);
  if (error) {
    console.error("Error fetching vehicles:", error.message);
    process.exit(1);
  }
  if (data && data.length > 0) {
    console.log("COLUMNS_EXIST:", JSON.stringify(Object.keys(data[0])));
  } else {
    console.log("TABLE_EMPTY_OR_NO_DATA");
  }
}

check();
