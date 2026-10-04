// "/dev" holds development-only previews; its pages return 404 in production.
const PUBLIC_PREFIXES =
  process.env.NODE_ENV === "production" ? ["/sign-in", "/auth"] : ["/sign-in", "/auth", "/dev"];

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export const NAV_ITEMS = [
  { href: "/", key: "today" },
  { href: "/roadmap", key: "roadmap" },
  { href: "/lab", key: "lab" },
  { href: "/journal", key: "journal" },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

export function isActivePath(href: string, pathname: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
