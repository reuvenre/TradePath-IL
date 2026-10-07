import type { ExamQuestion } from "@/components/gate/gate-exam";
import { rng, shuffle } from "@/lib/exercise/random";
import type { BankQuestion } from "./bank";

/**
 * Draws `count` questions from a stage's bank, spreading them across lessons round-robin so a
 * five-question exam over five lessons takes one from each. Answers are stripped before the draw
 * reaches the client.
 */
export function drawExam(bank: BankQuestion[], count: number, seed: number): ExamQuestion[] {
  const byLesson = new Map<string, BankQuestion[]>();
  for (const q of bank) byLesson.set(q.lessonId, [...(byLesson.get(q.lessonId) ?? []), q]);
  const next = rng(seed);
  const queues = shuffle(
    [...byLesson.values()].map((qs, i) => shuffle(qs, Math.floor(next() * 1e9) + i)),
    Math.floor(next() * 1e9),
  );
  const picked: BankQuestion[] = [];
  while (picked.length < count && queues.some((q) => q.length > 0)) {
    for (const queue of queues) {
      const q = queue.shift();
      if (q) picked.push(q);
      if (picked.length >= count) break;
    }
  }
  return shuffle(picked, Math.floor(next() * 1e9)).map((b) => {
    const q = b.question;
    return q.type === "single"
      ? { key: b.key, type: "single" as const, prompt: q.prompt, options: q.options }
      : { key: b.key, type: "numeric" as const, prompt: q.prompt, unit: q.unit };
  });
}
