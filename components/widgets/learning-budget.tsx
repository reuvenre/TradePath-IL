"use client";

import { useState, useTransition } from "react";
import { Num } from "@/components/lesson/num";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { learningBudget } from "@/lib/finance/learning-budget";
import { saveLearningBudget } from "@/lib/learner/actions";
import { he } from "@/lib/strings/he";

const fmt = (n: number) => n.toLocaleString("en-US");

interface Fields {
  income: string;
  expenses: string;
  savings: string;
  months: string;
}

const PRESET: Fields = { income: "15000", expenses: "10000", savings: "70000", months: "4" };

function parse(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isInteger(n) && n >= 0 ? n : null;
}

/** Stage 0, lesson 4. Math in lib/finance/learning-budget.ts; this only collects inputs and prints the steps. */
export function LearningBudgetWidget({ persist }: { persist: boolean }) {
  const [f, setF] = useState<Fields>(PRESET);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const income = parse(f.income);
  const expenses = parse(f.expenses);
  const savings = parse(f.savings);
  const months = parse(f.months);
  const valid = income !== null && expenses !== null && savings !== null && months !== null && months >= 1 && months <= 12;
  const result = valid
    ? learningBudget({ monthlyIncome: income, monthlyExpenses: expenses, liquidSavings: savings, emergencyMonths: months })
    : null;

  const field = (key: keyof Fields, label: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`lb-${key}`}>{label}</Label>
      <Input
        id={`lb-${key}`}
        inputMode="numeric"
        dir="ltr"
        className="h-11 text-base"
        value={f[key]}
        onChange={(e) => {
          setSaved(null);
          setF({ ...f, [key]: e.target.value });
        }}
        aria-invalid={parse(f[key]) === null}
        {...extra}
      />
    </div>
  );

  function save() {
    if (!result) return;
    setError(null);
    start(async () => {
      const r = await saveLearningBudget(result.maxBudget);
      if (r.ok) setSaved(fmt(result.maxBudget));
      else setError(r.error);
    });
  }

  return (
    <section className="my-6 rounded-xl border bg-card p-4 shadow-xs" aria-label={he.widgets.budget.title} data-widget="LearningBudget">
      <div className="grid gap-3 sm:grid-cols-2">
        {field("income", `${he.widgets.budget.income} (${he.widgets.budget.ils})`)}
        {field("expenses", `${he.widgets.budget.expenses} (${he.widgets.budget.ils})`)}
        {field("savings", `${he.widgets.budget.savings} (${he.widgets.budget.ils})`)}
        {field("months", he.widgets.budget.months, { min: 1, max: 12 })}
      </div>

      <div className="mt-4 rounded-lg bg-muted/60 p-4" aria-live="polite">
        {result ? (
          <>
            <p className="text-sm text-muted-foreground">{he.widgets.budget.resultTitle}</p>
            <p className="text-2xl font-semibold">
              <Num>{fmt(result.maxBudget)} ₪</Num>
            </p>
            <p className="mt-1 text-sm">
              {result.maxBudget === 0
                ? he.widgets.budget.zeroBody
                : result.limitedBy === "fund"
                  ? he.widgets.budget.limitedByFund
                  : result.limitedBy === "rebuild"
                    ? he.widgets.budget.limitedByRebuild
                    : he.widgets.budget.limitedByNone}
            </p>
            <h4 className="mt-4 text-sm font-semibold">{he.widgets.budget.stepsTitle}</h4>
            <ol className="mt-1 space-y-1 text-sm">
              {result.steps.map((s) => (
                <li key={s.label} className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <span>{s.label}</span>
                  <Num className="font-medium">{s.expression}</Num>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">{he.widgets.budget.lessThanMax}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{he.common.check}</p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="outline" className="min-h-11" onClick={() => setF(PRESET)}>
          {he.common.reset}
        </Button>
        {persist && result ? (
          <Button className="min-h-11" onClick={save} disabled={pending}>
            {pending ? he.common.saving : he.widgets.budget.saveAsBudget}
          </Button>
        ) : null}
      </div>
      {saved ? (
        <p className="mt-2 text-sm" role="status">
          {he.widgets.budget.savedBudget(saved)}
        </p>
      ) : null}
      {error ? (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">{he.widgets.budget.notFinancialAdvice}</p>
    </section>
  );
}
