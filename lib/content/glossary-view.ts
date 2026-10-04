import type { GlossaryItem } from "@/components/glossary/glossary-list";
import { lessonIndex, lessonSpec } from "./curriculum";
import { lessonExists, readGlossary } from "./loader";

/** Glossary entries joined with their lesson, in curriculum order. */
export function glossaryItems(): GlossaryItem[] {
  return readGlossary()
    .map((g) => ({
      id: g.id,
      he: g.he,
      en: g.en,
      short: g.short,
      lessonId: g.introducedIn,
      lessonTitle: lessonSpec(g.introducedIn)?.title ?? g.introducedIn,
      lessonWritten: lessonExists(g.introducedIn),
    }))
    .sort((a, b) => lessonIndex(a.lessonId) - lessonIndex(b.lessonId) || a.he.localeCompare(b.he, "he"));
}
