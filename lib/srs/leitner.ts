// Leitner spaced repetition with five boxes. docs/05-DATA-MODEL.md: intervals 1, 2, 4, 8, 16 days;
// a wrong answer returns the card to box 1. Pure functions; dates are "YYYY-MM-DD" strings in the
// learner's local calendar so the server never has to guess a time zone.

export const BOXES = 5;
export const INTERVAL_DAYS: readonly number[] = [1, 2, 4, 8, 16];

export interface CardState {
  box: number;
  due_on: string;
  reviews: number;
  lapses: number;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(s: string): boolean {
  if (!DATE.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Days between two dates; positive when `b` is after `a`. */
export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
}

export function intervalForBox(box: number): number {
  if (!Number.isInteger(box) || box < 1 || box > BOXES) throw new RangeError(`box must be 1..${BOXES}`);
  return INTERVAL_DAYS[box - 1];
}

/** A card the learner has just met: box 1, due today. */
export function newCard(today: string): CardState {
  return { box: 1, due_on: today, reviews: 0, lapses: 0 };
}

/**
 * Applies one self-graded review.
 * Knew it → one box up (capped at 5), due after that box's interval.
 * Did not → box 1, lapse counted, due after box 1's interval (tomorrow).
 */
export function review(state: CardState, knewIt: boolean, today: string): CardState {
  if (!isIsoDate(today)) throw new RangeError("today must be YYYY-MM-DD");
  const box = knewIt ? Math.min(state.box + 1, BOXES) : 1;
  return {
    box,
    due_on: addDays(today, intervalForBox(box)),
    reviews: state.reviews + 1,
    lapses: state.lapses + (knewIt ? 0 : 1),
  };
}

export function isDue(state: Pick<CardState, "due_on">, today: string): boolean {
  return state.due_on <= today;
}

/** Local calendar date of a Date, as YYYY-MM-DD. Use on the client. */
export function localDate(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
