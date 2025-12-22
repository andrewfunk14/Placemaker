// lib/supabaseClient.ts

// development
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase ENV vars are missing. Did you set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env?");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// // production
// import { createClient } from "@supabase/supabase-js";
// import Constants from "expo-constants";

// const extra = Constants.expoConfig?.extra ?? {};

// export const supabase = createClient(
//   extra.SUPABASE_URL ?? "",
//   extra.SUPABASE_ANON_KEY ?? ""
// );
