// Row shapes for the tables the learning core touches (supabase/schema.sql).

export interface ProfileRow {
  id: string;
  display_name: string | null;
  weekly_minutes_goal: number;
  chosen_style: string;
  learning_budget_ils: number | null;
  contract_signed_at: string | null;
  created_at: string;
}

export interface LessonProgressRow {
  user_id: string;
  lesson_id: string;
  status: "started" | "completed";
  seconds_spent: number;
  started_at: string;
  completed_at: string | null;
}

export interface CardStateRow {
  user_id: string;
  card_id: string;
  box: number;
  due_on: string;
  reviews: number;
  lapses: number;
  last_reviewed_at: string | null;
}

export interface StageGateRow {
  user_id: string;
  stage: number;
  requirement: string;
  passed_at: string;
  evidence: Record<string, unknown> | null;
}

export type ActionResult<T extends object = object> = ({ ok: true } & T) | { ok: false; error: string };
