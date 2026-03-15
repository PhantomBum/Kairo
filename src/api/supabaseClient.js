import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let supabase;

try {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local');
  }
  supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder', {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: { eventsPerSecond: 10 },
    },
  });
} catch (err) {
  console.error('Failed to create Supabase client:', err);
  const noOp = () => Promise.resolve({ data: null, error: { message: 'Supabase not initialized' } });
  supabase = new Proxy({}, {
    get() {
      return new Proxy(() => {}, { get: () => noOp, apply: noOp });
    },
  });
}

export { supabase };
