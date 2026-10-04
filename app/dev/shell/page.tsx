import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { EmptyScreen } from "@/components/shell/empty-screen";
import { he } from "@/lib/strings/he";

// Development-only preview of the signed-in shell, so layout can be checked (and tested)
// without a Supabase session. Shows no user data. Returns 404 in production.
export default function ShellPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <AppShell>
      <EmptyScreen title={he.today.title} heading={he.today.emptyTitle} body={he.today.emptyBody} />
    </AppShell>
  );
}
