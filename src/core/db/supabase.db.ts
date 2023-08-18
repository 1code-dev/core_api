import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { keys } from '../../config/keys.config';
import { Database } from '../../types/supabase';

/**
 * Supabase client to communicate w/ primary db
 */
export let supabaseClient: SupabaseClient;

/**
 * Assign a new supabase client instance to `supabaseClient` variable which is globally available
 */
export function createSupabaseClient() {
  supabaseClient = createClient<Database>(
    keys.supabase_url,
    keys.supabase_key,
    {
      auth: {
        persistSession: false,
      },
    },
  );
}
