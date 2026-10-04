"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { he } from "@/lib/strings/he";

export interface GlossaryItem {
  id: string;
  he: string;
  en: string;
  short: string;
  lessonId: string;
  lessonTitle: string;
  lessonWritten: boolean;
}

/** Searchable glossary. Entries are sorted by the lesson that teaches them, so the list reads like the course. */
export function GlossaryList({ items }: { items: GlossaryItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => [t.he, t.en, t.short, t.id].some((s) => s.toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">{he.glossary.title}</h1>
      <p className="mt-1 text-muted-foreground">{he.glossary.intro}</p>

      <div className="mt-4 flex flex-col gap-1.5">
        <Label htmlFor="glossary-search">{he.glossary.search}</Label>
        <Input
          id="glossary-search"
          type="search"
          className="h-11 text-base"
          placeholder={he.glossary.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {filtered.length === 0 ? he.glossary.noResults : he.glossary.count(filtered.length)}
        </p>
      </div>

      <dl className="mt-4 divide-y rounded-xl border">
        {filtered.map((t) => (
          <div key={t.id} id={t.id} className="scroll-mt-20 px-4 py-3" data-term={t.id}>
            <dt className="font-semibold">
              {t.he} <bdi dir="ltr" className="font-normal text-muted-foreground">({t.en})</bdi>
            </dt>
            <dd className="mt-1 leading-relaxed">{t.short}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">
              {he.glossary.taughtIn}:{" "}
              {t.lessonWritten ? (
                <Link href={`/lesson/${t.lessonId}`} className="underline-offset-2 hover:underline">
                  {t.lessonTitle}
                </Link>
              ) : (
                <span>
                  {t.lessonTitle} ({he.glossary.notYetWritten})
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
