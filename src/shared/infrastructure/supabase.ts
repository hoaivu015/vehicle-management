import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string): string => {
  // Try Vite's import.meta.env first
  if ((import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Try process.env (for define or Node environments)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 
                   getEnv('NEXT_PUBLIC_SUPABASE_URL') || '';

const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 
                         getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY') || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.warn('Supabase URL or Anon Key is missing or invalid. Check your environment variables.');
}

// Ensure createClient is only called with a valid URL to prevent crashing
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
