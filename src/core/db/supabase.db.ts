import { SupabaseClient } from '@supabase/supabase-js';
import { keys } from '../../config/keys.config';

/**
 * Supabase client to communicate w/ primary db
 */
export let supabaseClient: SupabaseClient;

/**
 * Assign a new supabase client instance to `supabaseClient` variable which is globally available
 */
export function createSupabaseClient() {
  supabaseClient = new SupabaseClient(keys.supabase_url, keys.supabase_key, {
    auth: { persistSession: false },
  });
}
