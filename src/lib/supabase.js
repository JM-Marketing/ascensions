import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Avertit clairement si la config Supabase manque (env vars non remplies)
export const supabaseReady = Boolean(supabaseUrl && supabaseKey)
if (!supabaseReady) {
  console.warn('[Ascensions] Supabase non configuré : remplis VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env.local')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder')
