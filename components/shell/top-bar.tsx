import { LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/sign-in/actions";
import { Button } from "@/components/ui/button";
import { he } from "@/lib/strings/he";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-4 px-4">
        <Link
          href="/"
          className="flex min-h-11 items-center rounded-md text-base font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <bdi dir="ltr">{he.appName}</bdi>
        </Link>
        <nav aria-label={he.nav.label} className="hidden md:block">
          <NavLinks variant="top" />
        </nav>
        <div className="ms-auto flex items-center">
          <ThemeToggle />
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="icon" className="size-11" aria-label={he.signOut}>
              <LogOut className="size-5 rtl:-scale-x-100" aria-hidden />
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
