import { existsSync } from "node:fs";

// Integration tests (RLS) need the Supabase keys; unit tests do not.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
