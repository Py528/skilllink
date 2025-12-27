import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

if (!supabaseUrl || !serviceRoleKey) {
  // Intentionally avoid throwing at import time in Next.js dev
  // Consumers should handle missing client at call sites
  console.warn('[supabaseServer] Missing SUPABASE env vars')
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false }
})


