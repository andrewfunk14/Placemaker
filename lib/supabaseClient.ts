// lib/supabaseClient.ts



import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const supabase = createClient(
  extra.SUPABASE_URL ?? "",
  extra.SUPABASE_ANON_KEY ?? ""
);
