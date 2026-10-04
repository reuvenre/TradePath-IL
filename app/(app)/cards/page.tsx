import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CardReview } from "@/components/cards/card-review";
import { Button } from "@/components/ui/button";
import { getCards, getLearner } from "@/lib/learner/queries";
import { localDateOf } from "@/lib/learner/week";
import { he } from "@/lib/strings/he";

export const metadata: Metadata = { title: he.cards.title };

export default async function CardsPage() {
  const learner = await getLearner();
  if (!learner) redirect("/sign-in");
  const cards = await getCards(learner.userId, localDateOf(new Date()));

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">{he.cards.title}</h1>
      {cards.due.length === 0 ? (
        <section className="mx-auto max-w-xl rounded-xl border p-5 text-center">
          <h2 className="text-lg font-semibold">{he.cards.noneDue}</h2>
          <p className="mt-2 text-muted-foreground">{he.cards.noneDueBody(cards.nextDueOn, cards.total)}</p>
          <Button variant="outline" render={<Link href="/" />} className="mt-4 min-h-11">
            {he.cards.toToday}
          </Button>
        </section>
      ) : (
        <>
          <p className="mb-3 text-center text-sm text-muted-foreground">{he.cards.due(cards.due.length)}</p>
          <CardReview cards={cards.due} persist />
        </>
      )}
    </div>
  );
}
