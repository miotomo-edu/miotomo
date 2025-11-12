import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "VITE_SUPABASE_URL is not defined. Add it to your environment (e.g., .env.local).",
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "VITE_SUPABASE_ANON_KEY is not defined. Add it to your environment (e.g., .env.local).",
  );
}

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);
