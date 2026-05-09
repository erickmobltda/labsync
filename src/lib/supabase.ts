import { createClient } from '@supabase/supabase-js'

// In local mode these env vars are not required.
// We still create the client so imports never fail; it just won't be called.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
