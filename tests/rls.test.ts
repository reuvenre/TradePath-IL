import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Phase 0 acceptance: a second user cannot read the first user's rows.
// Runs only when .env.local holds the Supabase keys and supabase/schema.sql is applied.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(url && anonKey && serviceKey);

describe.skipIf(!configured)("row level security", () => {
  const password = `Rls-${crypto.randomUUID()}`;
  const stamp = Date.now();
  const emails = [`rls-a-${stamp}@example.com`, `rls-b-${stamp}@example.com`];
  const userIds: string[] = [];
  let admin: SupabaseClient;
  let a: SupabaseClient;
  let b: SupabaseClient;

  beforeAll(async () => {
    const noSession = { auth: { persistSession: false, autoRefreshToken: false } };
    admin = createClient(url!, serviceKey!, noSession);
    for (const email of emails) {
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      if (error) throw error;
      userIds.push(data.user.id);
    }
    a = createClient(url!, anonKey!, noSession);
    b = createClient(url!, anonKey!, noSession);
    expect((await a.auth.signInWithPassword({ email: emails[0], password })).error).toBeNull();
    expect((await b.auth.signInWithPassword({ email: emails[1], password })).error).toBeNull();
  });

  afterAll(async () => {
    for (const id of userIds) await admin.auth.admin.deleteUser(id);
  });

  it("creates a profile on sign-up that only its owner can read", async () => {
    const own = await a.from("profiles").select("id");
    expect(own.data?.map((r) => r.id)).toEqual([userIds[0]]);
    const other = await b.from("profiles").select("id").eq("id", userIds[0]);
    expect(other.data).toEqual([]);
  });

  it("hides user A's rows from user B", async () => {
    const insert = await a
      .from("lesson_progress")
      .insert({ user_id: userIds[0], lesson_id: "s1-m1-l1", status: "started" });
    expect(insert.error).toBeNull();

    const seenByB = await b.from("lesson_progress").select("*");
    expect(seenByB.error).toBeNull();
    expect(seenByB.data).toEqual([]);
  });

  it("rejects user B writing a row as user A", async () => {
    const forged = await b
      .from("lesson_progress")
      .insert({ user_id: userIds[0], lesson_id: "s1-m1-l2", status: "started" });
    expect(forged.error).not.toBeNull();
  });

  it("does not let a learner write simulator tables", async () => {
    const forged = await a
      .from("sim_accounts")
      .insert({ user_id: userIds[0], name: "x", starting_balance: 1000, balance: 1000 });
    expect(forged.error).not.toBeNull();
  });
});
