import { TodayScreen } from "@/components/today/today-screen";
import { mockUnlocks, scenarioFrom } from "../mock";

export default async function DevTodayPage({ searchParams }: { searchParams: Promise<{ scenario?: string }> }) {
  const { scenario } = await searchParams;
  return (
    <TodayScreen
      unlocks={mockUnlocks(scenarioFrom(scenario))}
      cardsDue={3}
      cardsTotal={8}
      week={{ minutesThisWeek: 45, goal: 150, streak: 2 }}
      nextStarted={false}
    />
  );
}
