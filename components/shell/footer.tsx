import { he } from "@/lib/strings/he";

export function Footer() {
  return (
    <footer className="border-t px-4 py-4 text-center text-xs leading-relaxed text-muted-foreground">
      <p className="mx-auto max-w-3xl">{he.disclaimer}</p>
    </footer>
  );
}
