import type { Metadata } from "next";
import { GlossaryList } from "@/components/glossary/glossary-list";
import { glossaryItems } from "@/lib/content/glossary-view";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.glossary.title };

export default function GlossaryPage() {
  return <GlossaryList items={glossaryItems()} />;
}
