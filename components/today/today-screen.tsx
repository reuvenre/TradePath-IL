import { BookMarked, BookOpen, Flag, Layers, Repeat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WeekStats } from "@/lib/learner/queries";
import type { Unlocks } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";

interface Props {
  unlocks: Unlocks;
  cardsDue: number;
  cardsTotal: number;
  week: WeekStats;
  /** True when the next lesson has a started row (continue instead of start). */
  nextStarted: boolean;
}

/** "What do I do now?" — next lesson, cards due, weekly goal, streak of weeks. */
export function TodayScreen({ unlocks, cardsDue, cardsTotal, week, nextStarted }: Props) {
  const next = unlocks.nextLesson;
  const gate = unlocks.openGate;
  const pct = week.goal > 0 ? Math.min(100, (week.minutesThisWeek / week.goal) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">{he.today.title}</h1>
      <p className="mt-1 text-muted-foreground">{he.today.greeting}</p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2" data-card="next">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {gate ? <Flag className="size-4" aria-hidden /> : <BookOpen className="size-4" aria-hidden />}
              {gate ? he.today.gateOpen : next ? he.today.nextLesson : unlocks.waitingForContent ? he.today.waitingForContent : he.today.allDone}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gate ? (
              <>
                <p className="leading-relaxed">{he.today.gateBody(gate.stage)}</p>
                <Button render={<Link href={`/gate/${gate.stage}`} />} className="mt-3 min-h-11">
                  {he.today.goToGate}
                </Button>
              </>
            ) : next ? (
              <>
                <p className="text-lg font-semibold">{next.title}</p>
                <p className="text-sm text-muted-foreground">
                  {he.lesson.stageLabel(next.stage)} · {he.common.lesson} {next.order}
                </p>
                <Button render={<Link href={`/lesson/${next.id}`} />} className="mt-3 min-h-11">
                  {nextStarted ? he.today.continueLesson : he.today.startLesson}
                </Button>
              </>
            ) : (
              <p className="leading-relaxed text-muted-foreground">{unlocks.waitingForContent ? he.today.waitingForContentBody : he.today.allDone}</p>
            )}
          </CardContent>
        </Card>

        <Card data-card="cards">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="size-4" aria-hidden />
              {he.today.cardsDue}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{he.today.cardsDueCount(cardsDue)}</p>
            {cardsTotal === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">{he.today.noCardsYet}</p>
            ) : (
              <Button variant={cardsDue > 0 ? "default" : "outline"} render={<Link href="/cards" />} className="mt-3 min-h-11">
                {he.today.reviewCards}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card data-card="week">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Repeat className="size-4" aria-hidden />
              {he.today.weeklyGoal}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              <bdi dir="ltr">{he.today.weeklyGoalBody(week.minutesThisWeek, week.goal)}</bdi>
            </p>
            <Progress value={pct} label={he.today.weeklyGoal} className="mt-2" />
            <p className="mt-3 text-sm">
              <span className="font-medium">{he.today.streak}:</span> {he.today.streakBody(week.streak)}
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6">
        <Link href="/glossary" className="inline-flex min-h-11 items-center gap-2 text-primary underline-offset-4 hover:underline">
          <BookMarked className="size-4" aria-hidden />
          {he.today.glossaryLink}
        </Link>
      </p>
    </div>
  );
}
