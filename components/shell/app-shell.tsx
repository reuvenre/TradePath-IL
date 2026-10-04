import { he } from "@/lib/strings/he";
import { BottomNav } from "./bottom-nav";
import { Footer } from "./footer";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-20 rounded-lg bg-background px-4 py-3 font-medium focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:ring-2 focus:ring-ring"
      >
        {he.skipToContent}
      </a>
      <TopBar />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 outline-none">
        {children}
      </main>
      {/* Spacer keeps the footer clear of the fixed bottom nav on mobile. */}
      <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Footer />
      </div>
      <BottomNav />
    </>
  );
}
