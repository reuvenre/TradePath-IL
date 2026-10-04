import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Roadmap } from "@/components/roadmap/roadmap";
import { getLearner } from "@/lib/learner/queries";
import { remainingLessonMinutes } from "@/lib/learner/remaining";
import { estimateWeeksLeft } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.roadmap.title };

export default async function RoadmapPage() {
  const learner = await getLearner();
  if (!learner) redirect("/sign-in");
  const weeksLeft = estimateWeeksLeft(remainingLessonMinutes(learner.unlocks), learner.profile.weekly_minutes_goal);
  return <Roadmap unlocks={learner.unlocks} weeksLeft={weeksLeft} />;
}
