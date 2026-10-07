// Stage 0, lesson 4: how much money may be lost while learning. Whole shekels (integers), no floats.
// Two caps: what is left after an emergency fund, and what could be rebuilt in three months.
// This is a thinking tool, not financial advice; the lesson says so.

export interface LearningBudgetInput {
  /** Monthly net income, ILS. */
  monthlyIncome: number;
  /** Monthly expenses, ILS. */
  monthlyExpenses: number;
  /** Liquid savings available now, ILS. */
  liquidSavings: number;
  /** Months of expenses the emergency fund should cover (3–6). */
  emergencyMonths: number;
}

export interface LearningBudgetStep {
  /** Hebrew label of the step. */
  label: string;
  /** The arithmetic, LTR, e.g. "10,000 × 4 = 40,000". */
  expression: string;
  value: number;
}

export interface LearningBudgetResult {
  emergencyFund: number;
  surplusAfterFund: number;
  monthlySavingCapacity: number;
  rebuildCap: number;
  /** The maximum learning budget: min(surplus, rebuild cap), never below 0. */
  maxBudget: number;
  /** Which cap decided the result. */
  limitedBy: "fund" | "rebuild" | "none";
  steps: LearningBudgetStep[];
}

export const REBUILD_MONTHS = 3;

const fmt = (n: number) => n.toLocaleString("en-US");

function assertWholeNonNegative(name: string, n: number) {
  if (!Number.isInteger(n) || n < 0) throw new RangeError(`${name} must be a non-negative integer`);
}

export function learningBudget(input: LearningBudgetInput): LearningBudgetResult {
  const { monthlyIncome, monthlyExpenses, liquidSavings, emergencyMonths } = input;
  assertWholeNonNegative("monthlyIncome", monthlyIncome);
  assertWholeNonNegative("monthlyExpenses", monthlyExpenses);
  assertWholeNonNegative("liquidSavings", liquidSavings);
  if (!Number.isInteger(emergencyMonths) || emergencyMonths < 1 || emergencyMonths > 12) {
    throw new RangeError("emergencyMonths must be an integer from 1 to 12");
  }

  const emergencyFund = monthlyExpenses * emergencyMonths;
  const surplusRaw = liquidSavings - emergencyFund;
  const surplusAfterFund = Math.max(0, surplusRaw);
  const monthlySavingCapacity = Math.max(0, monthlyIncome - monthlyExpenses);
  const rebuildCap = REBUILD_MONTHS * monthlySavingCapacity;
  const maxBudget = Math.min(surplusAfterFund, rebuildCap);

  let limitedBy: LearningBudgetResult["limitedBy"];
  if (maxBudget === 0) limitedBy = surplusAfterFund === 0 ? "fund" : "rebuild";
  else if (surplusAfterFund < rebuildCap) limitedBy = "fund";
  else if (rebuildCap < surplusAfterFund) limitedBy = "rebuild";
  else limitedBy = "none";

  const steps: LearningBudgetStep[] = [
    {
      label: "קרן חירום",
      expression: `${fmt(monthlyExpenses)} × ${emergencyMonths} = ${fmt(emergencyFund)}`,
      value: emergencyFund,
    },
    {
      label: "עודף אחרי קרן החירום",
      expression:
        surplusRaw < 0
          ? `${fmt(liquidSavings)} − ${fmt(emergencyFund)} = −${fmt(-surplusRaw)} → 0`
          : `${fmt(liquidSavings)} − ${fmt(emergencyFund)} = ${fmt(surplusAfterFund)}`,
      value: surplusAfterFund,
    },
    {
      label: "יכולת חיסכון חודשית",
      expression: `${fmt(monthlyIncome)} − ${fmt(monthlyExpenses)} = ${fmt(monthlySavingCapacity)}`,
      value: monthlySavingCapacity,
    },
    {
      label: `תקרה שנייה: ${REBUILD_MONTHS} חודשי חיסכון`,
      expression: `${REBUILD_MONTHS} × ${fmt(monthlySavingCapacity)} = ${fmt(rebuildCap)}`,
      value: rebuildCap,
    },
    {
      label: "סכום הלימוד המרבי",
      expression: `min(${fmt(surplusAfterFund)}, ${fmt(rebuildCap)}) = ${fmt(maxBudget)}`,
      value: maxBudget,
    },
  ];

  return { emergencyFund, surplusAfterFund, monthlySavingCapacity, rebuildCap, maxBudget, limitedBy, steps };
}
