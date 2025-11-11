import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://dmxjfdmknrpvfivpmcou.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_i1ABF6P8GXVaVZJLQ9gVxw__AmN7VXY";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);
