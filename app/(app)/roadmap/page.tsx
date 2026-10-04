import type { Metadata } from "next";
import { EmptyScreen } from "@/components/shell/empty-screen";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.roadmap.title };

export default function RoadmapPage() {
  return <EmptyScreen title={he.roadmap.title} body={he.roadmap.empty} />;
}
