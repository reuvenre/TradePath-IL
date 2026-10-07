import { LESSONS, STAGES, lessonsOfStage, type LessonSpec, type StageSpec } from "@/lib/content/curriculum";

// Which lessons and gates a learner may open. Pure; the pages feed it rows from Postgres.
// Rules (docs/01-PRD.md, docs/05-DATA-MODEL.md):
//  - a stage is unlocked when every gate requirement of the previous stage has a stage_gates row
//  - a lesson is available when its stage is unlocked and the previous lesson in the stage is done
//  - a lesson whose files are not written yet is "unwritten": shown on the roadmap, never openable
//  - a gate is available when every lesson of its stage is done; "passed" when all requirements exist

export type LessonState = "done" | "available" | "locked" | "unwritten";
export type GateState = "passed" | "available" | "locked" | "partial";

export interface LearnerRows {
  /** lesson ids with status 'completed' */
  completed: ReadonlySet<string>;
  /** `${stage}:${requirement}` keys of stage_gates rows */
  gates: ReadonlySet<string>;
  /** lesson ids that have content files */
  written: ReadonlySet<string>;
}

export interface LessonView extends LessonSpec {
  state: LessonState;
}

export interface GateView {
  stage: number;
  state: GateState;
  requirements: { requirement: string; passed: boolean }[];
}

export interface StageView extends Omit<StageSpec, "gate"> {
  unlocked: boolean;
  lessons: LessonView[];
  gate: GateView;
  gateSpec: StageSpec["gate"];
  done: number;
  total: number;
}

export interface Unlocks {
  stages: StageView[];
  /** The lesson the learner should open now, if any. */
  nextLesson: LessonView | null;
  /** A gate that is open and not yet passed, if any. */
  openGate: GateView | null;
  /** The learner finished every written lesson that is reachable; content must be written. */
  waitingForContent: boolean;
  lessonState(id: string): LessonState;
}

export function gateKey(stage: number, requirement: string): string {
  return `${stage}:${requirement}`;
}

export function gatePassed(stage: number, rows: Pick<LearnerRows, "gates">): boolean {
  const spec = STAGES.find((s) => s.stage === stage);
  if (!spec) return false;
  return spec.gate.every((g) => rows.gates.has(gateKey(stage, g.requirement)));
}

export function computeUnlocks(rows: LearnerRows): Unlocks {
  const states = new Map<string, LessonState>();
  const stages: StageView[] = [];
  let nextLesson: LessonView | null = null;
  let openGate: GateView | null = null;
  let anyAvailable = false;
  let blockedByUnwritten = false;

  for (const spec of STAGES) {
    const unlocked = spec.stage === 0 || gatePassed(spec.stage - 1, rows);
    const lessons: LessonView[] = [];
    let previousDone = true;
    for (const l of lessonsOfStage(spec.stage)) {
      let state: LessonState;
      if (rows.completed.has(l.id)) state = "done";
      else if (!rows.written.has(l.id)) {
        state = "unwritten";
        if (unlocked && previousDone) blockedByUnwritten = true;
      } else if (unlocked && previousDone) state = "available";
      else state = "locked";
      states.set(l.id, state);
      lessons.push({ ...l, state });
      if (state === "available") {
        anyAvailable = true;
        if (!nextLesson) nextLesson = { ...l, state };
      }
      previousDone = state === "done";
    }

    const done = lessons.filter((l) => l.state === "done").length;
    const requirements = spec.gate.map((g) => ({ requirement: g.requirement, passed: rows.gates.has(gateKey(spec.stage, g.requirement)) }));
    const allPassed = requirements.every((r) => r.passed);
    const somePassed = requirements.some((r) => r.passed);
    const allLessonsDone = lessons.length > 0 && done === lessons.length;
    let gateState: GateState;
    if (allPassed) gateState = "passed";
    else if (!unlocked || !allLessonsDone) gateState = "locked";
    else gateState = somePassed ? "partial" : "available";
    const gate: GateView = { stage: spec.stage, state: gateState, requirements };
    if ((gateState === "available" || gateState === "partial") && !openGate) openGate = gate;

    stages.push({ ...spec, gateSpec: spec.gate, unlocked, lessons, gate, done, total: lessons.length });
  }

  return {
    stages,
    nextLesson,
    openGate,
    waitingForContent: !anyAvailable && !openGate && blockedByUnwritten,
    lessonState: (id) => states.get(id) ?? "locked",
  };
}

/** Lesson that follows `id` in curriculum order, or null at the end. */
export function nextLessonId(id: string): string | null {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 && i + 1 < LESSONS.length ? LESSONS[i + 1].id : null;
}

/** Whether `id` is the last lesson of its stage (so completing it opens the gate). */
export function isLastInStage(id: string): boolean {
  const l = LESSONS.find((x) => x.id === id);
  if (!l) return false;
  const inStage = lessonsOfStage(l.stage);
  return inStage[inStage.length - 1]?.id === id;
}

/**
 * Weeks left at the learner's pace. Each lesson stands for one quarter of a typical two-lesson week
 * (lesson + quiz + its share of practice and review), so remaining minutes ≈ lesson minutes × 2.
 * docs/02-CURRICULUM.md: a typical week is two lessons (50 min) + practice (45) + cards (15).
 */
export function estimateWeeksLeft(remainingLessonMinutes: number, weeklyMinutesGoal: number): number {
  if (weeklyMinutesGoal <= 0) return 0;
  const weekly = remainingLessonMinutes * (110 / 50);
  return Math.ceil(weekly / weeklyMinutesGoal);
}
