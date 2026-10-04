"use client";

import { BookOpen, FlaskConical, Map, NotebookPen, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, NAV_ITEMS, type NavKey } from "@/lib/routes";
import { he } from "@/lib/strings/he";
import { cn } from "@/lib/utils";

const ICONS: Record<NavKey, LucideIcon> = {
  today: BookOpen,
  roadmap: Map,
  lab: FlaskConical,
  journal: NotebookPen,
};

export function NavLinks({ variant }: { variant: "top" | "bottom" }) {
  const pathname = usePathname();

  return (
    <ul className={cn("flex", variant === "bottom" ? "justify-around" : "items-center gap-1")}>
      {NAV_ITEMS.map(({ href, key }) => {
        const Icon = ICONS[key];
        const active = isActivePath(href, pathname);
        return (
          <li key={key} className={variant === "bottom" ? "flex-1" : undefined}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center justify-center text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                variant === "bottom"
                  ? "flex-col gap-0.5 py-1.5 text-xs"
                  : "gap-2 rounded-lg px-3 text-sm hover:bg-muted hover:text-foreground",
                active && "font-semibold text-foreground",
                active && variant === "top" && "bg-muted",
              )}
            >
              <Icon className="size-5" aria-hidden strokeWidth={active ? 2.5 : 2} />
              <span>{he.nav[key]}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
