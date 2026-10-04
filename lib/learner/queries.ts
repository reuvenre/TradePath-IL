import "server-only";
import { lessonSpec } from "@/lib/content/curriculum";
import { lessonIdOfCard, listWrittenLessonIds, readCards, readFrontmatter } from "@/lib/content/loader";
import type { Card } from "@/lib/content/schemas";
import { createClient } from "@/lib/supabase/server";
import { computeUnlocks, gateKey, type Unlocks } from "./unlock";
import type { CardStateRow, LessonProgressRow, ProfileRow, StageGateRow } from "./types";
import { localDateOf, minutesInWeek, streakWeeks } from "./week";

// Reads for the learner pages. Every query runs as the signed-in user, so RLS scopes the rows.

export interface Learner {
  userId: string;
  profile: ProfileRow;
  progress: Map<string, LessonProgressRow>;
  gates: StageGateRow[];
  unlocks: Unlocks;
}

export async function getLearner(): Promise<Learner | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, progressRes, gatesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("lesson_progress").select("*").eq("user_id", user.id),
    supabase.from("stage_gates").select("*").eq("user_id", user.id),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (progressRes.error) throw progressRes.error;
  if (gatesRes.error) throw gatesRes.error;

  const profile = (profileRes.data as ProfileRow | null) ?? {
    id: user.id,
    display_name: null,
    weekly_minutes_goal: 150,
    chosen_style: "undecided",
    learning_budget_ils: null,
    contract_signed_at: null,
    created_at: new Date().toISOString(),
  };
  const progressRows = (progressRes.data ?? []) as LessonProgressRow[];
  const gates = (gatesRes.data ?? []) as StageGateRow[];

  const progress = new Map(progressRows.map((r) => [r.lesson_id, r]));
  const unlocks = computeUnlocks({
    completed: new Set(progressRows.filter((r) => r.status === "completed").map((r) => r.lesson_id)),
    gates: new Set(gates.map((g) => gateKey(g.stage, g.requirement))),
    written: new Set(listWrittenLessonIds()),
  });

  return { userId: user.id, profile, progress, gates, unlocks };
}

export interface DueCard extends Card {
  lessonId: string;
  lessonTitle: string;
  box: number;
}

export interface CardSummary {
  due: DueCard[];
  total: number;
  nextDueOn: string | null;
}

/** Cards due today with their content, plus deck totals. */
export async function getCards(userId: string, today: string): Promise<CardSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("card_state")
    .select("*")
    .eq("user_id", userId)
    .order("due_on", { ascending: true })
    .order("box", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as CardStateRow[];

  const contentCache = new Map<string, { title: string; cards: Map<string, Card> }>();
  const contentFor = (lessonId: string) => {
    let c = contentCache.get(lessonId);
    if (!c) {
      try {
        const { meta } = readFrontmatter(lessonId);
        c = { title: meta.title, cards: new Map(readCards(lessonId).cards.map((card) => [card.id, card])) };
      } catch {
        c = { title: lessonSpec(lessonId)?.title ?? lessonId, cards: new Map() };
      }
      contentCache.set(lessonId, c);
    }
    return c;
  };

  const due: DueCard[] = [];
  let nextDueOn: string | null = null;
  for (const row of rows) {
    const lessonId = lessonIdOfCard(row.card_id);
    const content = contentFor(lessonId);
    const card = content.cards.get(row.card_id);
    if (!card) continue;
    if (row.due_on <= today) due.push({ ...card, lessonId, lessonTitle: content.title, box: row.box });
    else if (nextDueOn === null || row.due_on < nextDueOn) nextDueOn = row.due_on;
  }
  return { due, total: rows.length, nextDueOn };
}

export interface WeekStats {
  minutesThisWeek: number;
  goal: number;
  streak: number;
}

export function weekStats(learner: Learner, today: string): WeekStats {
  const completed = [...learner.progress.values()]
    .filter((r) => r.status === "completed" && r.completed_at)
    .map((r) => ({
      completedOn: localDateOf(r.completed_at as string),
      minutes: minutesFor(r.lesson_id),
    }));
  return {
    minutesThisWeek: minutesInWeek(completed, today),
    goal: learner.profile.weekly_minutes_goal,
    streak: streakWeeks(completed, today),
  };
}

function minutesFor(lessonId: string): number {
  try {
    return readFrontmatter(lessonId).meta.minutes;
  } catch {
    return 20;
  }
}

/** Number of exam attempts so far for a stage gate; seeds the next draw so every attempt differs. */
export async function getGateAttemptCount(userId: string, stage: number): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("quiz_id", `gate-s${stage}`);
  if (error) throw error;
  return count ?? 0;
}
