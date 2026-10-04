"use client";

import { BookMarked } from "lucide-react";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { he } from "@/lib/strings/he";

export interface TermInfo {
  id: string;
  he: string;
  en: string;
  short: string;
}

/**
 * First use of a glossary term inside a lesson. Tap or click shows the one-sentence definition
 * and a link to the glossary. The definition is passed in by the server, so this stays a thin client piece.
 */
export function Term({ term, children }: { term: TermInfo | undefined; children: React.ReactNode }) {
  if (!term) return <span className="font-medium">{children}</span>;
  return (
    <Popover>
      <PopoverTrigger
        className="inline rounded-sm border-b border-dotted border-current px-0.5 font-medium text-primary underline-offset-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`${he.glossary.termTooltip}: ${term.he}`}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent>
        <p className="font-semibold">
          {term.he} <bdi dir="ltr" className="font-normal text-muted-foreground">({term.en})</bdi>
        </p>
        <p className="mt-1 leading-relaxed">{term.short}</p>
        <Link
          href={`/glossary#${term.id}`}
          className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          <BookMarked className="size-4" aria-hidden />
          {he.glossary.termLink}
        </Link>
      </PopoverContent>
    </Popover>
  );
}
