import { addDays, daysBetween } from "@/lib/srs/leitner";

// Weekly goal and streak, derived from completed lessons. The week starts on Sunday (Israel).
// Dates are "YYYY-MM-DD" in the learner's calendar; the server converts timestamps with Asia/Jerusalem.

export const TIME_ZONE = "Asia/Jerusalem";

const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** Calendar date in Israel for a timestamp. */
export function localDateOf(ts: string | Date): string {
  return fmt.format(typeof ts === "string" ? new Date(ts) : ts);
}

/** The Sunday that starts the week containing `date`. */
export function weekStart(date: string): string {
  const dow = new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = Sunday
  return addDays(date, -dow);
}

export interface CompletedLesson {
  completedOn: string;
  minutes: number;
}

export function minutesInWeek(completed: CompletedLesson[], today: string): number {
  const start = weekStart(today);
  const end = addDays(start, 7);
  return completed.filter((c) => c.completedOn >= start && c.completedOn < end).reduce((sum, c) => sum + c.minutes, 0);
}

/**
 * Consecutive weeks with at least one completed lesson, counting back from this week.
 * This week counts if it has activity; otherwise the streak is measured from last week, so a
 * learner who studies on Thursdays does not see zero on Sunday morning.
 */
export function streakWeeks(completed: CompletedLesson[], today: string): number {
  const weeks = new Set(completed.map((c) => weekStart(c.completedOn)));
  let cursor = weekStart(today);
  if (!weeks.has(cursor)) cursor = addDays(cursor, -7);
  let streak = 0;
  while (weeks.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

export function daysUntil(date: string, today: string): number {
  return daysBetween(today, date);
}
