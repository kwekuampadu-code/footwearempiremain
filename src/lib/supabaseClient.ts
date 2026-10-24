import { createClient } from "@supabase/supabase-js";

// Vite: set these in .env.local as VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// Next.js: rename to NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
// and swap `import.meta.env.X` for `process.env.X` below.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
