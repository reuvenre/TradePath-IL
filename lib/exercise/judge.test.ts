import { describe, expect, it } from "vitest";
import type { Exercise } from "@/lib/content/schemas";
import { judge, summarize, toEngineItems } from "./judge";
import { seedFrom, shuffle } from "./random";

const sort: Exercise = {
  id: "t-sort",
  lessonId: "s0-l2",
  widget: "Sort",
  instruction: "מיין",
  buckets: [
    { id: "a", label: "א" },
    { id: "b", label: "ב" },
  ],
  items: [
    { id: "1", text: "x", bucket: "a", explanation: "e" },
    { id: "2", text: "y", bucket: "b", explanation: "e" },
    { id: "3", text: "z", bucket: "a", explanation: "e" },
    { id: "4", text: "w", bucket: "b", explanation: "e" },
  ],
};

const match: Exercise = {
  id: "t-match",
  lessonId: "s0-l2",
  widget: "Match",
  instruction: "התאם",
  pairs: [
    { id: "1", left: "L1", right: "R1", explanation: "e" },
    { id: "2", left: "L2", right: "R2", explanation: "e" },
    { id: "3", left: "L3", right: "R3", explanation: "e" },
  ],
};

const guess: Exercise = {
  id: "t-guess",
  lessonId: "s0-l3",
  widget: "GuessReveal",
  instruction: "נחש",
  items: [
    { id: "a", prompt: "?", unit: "%", min: 0, max: 100, step: 1, actual: 97, tolerance: 5, explanation: "e" },
    { id: "b", prompt: "?", unit: "%", min: 0, max: 100, step: 1, actual: 80, tolerance: 8, explanation: "e" },
  ],
};

describe("judge", () => {
  it("sort", () => {
    const [first] = toEngineItems(sort);
    expect(judge(first, { kind: "bucket", bucket: "a" }).correct).toBe(true);
    expect(judge(first, { kind: "bucket", bucket: "b" }).correct).toBe(false);
    expect(judge(first, { kind: "bool", value: true }).correct).toBe(false);
  });

  it("match shuffles the right-hand options deterministically and scores by text", () => {
    const items = toEngineItems(match);
    const again = toEngineItems(match);
    expect(items.map((i) => (i.kind === "match" ? i.options : []))).toEqual(again.map((i) => (i.kind === "match" ? i.options : [])));
    const first = items[0];
    if (first.kind !== "match") throw new Error("kind");
    expect(first.options.sort()).toEqual(["R1", "R2", "R3"]);
    const rightIndex = first.options.indexOf("R1");
    expect(judge(first, { kind: "option", index: rightIndex }).correct).toBe(true);
    expect(judge(first, { kind: "option", index: (rightIndex + 1) % 3 }).correct).toBe(false);
  });

  it("guess counts a close guess as correct and records the gap", () => {
    const [a] = toEngineItems(guess);
    expect(judge(a, { kind: "number", value: 95 })).toEqual({ correct: true, detail: { guess: 95, actual: 97, gap: 2 } });
    expect(judge(a, { kind: "number", value: 60 }).correct).toBe(false);
  });

  it("summarize reports correct count and the average gap for guesses", () => {
    const items = toEngineItems(guess);
    const verdicts = [judge(items[0], { kind: "number", value: 87 }), judge(items[1], { kind: "number", value: 60 })];
    expect(summarize(items, verdicts)).toEqual({ correct: 0, total: 2, averageGap: 15 });
  });

  it("shuffle is a permutation and stable per seed", () => {
    const a = shuffle([1, 2, 3, 4, 5], seedFrom("x"));
    expect(a.slice().sort()).toEqual([1, 2, 3, 4, 5]);
    expect(shuffle([1, 2, 3, 4, 5], seedFrom("x"))).toEqual(a);
    expect(shuffle([1, 2, 3, 4, 5], seedFrom("y"))).not.toEqual(a);
  });
});
