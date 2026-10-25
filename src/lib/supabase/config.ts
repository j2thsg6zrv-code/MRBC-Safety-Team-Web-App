// The church's Supabase project. Both values are public (every visitor's
// browser receives them); the database's row level security protects the data.
// Environment variables override them, e.g. for local development.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fyfnywwaavacrpvwwvds.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_gvoAYAmgaGSBQJtcegk86w_1k1P8yOb";
