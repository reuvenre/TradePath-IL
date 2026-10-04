import { describe, expect, it } from "vitest";
import { learningBudget } from "./learning-budget";

// Vectors match the worked example in content/lessons/s0-l4/index.mdx.

describe("learningBudget", () => {
  it("lesson example: 15,000 income, 10,000 expenses, 70,000 savings, 4 months → 15,000 (rebuild cap)", () => {
    const r = learningBudget({ monthlyIncome: 15_000, monthlyExpenses: 10_000, liquidSavings: 70_000, emergencyMonths: 4 });
    expect(r.emergencyFund).toBe(40_000);
    expect(r.surplusAfterFund).toBe(30_000);
    expect(r.monthlySavingCapacity).toBe(5_000);
    expect(r.rebuildCap).toBe(15_000);
    expect(r.maxBudget).toBe(15_000);
    expect(r.limitedBy).toBe("rebuild");
    expect(r.steps.map((s) => s.expression)).toEqual([
      "10,000 × 4 = 40,000",
      "70,000 − 40,000 = 30,000",
      "15,000 − 10,000 = 5,000",
      "3 × 5,000 = 15,000",
      "min(30,000, 15,000) = 15,000",
    ]);
  });

  it("savings below the emergency fund → 0, build the fund first", () => {
    const r = learningBudget({ monthlyIncome: 15_000, monthlyExpenses: 10_000, liquidSavings: 35_000, emergencyMonths: 4 });
    expect(r.surplusAfterFund).toBe(0);
    expect(r.maxBudget).toBe(0);
    expect(r.limitedBy).toBe("fund");
    expect(r.steps[1].expression).toBe("35,000 − 40,000 = −5,000 → 0");
  });

  it("small surplus is the binding cap", () => {
    const r = learningBudget({ monthlyIncome: 20_000, monthlyExpenses: 12_000, liquidSavings: 60_000, emergencyMonths: 4 });
    expect(r.surplusAfterFund).toBe(12_000);
    expect(r.rebuildCap).toBe(24_000);
    expect(r.maxBudget).toBe(12_000);
    expect(r.limitedBy).toBe("fund");
  });

  it("no monthly surplus → 0 even with savings", () => {
    const r = learningBudget({ monthlyIncome: 10_000, monthlyExpenses: 10_000, liquidSavings: 100_000, emergencyMonths: 6 });
    expect(r.monthlySavingCapacity).toBe(0);
    expect(r.maxBudget).toBe(0);
    expect(r.limitedBy).toBe("rebuild");
  });

  it("rejects negative, fractional or out-of-range inputs", () => {
    expect(() => learningBudget({ monthlyIncome: -1, monthlyExpenses: 0, liquidSavings: 0, emergencyMonths: 3 })).toThrow();
    expect(() => learningBudget({ monthlyIncome: 100.5, monthlyExpenses: 0, liquidSavings: 0, emergencyMonths: 3 })).toThrow();
    expect(() => learningBudget({ monthlyIncome: 100, monthlyExpenses: 0, liquidSavings: 0, emergencyMonths: 0 })).toThrow();
  });
});
