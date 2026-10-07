import { describe, expect, it } from "vitest";
import { localDateOf, minutesInWeek, streakWeeks, weekStart } from "./week";

describe("week", () => {
  it("weeks start on Sunday", () => {
    expect(weekStart("2026-10-04")).toBe("2026-10-04"); // a Sunday
    expect(weekStart("2026-10-07")).toBe("2026-10-04");
    expect(weekStart("2026-10-10")).toBe("2026-10-04"); // Saturday
    expect(weekStart("2026-10-11")).toBe("2026-10-11");
  });

  it("sums the minutes of lessons completed this week only", () => {
    const done = [
      { completedOn: "2026-10-03", minutes: 20 }, // last week
      { completedOn: "2026-10-05", minutes: 20 },
      { completedOn: "2026-10-08", minutes: 25 },
    ];
    expect(minutesInWeek(done, "2026-10-08")).toBe(45);
  });

  it("counts consecutive weeks, tolerating a quiet current week", () => {
    const done = [
      { completedOn: "2026-09-15", minutes: 20 }, // week of 13 Sep
      { completedOn: "2026-09-24", minutes: 20 }, // week of 20 Sep
      { completedOn: "2026-10-01", minutes: 20 }, // week of 27 Sep
    ];
    expect(streakWeeks(done, "2026-10-01")).toBe(3);
    expect(streakWeeks(done, "2026-10-05")).toBe(3); // this week quiet so far
    expect(streakWeeks(done, "2026-10-12")).toBe(0); // a whole week skipped
    expect(streakWeeks([], "2026-10-05")).toBe(0);
  });

  it("converts timestamps to Israel calendar dates", () => {
    expect(localDateOf("2026-10-04T22:30:00Z")).toBe("2026-10-05"); // 01:30 Israel time
    expect(localDateOf("2026-10-04T12:00:00Z")).toBe("2026-10-04");
  });
});
