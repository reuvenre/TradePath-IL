import { he } from "@/lib/strings/he";
import { NavLinks } from "./nav-links";

export function BottomNav() {
  return (
    <nav
      aria-label={he.nav.label}
      className="fixed inset-x-0 bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <NavLinks variant="bottom" />
    </nav>
  );
}
