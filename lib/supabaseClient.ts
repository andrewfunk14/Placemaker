// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://example.supabase.co';
const supabaseAnonKey = 'REMOVED_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// import { createClient } from "@supabase/supabase-js";
// import Constants from "expo-constants";

// const extra = Constants.expoConfig?.extra ?? {};

// export const supabase = createClient(
//   extra.SUPABASE_URL ?? "",
//   extra.SUPABASE_ANON_KEY ?? ""
// );
