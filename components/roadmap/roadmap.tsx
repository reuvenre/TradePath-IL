import { CheckCircle2, Circle, CircleDashed, Clock, Flag, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MODULES } from "@/lib/content/curriculum";
import type { GateView, LessonView, StageView, Unlocks } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";
import { cn } from "@/lib/utils";

/** Vertical map of the 8 stages with modules, lessons and the gate at the end of each stage. */
export function Roadmap({ unlocks, weeksLeft }: { unlocks: Unlocks; weeksLeft: number }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">{he.roadmap.title}</h1>
      <p className="mt-1 text-muted-foreground">{he.roadmap.intro}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-sm font-medium">
        <Clock className="size-4" aria-hidden />
        {he.roadmap.weeksLeft(weeksLeft)}
      </p>

      <ol className="mt-6 space-y-6">
        {unlocks.stages.map((stage) => (
          <li key={stage.stage}>
            <StageCard stage={stage} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function StageCard({ stage }: { stage: StageView }) {
  const modules = MODULES.filter((m) => m.stage === stage.stage);
  const groups = modules.length
    ? modules.map((m) => ({ key: `m${m.module}`, title: `${he.common.module} ${m.module}: ${m.title}`, lessons: stage.lessons.filter((l) => l.module === m.module) }))
    : [{ key: "all", title: null, lessons: stage.lessons }];

  return (
    <section
      className={cn("rounded-2xl border bg-card p-4 shadow-xs", !stage.unlocked && "opacity-80")}
      aria-labelledby={`stage-${stage.stage}`}
      data-stage={stage.stage}
      data-unlocked={stage.unlocked}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">
            {he.common.stage} {stage.stage} · {he.roadmap.weeks(stage.weeks)}
          </p>
          <h2 id={`stage-${stage.stage}`} className="text-lg font-semibold">
            {stage.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{stage.goal}</p>
        </div>
        {stage.unlocked ? (
          <Badge variant="outline">{stage.total > 0 ? he.roadmap.lessonsDone(stage.done, stage.total) : he.common.stage}</Badge>
        ) : (
          <Badge variant="muted">
            <Lock aria-hidden />
            {he.common.locked}
          </Badge>
        )}
      </header>

      {stage.total > 0 ? (
        <div className="mt-4 space-y-4">
          {groups.map((g) => (
            <div key={g.key}>
              {g.title ? <h3 className="mb-1 text-sm font-medium text-muted-foreground">{g.title}</h3> : null}
              <ol className="divide-y rounded-lg border">
                {g.lessons.map((l) => (
                  <li key={l.id}>
                    <LessonRow lesson={l} />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ) : null}

      <GateRow gate={stage.gate} stage={stage.stage} />
    </section>
  );
}

function LessonRow({ lesson }: { lesson: LessonView }) {
  const openable = lesson.state === "available" || lesson.state === "done";
  const Icon = lesson.state === "done" ? CheckCircle2 : lesson.state === "available" ? Circle : lesson.state === "unwritten" ? CircleDashed : Lock;
  const inner = (
    <>
      <Icon
        className={cn("size-5 shrink-0", lesson.state === "done" && "text-emerald-600 dark:text-emerald-400", lesson.state === "available" && "text-primary")}
        aria-hidden
      />
      <span className="min-w-0 flex-1">
        <span className={cn("block", lesson.state === "locked" && "text-muted-foreground")}>{lesson.title}</span>
        <span className="block text-xs text-muted-foreground">
          {lesson.state === "done"
            ? he.common.done
            : lesson.state === "available"
              ? he.common.available
              : lesson.state === "unwritten"
                ? he.roadmap.unwritten
                : he.common.locked}
          {lesson.volatile ? ` · ${he.roadmap.volatileMark}` : ""}
        </span>
      </span>
    </>
  );
  const cls = "flex min-h-12 items-center gap-3 px-3 py-2";
  return openable ? (
    <Link href={`/lesson/${lesson.id}`} className={cn(cls, "hover:bg-muted focus-visible:bg-muted outline-none")} data-lesson={lesson.id} data-state={lesson.state}>
      {inner}
    </Link>
  ) : (
    <div className={cls} aria-disabled data-lesson={lesson.id} data-state={lesson.state}>
      {inner}
    </div>
  );
}

function GateRow({ gate, stage }: { gate: GateView; stage: number }) {
  const label =
    gate.state === "passed"
      ? he.roadmap.gatePassed
      : gate.state === "available"
        ? he.roadmap.gateOpen
        : gate.state === "partial"
          ? he.roadmap.gatePartial
          : he.roadmap.gateLocked;
  const openable = gate.state !== "locked";
  const inner = (
    <>
      <Flag className={cn("size-5 shrink-0", gate.state === "passed" && "text-emerald-600 dark:text-emerald-400", (gate.state === "available" || gate.state === "partial") && "text-primary")} aria-hidden />
      <span className="flex-1">
        <span className="block font-medium">
          {he.roadmap.gate} {stage}
        </span>
        <span className="block text-xs text-muted-foreground">{label}</span>
      </span>
      <span className="flex gap-1" aria-hidden>
        {gate.requirements.map((r) => (
          <span key={r.requirement} className={cn("size-2.5 rounded-full", r.passed ? "bg-emerald-600" : "bg-muted-foreground/40")} />
        ))}
      </span>
    </>
  );
  const cls = "mt-3 flex min-h-12 items-center gap-3 rounded-lg border border-dashed px-3 py-2";
  return openable ? (
    <Link href={`/gate/${stage}`} className={cn(cls, "hover:bg-muted outline-none focus-visible:bg-muted")} data-gate={stage} data-state={gate.state}>
      {inner}
    </Link>
  ) : (
    <div className={cls} data-gate={stage} data-state={gate.state}>
      {inner}
    </div>
  );
}
