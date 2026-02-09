
import { createClient } from '@supabase/supabase-js';

/**
 * SQL PARA CONFIGURAÇÃO NO SUPABASE:
 * 
 * create table generations (
 *   id uuid default gen_random_uuid() primary key,
 *   created_at timestamp with time zone default now(),
 *   user_id uuid references auth.users(id),
 *   image_url text not null,
 *   mode text,
 *   aspect_ratio text,
 *   prompt text
 * );
 * 
 * alter table generations enable row level security;
 * 
 * create policy "Users can view own generations" on generations for select using (auth.uid() = user_id);
 * create policy "Users can insert own generations" on generations for insert with check (auth.uid() = user_id);
 */

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Só inicializa se as chaves existirem para evitar erros de runtime
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
