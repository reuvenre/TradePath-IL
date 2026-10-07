import type { Exercise } from "@/lib/content/schemas";
import { seedFrom, shuffle } from "./random";

// Turns every exercise type into one list of items the engine can step through, and scores a response.
// Pure: no React, no I/O. The UI only renders what is here.

export type Response =
  | { kind: "bucket"; bucket: string }
  | { kind: "option"; index: number }
  | { kind: "bool"; value: boolean }
  | { kind: "number"; value: number };

export interface Verdict {
  correct: boolean;
  /** Stored in drill_attempts.detail. */
  detail: Record<string, unknown>;
}

export type EngineItem =
  | { kind: "sort"; id: string; text: string; bucket: string; explanation: string; buckets: { id: string; label: string }[] }
  | { kind: "match"; id: string; left: string; right: string; options: string[]; explanation: string }
  | { kind: "truefalse"; id: string; statement: string; answer: boolean; explanation: string }
  | {
      kind: "guess";
      id: string;
      prompt: string;
      unit: string;
      min: number;
      max: number;
      step: number;
      actual: number;
      tolerance: number;
      explanation: string;
      source?: { title: string; url: string };
    }
  | { kind: "scenario"; id: string; scenario: string; options: string[]; answer: number; explanation: string };

export function toEngineItems(ex: Exercise): EngineItem[] {
  switch (ex.widget) {
    case "Sort":
      return ex.items.map((i) => ({ kind: "sort", ...i, buckets: ex.buckets }));
    case "Match": {
      const rights = ex.pairs.map((p) => p.right);
      return ex.pairs.map((p) => ({
        kind: "match",
        id: p.id,
        left: p.left,
        right: p.right,
        options: shuffle(rights, seedFrom(`${ex.id}:${p.id}`)),
        explanation: p.explanation,
      }));
    }
    case "TrueFalse":
      return ex.items.map((i) => ({ kind: "truefalse", ...i }));
    case "GuessReveal":
      return ex.items.map((i) => ({ kind: "guess", ...i }));
    case "ScenarioChoice":
      return ex.items.map((i) => ({ kind: "scenario", ...i }));
  }
}

export function judge(item: EngineItem, response: Response): Verdict {
  switch (item.kind) {
    case "sort":
      return response.kind === "bucket"
        ? { correct: response.bucket === item.bucket, detail: { chosen: response.bucket, expected: item.bucket } }
        : wrongKind(response);
    case "match":
      return response.kind === "option"
        ? {
            correct: item.options[response.index] === item.right,
            detail: { chosen: item.options[response.index] ?? null, expected: item.right },
          }
        : wrongKind(response);
    case "truefalse":
      return response.kind === "bool"
        ? { correct: response.value === item.answer, detail: { chosen: response.value, expected: item.answer } }
        : wrongKind(response);
    case "guess": {
      if (response.kind !== "number") return wrongKind(response);
      const gap = Math.abs(response.value - item.actual);
      return { correct: gap <= item.tolerance, detail: { guess: response.value, actual: item.actual, gap } };
    }
    case "scenario":
      return response.kind === "option"
        ? { correct: response.index === item.answer, detail: { chosen: response.index, expected: item.answer } }
        : wrongKind(response);
  }
}

function wrongKind(response: Response): Verdict {
  return { correct: false, detail: { error: `unexpected response ${response.kind}` } };
}

/** Summary line data for the end screen. */
export function summarize(items: EngineItem[], verdicts: Verdict[]) {
  const correct = verdicts.filter((v) => v.correct).length;
  const gaps = verdicts.map((v) => v.detail.gap).filter((g): g is number => typeof g === "number");
  const averageGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : null;
  return { correct, total: items.length, averageGap };
}
