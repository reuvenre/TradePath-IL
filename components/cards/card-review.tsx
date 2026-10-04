"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { LtrText } from "@/components/lesson/ltr-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DueCard } from "@/lib/learner/queries";
import { reviewCard } from "@/lib/learner/actions";
import { localDate } from "@/lib/srs/leitner";
import { he } from "@/lib/strings/he";

/** Flashcard review: front, back, "knew it / did not". Scheduling is lib/srs/leitner on the server. */
export function CardReview({ cards, persist }: { cards: DueCard[]; persist: boolean }) {
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [knew, setKnew] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const card = cards[index];
  const done = index >= cards.length;

  function grade(knewIt: boolean) {
    if (!card || pending) return;
    const advance = () => {
      if (knewIt) setKnew((k) => k + 1);
      setShowBack(false);
      setIndex((i) => i + 1);
    };
    if (!persist) {
      advance();
      return;
    }
    start(async () => {
      const r = await reviewCard({ cardId: card.id, knewIt, today: localDate() });
      if (!r.ok) setError(r.error);
      advance();
    });
  }

  if (done) {
    return (
      <section className="mx-auto max-w-xl rounded-xl border p-5 text-center" role="status">
        <h2 className="text-lg font-semibold">{he.cards.doneTitle}</h2>
        <p className="mt-2 leading-relaxed">{he.cards.doneBody(knew, cards.length)}</p>
        {error ? (
          <p role="alert" className="mt-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button render={<Link href="/" />} className="mt-4 min-h-11">
          {he.cards.toToday}
        </Button>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl" aria-live="polite">
      <Progress value={(index / cards.length) * 100} label={he.cards.cardOf(index + 1, cards.length)} size="sm" />
      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>{he.cards.cardOf(index + 1, cards.length)}</span>
        <Badge variant="muted">{he.cards.box(card.box)}</Badge>
      </div>

      <div className="mt-3 min-h-56 rounded-2xl border bg-card p-6 shadow-xs">
        <p className="text-xs text-muted-foreground">{he.cards.fromLesson(card.lessonTitle)}</p>
        <LtrText as="p" className="mt-3 text-xl leading-relaxed font-medium" text={card.front} />
        {showBack ? (
          <div className="mt-5 border-t pt-4">
            <LtrText as="p" className="text-lg leading-relaxed" text={card.back} />
          </div>
        ) : null}
      </div>

      {showBack ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="outline" className="min-h-12 text-base" onClick={() => grade(false)} disabled={pending}>
            <X aria-hidden />
            {he.cards.didNot}
          </Button>
          <Button className="min-h-12 text-base" onClick={() => grade(true)} disabled={pending}>
            <Check aria-hidden />
            {he.cards.knew}
          </Button>
        </div>
      ) : (
        <Button className="mt-4 min-h-12 w-full text-base" onClick={() => setShowBack(true)}>
          {he.cards.showAnswer}
        </Button>
      )}
    </section>
  );
}
