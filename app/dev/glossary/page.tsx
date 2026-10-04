import { GlossaryList } from "@/components/glossary/glossary-list";
import { glossaryItems } from "@/lib/content/glossary-view";

export default function DevGlossaryPage() {
  return <GlossaryList items={glossaryItems()} />;
}
