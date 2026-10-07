import "server-only";
import { lessonsOfStage } from "@/lib/content/curriculum";
import { listWrittenLessonIds, readQuiz } from "@/lib/content/loader";
import type { Question } from "@/lib/content/schemas";

// The stage exam question bank: every quiz question of the stage's written lessons.
// Server-only on purpose: it carries the answers.

export interface BankQuestion {
  /** `${lessonId}/${questionId}` */
  key: string;
  lessonId: string;
  question: Question;
}

export function stageQuestionBank(stage: number): BankQuestion[] {
  const written = new Set(listWrittenLessonIds());
  const bank: BankQuestion[] = [];
  for (const l of lessonsOfStage(stage)) {
    if (!written.has(l.id)) continue;
    for (const q of readQuiz(l.id).questions) bank.push({ key: `${l.id}/${q.id}`, lessonId: l.id, question: q });
  }
  return bank;
}
