import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client with the service-role key.
 * Bypasses RLS. NEVER import from client components.
 * Used by API routes for booking inserts and admin booking reads.
 */
export function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
