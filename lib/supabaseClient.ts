// lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

type ExtraConfig = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  extra.SUPABASE_URL ??
  "";

const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  extra.SUPABASE_ANON_KEY ??
  "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase Keys"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
