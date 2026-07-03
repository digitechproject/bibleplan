import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== '' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-url.supabase.co' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== '' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key';

if (!isSupabaseConfigured) {
  console.warn(
    "Les variables d'environnement Supabase réelles ne sont pas définies. Certaines fonctionnalités en ligne (connexion, synchronisation) seront inactives."
  );
}

// Initialise le client Supabase avec persistance de session active (indispensable pour PWA/Session longue)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
