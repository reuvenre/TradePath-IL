import { Roadmap } from "@/components/roadmap/roadmap";
import { remainingLessonMinutes } from "@/lib/learner/remaining";
import { estimateWeeksLeft } from "@/lib/learner/unlock";
import { mockUnlocks, scenarioFrom } from "../mock";

export default async function DevRoadmapPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  const unlocks = mockUnlocks(scenarioFrom(scenario));
  return <Roadmap unlocks={unlocks} weeksLeft={estimateWeeksLeft(remainingLessonMinutes(unlocks), 150)} />;
}
