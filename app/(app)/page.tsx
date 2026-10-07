import { redirect } from "next/navigation";
import { TodayScreen } from "@/components/today/today-screen";
import { getCards, getLearner, weekStats } from "@/lib/learner/queries";
import { localDateOf } from "@/lib/learner/week";

export default async function TodayPage() {
  const learner = await getLearner();
  if (!learner) redirect("/sign-in");
  const today = localDateOf(new Date());
  const cards = await getCards(learner.userId, today);
  const next = learner.unlocks.nextLesson;
  return (
    <TodayScreen
      unlocks={learner.unlocks}
      cardsDue={cards.due.length}
      cardsTotal={cards.total}
      week={weekStats(learner, today)}
      nextStarted={next ? learner.progress.has(next.id) : false}
    />
  );
}
