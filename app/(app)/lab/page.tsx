import type { Metadata } from "next";
import { EmptyScreen } from "@/components/shell/empty-screen";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.lab.title };

export default function LabPage() {
  return <EmptyScreen title={he.lab.title} body={he.lab.empty} />;
}
