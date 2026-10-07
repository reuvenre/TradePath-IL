import { notFound } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { he } from "@/lib/strings/he";

// Development-only previews of the signed-in screens, so layout can be checked and tested without a
// Supabase session. Nothing here reads or writes learner data. 404 in production (see lib/routes.ts).
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <AppShell>
      <p className="mb-4 rounded-md border border-dashed px-3 py-1.5 text-center text-xs text-muted-foreground" data-testid="preview-banner">
        {he.common.previewOnly}
      </p>
      {children}
    </AppShell>
  );
}
