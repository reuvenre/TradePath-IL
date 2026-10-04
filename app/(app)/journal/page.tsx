import type { Metadata } from "next";
import { EmptyScreen } from "@/components/shell/empty-screen";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.journal.title };

export default function JournalPage() {
  return <EmptyScreen title={he.journal.title} body={he.journal.empty} />;
}
