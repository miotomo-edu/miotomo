import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const USER_DATA_SUPABASE_URL_EU_US =
  import.meta.env.VITE_USER_DATA_SUPABASE_URL_EU_US ?? SUPABASE_URL;
const USER_DATA_SUPABASE_ANON_KEY_EU_US =
  import.meta.env.VITE_USER_DATA_SUPABASE_ANON_KEY_EU_US ??
  SUPABASE_PUBLISHABLE_KEY;
const USER_DATA_SUPABASE_URL_AP_SOUTH =
  import.meta.env.VITE_USER_DATA_SUPABASE_URL_AP_SOUTH ?? SUPABASE_URL;
const USER_DATA_SUPABASE_ANON_KEY_AP_SOUTH =
  import.meta.env.VITE_USER_DATA_SUPABASE_ANON_KEY_AP_SOUTH ??
  SUPABASE_PUBLISHABLE_KEY;

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

const supabaseUserDataEuUs = createClient<Database>(
  USER_DATA_SUPABASE_URL_EU_US,
  USER_DATA_SUPABASE_ANON_KEY_EU_US,
);

const supabaseUserDataApSouth = createClient<Database>(
  USER_DATA_SUPABASE_URL_AP_SOUTH,
  USER_DATA_SUPABASE_ANON_KEY_AP_SOUTH,
);

export type UserDataRegion = "ap-south" | "eu-us";

export const resolveUserDataRegion = (
  region: string | null | undefined,
): UserDataRegion => {
  const normalized = String(region ?? "")
    .trim()
    .toLowerCase();

  return normalized === "ap-south" ? "ap-south" : "eu-us";
};

export const getSupabaseUserDataClient = (region?: string | null) => {
  return resolveUserDataRegion(region) === "ap-south"
    ? supabaseUserDataApSouth.schema("user_data")
    : supabaseUserDataEuUs.schema("user_data");
};

export const getUserDataSupabaseConfig = (region?: string | null) => {
  return resolveUserDataRegion(region) === "ap-south"
    ? {
        region: "ap-south" as const,
        url: USER_DATA_SUPABASE_URL_AP_SOUTH,
        anonKey: USER_DATA_SUPABASE_ANON_KEY_AP_SOUTH,
      }
    : {
        region: "eu-us" as const,
        url: USER_DATA_SUPABASE_URL_EU_US,
        anonKey: USER_DATA_SUPABASE_ANON_KEY_EU_US,
      };
};
