import type { Metadata } from "next";
import { LabIndex } from "@/components/lab/lab-index";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.lab.title };

export default function LabPage() {
  return <LabIndex />;
}
