import { describe, expect, it } from "vitest";
import type { BankQuestion } from "./bank";
import { drawExam } from "./exam";

function bank(lessons: number, perLesson: number): BankQuestion[] {
  const out: BankQuestion[] = [];
  for (let l = 0; l < lessons; l++) {
    for (let q = 0; q < perLesson; q++) {
      out.push({
        key: `s0-l${l + 1}/q${q + 1}`,
        lessonId: `s0-l${l + 1}`,
        question: { id: `q${q + 1}`, type: "single", prompt: `p${l}${q}`, options: ["a", "b", "c", "d"], answer: 1, explanation: "e", objective: 0 },
      });
    }
  }
  return out;
}

describe("drawExam", () => {
  it("takes one question from each lesson when the count equals the lesson count", () => {
    const drawn = drawExam(bank(5, 5), 5, 42);
    expect(drawn).toHaveLength(5);
    expect(new Set(drawn.map((d) => d.key.split("/")[0])).size).toBe(5);
  });

  it("never repeats a question and never leaks the answer", () => {
    const drawn = drawExam(bank(3, 5), 12, 7);
    expect(new Set(drawn.map((d) => d.key)).size).toBe(12);
    expect(drawn.every((d) => !("answer" in d) && !("explanation" in d))).toBe(true);
  });

  it("is reproducible per seed and caps at the bank size", () => {
    expect(drawExam(bank(2, 3), 4, 1)).toEqual(drawExam(bank(2, 3), 4, 1));
    expect(drawExam(bank(2, 3), 10, 1)).toHaveLength(6);
  });
});
