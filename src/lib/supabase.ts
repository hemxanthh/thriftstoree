import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

const resolvedUrl = supabaseUrl || 'https://placeholder.supabase.co';
const resolvedAnonKey = supabaseAnonKey || 'public-anon-key-placeholder';

if (!hasSupabaseEnv) {
  console.warn('Supabase environment variables are missing. Running in fallback mode.');
}

export const supabase = createClient(resolvedUrl, resolvedAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
