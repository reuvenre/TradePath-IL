import type { Question } from "@/lib/content/schemas";

// Pure scoring shared by the quiz UI (instant feedback) and the server actions (the record of truth).

export const PASS_CORRECT = 4;

export type QuizAnswer = number | null;

export function scoreQuestion(q: Question, answer: QuizAnswer): boolean {
  if (answer === null || Number.isNaN(answer)) return false;
  if (q.type === "single") return answer === q.answer;
  return Math.abs(answer - q.answer) <= q.tolerance;
}
