import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use a looser client typing to avoid strict "never" table typing during build-time
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey)
