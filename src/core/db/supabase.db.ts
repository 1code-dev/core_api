import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { keys } from '../../config/keys.config';
import { Database } from '../../types/supabase';

/**
 * Supabase client to communicate w/ primary db
 */
export const supabaseClient = createClient<Database>(
  keys.supabase_url,
  keys.supabase_key,
  {
    auth: {
      persistSession: false,
    },
  },
);
