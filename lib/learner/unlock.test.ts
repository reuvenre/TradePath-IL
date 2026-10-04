import { describe, expect, it } from "vitest";
import { LESSONS, lessonsOfStage } from "@/lib/content/curriculum";
import { computeUnlocks, estimateWeeksLeft, gateKey, isLastInStage, nextLessonId } from "./unlock";

// Phase 1 acceptance: completing a lesson unlocks the next; a locked lesson cannot be opened.

const stage0 = lessonsOfStage(0).map((l) => l.id);
const written = new Set([...stage0, "s1-m1-l1", "s3-l4"]);

function rows(completed: string[] = [], gates: string[] = []) {
  return { completed: new Set(completed), gates: new Set(gates), written };
}

describe("computeUnlocks", () => {
  it("a new learner may open only the first lesson of stage 0", () => {
    const u = computeUnlocks(rows());
    expect(u.lessonState("s0-l1")).toBe("available");
    expect(u.lessonState("s0-l2")).toBe("locked");
    expect(u.lessonState("s1-m1-l1")).toBe("locked");
    expect(u.lessonState("s3-l4")).toBe("locked");
    expect(u.nextLesson?.id).toBe("s0-l1");
    expect(u.openGate).toBeNull();
    expect(u.stages[0].gate.state).toBe("locked");
  });

  it("completing a lesson unlocks the next one and nothing else", () => {
    const u = computeUnlocks(rows(["s0-l1"]));
    expect(u.lessonState("s0-l1")).toBe("done");
    expect(u.lessonState("s0-l2")).toBe("available");
    expect(u.lessonState("s0-l3")).toBe("locked");
    expect(u.nextLesson?.id).toBe("s0-l2");
  });

  it("finishing every lesson of a stage opens its gate; the next stage stays locked", () => {
    const u = computeUnlocks(rows(stage0));
    expect(u.stages[0].gate.state).toBe("available");
    expect(u.openGate?.stage).toBe(0);
    expect(u.nextLesson).toBeNull();
    expect(u.lessonState("s1-m1-l1")).toBe("locked");
    expect(u.stages[1].unlocked).toBe(false);
  });

  it("a partly passed gate is 'partial' and the next stage is still locked", () => {
    const u = computeUnlocks(rows(stage0, [gateKey(0, "exam")]));
    expect(u.stages[0].gate.state).toBe("partial");
    expect(u.stages[1].unlocked).toBe(false);
  });

  it("passing every requirement of gate 0 unlocks stage 1's first lesson", () => {
    const u = computeUnlocks(rows(stage0, [gateKey(0, "exam"), gateKey(0, "contract")]));
    expect(u.stages[0].gate.state).toBe("passed");
    expect(u.stages[1].unlocked).toBe(true);
    expect(u.lessonState("s1-m1-l1")).toBe("available");
    expect(u.lessonState("s1-m1-l2")).toBe("unwritten");
    expect(u.nextLesson?.id).toBe("s1-m1-l1");
  });

  it("an unwritten lesson blocks the path and reports waitingForContent", () => {
    const u = computeUnlocks(rows([...stage0, "s1-m1-l1"], [gateKey(0, "exam"), gateKey(0, "contract")]));
    expect(u.lessonState("s1-m1-l2")).toBe("unwritten");
    expect(u.nextLesson).toBeNull();
    expect(u.waitingForContent).toBe(true);
  });

  it("a written lesson deep in a locked stage is never available", () => {
    const u = computeUnlocks(rows(stage0, [gateKey(0, "exam"), gateKey(0, "contract")]));
    expect(u.lessonState("s3-l4")).toBe("locked");
  });

  it("an id outside the curriculum is locked", () => {
    expect(computeUnlocks(rows()).lessonState("s9-l1")).toBe("locked");
  });
});

describe("helpers", () => {
  it("nextLessonId follows curriculum order across stages", () => {
    expect(nextLessonId("s0-l5")).toBe("s1-m1-l1");
    expect(nextLessonId("s1-m1-l6")).toBe("s1-m2-l1");
    expect(nextLessonId(LESSONS[LESSONS.length - 1].id)).toBeNull();
  });

  it("isLastInStage", () => {
    expect(isLastInStage("s0-l5")).toBe(true);
    expect(isLastInStage("s0-l4")).toBe(false);
    expect(isLastInStage("s1-m3-l3")).toBe(true);
  });

  it("estimateWeeksLeft scales lesson minutes to a full week of study", () => {
    // 10 lessons × 20 min = 200 min of lessons ≈ 440 min of study; at 150 min/week → 3 weeks
    expect(estimateWeeksLeft(200, 150)).toBe(3);
    expect(estimateWeeksLeft(0, 150)).toBe(0);
    expect(estimateWeeksLeft(200, 0)).toBe(0);
  });
});
