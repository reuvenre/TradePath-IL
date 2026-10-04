import { CalendarCheck, CheckCircle2, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LessonFiles } from "@/lib/content/loader";
import { moduleTitle } from "@/lib/content/curriculum";
import { localDate } from "@/lib/srs/leitner";
import { he } from "@/lib/strings/he";
import { LessonBody } from "./lesson-body";
import { LessonTimer } from "./lesson-timer";
import { ReadingProgress } from "./reading-progress";
import { isStale } from "./volatile";

interface Props {
  lesson: LessonFiles;
  /** "done" shows the completed state and the next step. */
  state: "available" | "done";
  /** false on dev previews. */
  persist: boolean;
  quizHref: string;
  /** Where "next" leads once the lesson is done: the next lesson or the stage gate. */
  nextHref: string | null;
  nextLabel: string | null;
}

export function LessonScreen({ lesson, state, persist, quizHref, nextHref, nextLabel }: Props) {
  const { meta } = lesson;
  const today = localDate();
  const stale = meta.volatile && meta.verified_on ? isStale(meta.verified_on, today) : false;
  const moduleName = meta.module ? moduleTitle(meta.stage, meta.module) : undefined;

  return (
    <article className="mx-auto max-w-2xl">
      <ReadingProgress />
      {persist ? <LessonTimer lessonId={meta.id} /> : null}

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{he.lesson.stageLabel(meta.stage)}</span>
          {moduleName ? (
            <>
              <span aria-hidden>·</span>
              <span>{moduleName}</span>
            </>
          ) : null}
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-4" aria-hidden />
            {he.lesson.minutes(meta.minutes)}
          </span>
          {!persist ? (
            <Badge variant="outline" className="ms-auto">
              <Eye aria-hidden />
              {he.lesson.previewBadge}
            </Badge>
          ) : null}
          {state === "done" ? (
            <Badge variant="success" className={persist ? "ms-auto" : undefined}>
              <CheckCircle2 aria-hidden />
              {he.common.done}
            </Badge>
          ) : null}
        </div>
        <h1 className="mt-2 text-3xl font-bold leading-tight">{meta.title}</h1>

        <section className="mt-5 rounded-xl border bg-muted/40 p-4" aria-labelledby="objectives-heading">
          <h2 id="objectives-heading" className="text-sm font-semibold text-muted-foreground">
            {he.lesson.objectives}
          </h2>
          <ul className="mt-2 list-disc space-y-1 ps-5 leading-relaxed">
            {meta.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>

        {meta.volatile && meta.verified_on ? (
          <p
            role="note"
            className={`mt-3 flex items-start gap-2 rounded-lg border p-3 text-sm ${stale ? "border-amber-500/40 bg-amber-500/10" : "bg-muted/40"}`}
          >
            <CalendarCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {he.lesson.volatileBanner("")}
              <bdi dir="ltr">{meta.verified_on}</bdi>
              {stale ? ` ${he.lesson.volatileStale}` : ""}
            </span>
          </p>
        ) : null}
      </header>

      <LessonBody body={lesson.body} lessonId={meta.id} persist={persist} />

      <footer className="mt-10 border-t pt-6">
        {state === "done" ? (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="size-5" aria-hidden />
              {he.lesson.completed}
            </p>
            <p className="mt-1 text-sm">{he.lesson.completedBody}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {nextHref && nextLabel ? (
                <Button render={<Link href={nextHref} />} className="min-h-11">
                  {nextLabel}
                </Button>
              ) : null}
              <Button variant="outline" render={<Link href={quizHref} />} className="min-h-11">
                {he.lesson.retakeQuiz}
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border p-4">
            <p className="text-sm text-muted-foreground">{he.lesson.quizIntro}</p>
            <Button render={<Link href={quizHref} />} className="mt-3 min-h-11 w-full sm:w-auto">
              {he.lesson.toQuiz}
            </Button>
          </div>
        )}

        <section className="mt-6 text-xs text-muted-foreground" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="font-semibold">
            {he.lesson.sources}
          </h2>
          <ul className="mt-1 space-y-1">
            {meta.sources.map((s) => (
              <li key={s.title}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                    {s.title}
                  </a>
                ) : (
                  <span>
                    {s.title} (<bdi dir="ltr">{s.ref}</bdi>)
                  </span>
                )}{" "}
                · {he.lesson.accessed("")}
                <bdi dir="ltr">{s.accessed}</bdi>
              </li>
            ))}
          </ul>
        </section>
      </footer>
    </article>
  );
}

export function LockedLessonScreen({ title, unwritten }: { title: string; unwritten: boolean }) {
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <h1 className="text-2xl font-semibold">{unwritten ? he.lesson.unwrittenTitle : he.lesson.lockedTitle}</h1>
      <p className="mt-2 text-muted-foreground">{title}</p>
      <p className="mt-4 leading-relaxed">{unwritten ? he.lesson.unwrittenBody : he.lesson.lockedBody}</p>
      <Button render={<Link href="/roadmap" />} className="mt-6 min-h-11">
        {he.lesson.toRoadmap}
      </Button>
    </div>
  );
}
