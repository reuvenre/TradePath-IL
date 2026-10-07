"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { stageSpec } from "@/lib/content/curriculum";
import { lessonExists, readCards, readQuiz } from "@/lib/content/loader";
import { lessonId as lessonIdSchema } from "@/lib/content/schemas";
import { isIsoDate, newCard, review, type CardState } from "@/lib/srs/leitner";
import { createClient } from "@/lib/supabase/server";
import { stageQuestionBank } from "./bank";
import { PASS_CORRECT, scoreQuestion } from "./scoring";
import type { ActionResult, CardStateRow } from "./types";

// Every write of learner state. Each action runs as the signed-in user (RLS) and re-derives
// anything that matters (scores, due dates) on the server; the client only reports what it did.

const NOT_SIGNED_IN = "לא מחובר.";
const DB_ERROR = "השמירה נכשלה.";

async function userClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { supabase, userId: user.id } : null;
}

const isoDate = z.string().refine(isIsoDate, "YYYY-MM-DD");

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}

// ---- lesson progress --------------------------------------------------------------------------

export async function startLesson(lessonId: string): Promise<ActionResult> {
  const parsed = lessonIdSchema.safeParse(lessonId);
  if (!parsed.success || !lessonExists(parsed.data)) return fail("שיעור לא מוכר.");
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { error } = await ctx.supabase
    .from("lesson_progress")
    .upsert({ user_id: ctx.userId, lesson_id: parsed.data, status: "started" }, { onConflict: "user_id,lesson_id", ignoreDuplicates: true });
  return error ? fail(DB_ERROR) : { ok: true };
}

export async function addLessonTime(lessonId: string, seconds: number): Promise<ActionResult> {
  const parsed = z.object({ lessonId: lessonIdSchema, seconds: z.number().int().min(1).max(600) }).safeParse({ lessonId, seconds });
  if (!parsed.success) return fail("נתונים לא תקינים.");
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { data } = await ctx.supabase
    .from("lesson_progress")
    .select("seconds_spent")
    .eq("user_id", ctx.userId)
    .eq("lesson_id", parsed.data.lessonId)
    .maybeSingle();
  const current = (data as { seconds_spent: number } | null)?.seconds_spent ?? 0;
  const { error } = await ctx.supabase
    .from("lesson_progress")
    .upsert(
      { user_id: ctx.userId, lesson_id: parsed.data.lessonId, status: "started", seconds_spent: current + parsed.data.seconds },
      { onConflict: "user_id,lesson_id" },
    )
    .select();
  // The upsert above would downgrade a completed lesson to "started"; restore it if needed.
  if (!error) {
    await ctx.supabase
      .from("lesson_progress")
      .update({ status: "completed" })
      .eq("user_id", ctx.userId)
      .eq("lesson_id", parsed.data.lessonId)
      .not("completed_at", "is", null);
  }
  return error ? fail(DB_ERROR) : { ok: true };
}

// ---- quiz ------------------------------------------------------------------------------------

const quizSubmission = z.object({
  lessonId: lessonIdSchema,
  answers: z.array(z.number().nullable()).length(5),
  today: isoDate,
});

export interface QuizResult {
  correct: number;
  total: number;
  passed: boolean;
  perQuestion: boolean[];
}

export async function submitLessonQuiz(input: z.input<typeof quizSubmission>): Promise<ActionResult<QuizResult>> {
  const parsed = quizSubmission.safeParse(input);
  if (!parsed.success) return fail("נתונים לא תקינים.");
  const { lessonId, answers, today } = parsed.data;
  if (!lessonExists(lessonId)) return fail("שיעור לא מוכר.");

  const quiz = readQuiz(lessonId);
  const perQuestion = quiz.questions.map((q, i) => scoreQuestion(q, answers[i] ?? null));
  const correct = perQuestion.filter(Boolean).length;
  const total = quiz.questions.length;
  const passed = correct >= PASS_CORRECT;
  const result: QuizResult = { correct, total, passed, perQuestion };

  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { supabase, userId } = ctx;

  const attempt = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    quiz_id: lessonId,
    score: Math.round((correct / total) * 10000) / 100,
    passed,
    answers: quiz.questions.map((q, i) => ({ id: q.id, answer: answers[i], correct: perQuestion[i] })),
  });
  if (attempt.error) return fail(DB_ERROR);

  if (passed) {
    const done = await supabase
      .from("lesson_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId, status: "completed", completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" },
      );
    if (done.error) return fail(DB_ERROR);

    const cards = readCards(lessonId).cards.map((c) => ({ user_id: userId, card_id: c.id, ...newCard(today) }));
    const entered = await supabase.from("card_state").upsert(cards, { onConflict: "user_id,card_id", ignoreDuplicates: true });
    if (entered.error) return fail(DB_ERROR);

    revalidatePath("/");
    revalidatePath("/roadmap");
    revalidatePath("/cards");
    revalidatePath(`/lesson/${lessonId}`);
  }
  return { ok: true, ...result };
}

// ---- flashcards --------------------------------------------------------------------------------

const cardReview = z.object({ cardId: z.string().regex(/^s[0-7](-m\d+)?-l\d+-c\d+$/), knewIt: z.boolean(), today: isoDate });

export async function reviewCard(input: z.input<typeof cardReview>): Promise<ActionResult<{ state: CardState }>> {
  const parsed = cardReview.safeParse(input);
  if (!parsed.success) return fail("נתונים לא תקינים.");
  const { cardId, knewIt, today } = parsed.data;
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { supabase, userId } = ctx;

  const { data } = await supabase.from("card_state").select("*").eq("user_id", userId).eq("card_id", cardId).maybeSingle();
  const row = data as CardStateRow | null;
  const before: CardState = row ? { box: row.box, due_on: row.due_on, reviews: row.reviews, lapses: row.lapses } : newCard(today);
  const after = review(before, knewIt, today);

  const { error } = await supabase
    .from("card_state")
    .upsert({ user_id: userId, card_id: cardId, ...after, last_reviewed_at: new Date().toISOString() }, { onConflict: "user_id,card_id" });
  if (error) return fail(DB_ERROR);
  revalidatePath("/");
  revalidatePath("/cards");
  return { ok: true, state: after };
}

// ---- drills ------------------------------------------------------------------------------------

const drill = z.object({
  widget: z.string().min(1).max(64),
  itemId: z.string().min(1).max(128),
  correct: z.boolean(),
  detail: z.record(z.string(), z.unknown()).optional(),
});

export async function saveDrillAttempt(input: z.input<typeof drill>): Promise<ActionResult> {
  const parsed = drill.safeParse(input);
  if (!parsed.success) return fail("נתונים לא תקינים.");
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { error } = await ctx.supabase.from("drill_attempts").insert({ user_id: ctx.userId, ...parsed.data, detail: parsed.data.detail ?? null });
  return error ? fail(DB_ERROR) : { ok: true };
}

// ---- profile -----------------------------------------------------------------------------------

export async function saveLearningBudget(amount: number): Promise<ActionResult> {
  const parsed = z.number().int().min(0).max(100_000_000).safeParse(amount);
  if (!parsed.success) return fail("סכום לא תקין.");
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { error } = await ctx.supabase.from("profiles").update({ learning_budget_ils: parsed.data }).eq("id", ctx.userId);
  if (error) return fail(DB_ERROR);
  revalidatePath("/gate/0");
  return { ok: true };
}

// ---- stage gates -------------------------------------------------------------------------------

const examSubmission = z.object({
  stage: z.number().int().min(0).max(7),
  answers: z.array(z.object({ key: z.string().min(1), answer: z.number().nullable() })).min(1).max(60),
});

export interface ExamResult {
  correct: number;
  total: number;
  percent: number;
  passed: boolean;
  passPercent: number;
  perQuestion: { key: string; correct: boolean }[];
}

export async function submitGateExam(input: z.input<typeof examSubmission>): Promise<ActionResult<ExamResult>> {
  const parsed = examSubmission.safeParse(input);
  if (!parsed.success) return fail("נתונים לא תקינים.");
  const { stage, answers } = parsed.data;
  const spec = stageSpec(stage)?.gate.find((g) => g.spec.kind === "exam");
  if (!spec || spec.spec.kind !== "exam") return fail("לשלב הזה אין מבחן.");
  if (answers.length !== spec.spec.questions) return fail("מספר השאלות לא תואם.");
  if (new Set(answers.map((a) => a.key)).size !== answers.length) return fail("שאלה חוזרת.");

  const bank = new Map(stageQuestionBank(stage).map((b) => [b.key, b]));
  const perQuestion = answers.map((a) => {
    const q = bank.get(a.key);
    return { key: a.key, correct: q ? scoreQuestion(q.question, a.answer) : false };
  });
  if (answers.some((a) => !bank.has(a.key))) return fail("שאלה לא מוכרת.");

  const correct = perQuestion.filter((p) => p.correct).length;
  const total = answers.length;
  const percent = Math.round((correct / total) * 10000) / 100;
  const passed = percent >= spec.spec.passPercent;

  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { supabase, userId } = ctx;
  const attempt = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    quiz_id: `gate-s${stage}`,
    score: percent,
    passed,
    answers: answers.map((a, i) => ({ ...a, correct: perQuestion[i].correct })),
  });
  if (attempt.error) return fail(DB_ERROR);

  if (passed) {
    const gate = await supabase
      .from("stage_gates")
      .upsert({ user_id: userId, stage, requirement: spec.requirement, evidence: { percent, total } }, { onConflict: "user_id,stage,requirement", ignoreDuplicates: true });
    if (gate.error) return fail(DB_ERROR);
    revalidatePath("/");
    revalidatePath("/roadmap");
    revalidatePath(`/gate/${stage}`);
  }
  return { ok: true, correct, total, percent, passed, passPercent: spec.spec.passPercent, perQuestion };
}

const contract = z.object({
  budget: z.number().int().min(0).max(100_000_000),
  noRealMoney: z.literal(true),
  budgetWritten: z.literal(true),
});

export async function signContract(input: z.input<typeof contract>): Promise<ActionResult<{ signedAt: string }>> {
  const parsed = contract.safeParse(input);
  if (!parsed.success) return fail("צריך לסמן את שתי ההתחייבויות ולהקליד סכום תקין.");
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  const { supabase, userId } = ctx;
  const signedAt = new Date().toISOString();
  const profile = await supabase
    .from("profiles")
    .update({ learning_budget_ils: parsed.data.budget, contract_signed_at: signedAt })
    .eq("id", userId);
  if (profile.error) return fail(DB_ERROR);
  const gate = await supabase
    .from("stage_gates")
    .upsert(
      { user_id: userId, stage: 0, requirement: "contract", passed_at: signedAt, evidence: { budget: parsed.data.budget } },
      { onConflict: "user_id,stage,requirement", ignoreDuplicates: true },
    );
  if (gate.error) return fail(DB_ERROR);
  revalidatePath("/");
  revalidatePath("/roadmap");
  revalidatePath("/gate/0");
  return { ok: true, signedAt };
}

const evidence = z.object({
  stage: z.number().int().min(0).max(7),
  requirement: z.string().min(1).max(32),
  text: z.string().trim().min(20).max(5000),
  files: z.array(z.string().min(1).max(512)).max(5),
});

export async function submitGateEvidence(input: z.input<typeof evidence>): Promise<ActionResult> {
  const parsed = evidence.safeParse(input);
  if (!parsed.success) return fail("כתוב לפחות 20 תווים.");
  const { stage, requirement, text, files } = parsed.data;
  const spec = stageSpec(stage)?.gate.find((g) => g.requirement === requirement);
  if (!spec || spec.spec.kind !== "evidence") return fail("דרישה לא מוכרת.");
  const ctx = await userClient();
  if (!ctx) return fail(NOT_SIGNED_IN);
  // Only paths inside the learner's own folder may be recorded.
  if (files.some((f) => !f.startsWith(`${ctx.userId}/`))) return fail("נתיב קובץ לא תקין.");
  const { error } = await ctx.supabase
    .from("stage_gates")
    .upsert({ user_id: ctx.userId, stage, requirement, evidence: { text, files } }, { onConflict: "user_id,stage,requirement", ignoreDuplicates: true });
  if (error) return fail(DB_ERROR);
  revalidatePath("/");
  revalidatePath("/roadmap");
  revalidatePath(`/gate/${stage}`);
  return { ok: true };
}
