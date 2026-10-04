import { describe, expect, it } from "vitest";
import { addDays, daysBetween, INTERVAL_DAYS, isDue, isIsoDate, newCard, review } from "./leitner";

// Phase 1 acceptance: a wrong flashcard returns to box 1; due dates follow docs/05-DATA-MODEL.md.

describe("leitner", () => {
  it("uses the intervals from the data model", () => {
    expect(INTERVAL_DAYS).toEqual([1, 2, 4, 8, 16]);
  });

  it("a new card sits in box 1 and is due today", () => {
    expect(newCard("2026-10-04")).toEqual({ box: 1, due_on: "2026-10-04", reviews: 0, lapses: 0 });
    expect(isDue(newCard("2026-10-04"), "2026-10-04")).toBe(true);
  });

  it("knowing a card moves it up one box with the box's interval", () => {
    let s = newCard("2026-10-04");
    const expected = [
      ["2026-10-04", 2, "2026-10-06"],
      ["2026-10-06", 3, "2026-10-10"],
      ["2026-10-10", 4, "2026-10-18"],
      ["2026-10-18", 5, "2026-11-03"],
    ] as const;
    for (const [today, box, due] of expected) {
      s = review(s, true, today);
      expect(s.box).toBe(box);
      expect(s.due_on).toBe(due);
    }
    expect(s.reviews).toBe(4);
    expect(s.lapses).toBe(0);
  });

  it("box 5 is the ceiling", () => {
    const s = review({ box: 5, due_on: "2026-10-04", reviews: 9, lapses: 0 }, true, "2026-10-04");
    expect(s.box).toBe(5);
    expect(s.due_on).toBe("2026-10-20");
  });

  it("a wrong answer returns the card to box 1, due tomorrow, and counts a lapse", () => {
    const s = review({ box: 4, due_on: "2026-10-04", reviews: 3, lapses: 0 }, false, "2026-10-04");
    expect(s).toEqual({ box: 1, due_on: "2026-10-05", reviews: 4, lapses: 1 });
  });

  it("is not due before its date", () => {
    expect(isDue({ due_on: "2026-10-06" }, "2026-10-05")).toBe(false);
    expect(isDue({ due_on: "2026-10-06" }, "2026-10-06")).toBe(true);
    expect(isDue({ due_on: "2026-10-06" }, "2026-10-09")).toBe(true);
  });

  it("date helpers cross month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-02-27", 2)).toBe("2026-03-01");
    expect(daysBetween("2026-10-04", "2026-10-20")).toBe(16);
    expect(isIsoDate("2026-02-30")).toBe(false);
    expect(isIsoDate("2026-10-04")).toBe(true);
  });

  it("rejects a malformed date", () => {
    expect(() => review(newCard("2026-10-04"), true, "4/10/2026")).toThrow();
  });
});
