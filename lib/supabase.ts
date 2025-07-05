import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      images: {
        Row: {
          id: number
          url: string
          category: string
          tags: string[]
          alt: string
          created_at: string
        }
        Insert: {
          url: string
          category: string
          tags: string[]
          alt: string
        }
        Update: {
          url?: string
          category?: string
          tags?: string[]
          alt?: string
        }
      }
    }
  }
}
