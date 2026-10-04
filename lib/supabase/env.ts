export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Lets the app boot (and redirect to sign-in) before the Supabase project is connected.
export const isSupabaseConfigured = supabaseUrl !== "" && supabaseAnonKey !== "";
