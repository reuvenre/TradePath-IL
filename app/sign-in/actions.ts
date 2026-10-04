"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { he } from "@/lib/strings/he";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

// `email` is echoed back on error so the learner does not retype it.
export type SignInState = { status: "idle" | "sent" | "error"; message?: string; email?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { status: "error", message: he.signIn.invalidEmail, email };
  if (!isSupabaseConfigured) return { status: "error", message: he.signIn.notConfigured, email };

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) return { status: "error", message: he.signIn.failed, email };
  return { status: "sent", message: he.signIn.sent };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
