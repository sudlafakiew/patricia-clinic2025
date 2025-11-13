import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Use a looser client typing to avoid strict "never" table typing during build-time
// Handle missing environment variables gracefully for build-time
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<any>(supabaseUrl, supabaseAnonKey)
  : createClient<any>('https://placeholder.supabase.co', 'placeholder-key')
