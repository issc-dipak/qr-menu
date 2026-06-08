import { createBrowserClient } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// ─── Browser client (use in components & hooks) ───────────────
// Uses createBrowserClient under the hood for cookie/SSR session sharing,
// but typed as SupabaseClient<Database> for full schema type-safety.
export const supabase = createBrowserClient(supabaseUrl, supabaseKey) as unknown as SupabaseClient<Database>;
