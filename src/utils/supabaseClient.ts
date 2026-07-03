import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim().replace(/[\r\n]/g, '');
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/[\r\n]/g, '');

if (!supabaseUrl || supabaseUrl === 'https://placeholder-url.supabase.co') {
  throw new Error("La variable d'environnement NEXT_PUBLIC_SUPABASE_URL est manquante ou invalide.");
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-key') {
  throw new Error("La variable d'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY est manquante ou invalide.");
}

export const isSupabaseConfigured = true;

// Initialise le client Supabase avec persistance de session active (indispensable pour PWA/Session longue)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
