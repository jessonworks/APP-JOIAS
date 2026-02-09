
import { createClient } from '@supabase/supabase-js';

// Fallback to placeholder strings to prevent 'supabaseUrl is required' crash during initialization.
// These will still fail during actual authentication calls but allow the app to boot.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn(
    "LuxeLens: Supabase credentials (SUPABASE_URL / SUPABASE_ANON_KEY) are missing in environment variables. " +
    "Please configure them in Vercel/Local Settings for authentication to work."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
