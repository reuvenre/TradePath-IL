import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getUserId } from "@/lib/supabase/server";

// Every learner page depends on the session; never prerender one.
export const dynamic = "force-dynamic";

// The proxy already redirects signed-out requests; this is the authoritative check.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!(await getUserId())) redirect("/sign-in");

  return <AppShell>{children}</AppShell>;
}
