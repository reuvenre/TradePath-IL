"use client";

import { CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signContract } from "@/lib/learner/actions";
import { he } from "@/lib/strings/he";

interface Props {
  /** Pre-filled from profiles.learning_budget_ils (set by the LearningBudget widget). */
  initialBudget: number | null;
  signedAt: string | null;
  persist: boolean;
}

/** Stage 0 learning contract: a written learning budget and two commitments. Writes profiles.contract_signed_at. */
export function ContractForm({ initialBudget, signedAt, persist }: Props) {
  const [budget, setBudget] = useState(initialBudget === null ? "" : String(initialBudget));
  const [noRealMoney, setNoRealMoney] = useState(false);
  const [budgetWritten, setBudgetWritten] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(signedAt);
  const [pending, start] = useTransition();

  if (done) {
    return (
      <p className="mt-3 flex items-center gap-2 font-medium" role="status">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        {he.gate.contractSigned("")}
        <bdi dir="ltr">{done.slice(0, 10)}</bdi>
      </p>
    );
  }

  const budgetNumber = Number(budget.replace(/,/g, ""));
  const budgetValid = budget.trim() !== "" && Number.isInteger(budgetNumber) && budgetNumber >= 0;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!budgetValid) return setError(he.gate.contractBudgetInvalid);
    if (!noRealMoney || !budgetWritten) return setError(he.gate.contractMustAgree);
    if (!persist) return setDone(new Date().toISOString());
    start(async () => {
      const r = await signContract({ budget: budgetNumber, noRealMoney: true, budgetWritten: true });
      if (r.ok) setDone(r.signedAt);
      else setError(r.error);
    });
  }

  return (
    <form onSubmit={submit} className="mt-3 flex flex-col gap-4" data-testid="contract">
      <p className="text-sm text-muted-foreground">{he.gate.contractIntro}</p>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contract-budget">{he.gate.contractBudgetLabel}</Label>
        <Input
          id="contract-budget"
          dir="ltr"
          inputMode="numeric"
          className="h-11 max-w-xs text-base"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          aria-describedby="contract-budget-help"
          aria-invalid={budget !== "" && !budgetValid}
        />
        <p id="contract-budget-help" className="text-xs text-muted-foreground">
          {he.gate.contractBudgetHelp}
        </p>
      </div>
      <label className="flex min-h-11 items-start gap-3 leading-relaxed">
        <input type="checkbox" className="mt-1.5 size-5 accent-primary" checked={noRealMoney} onChange={(e) => setNoRealMoney(e.target.checked)} />
        <span>{he.gate.contractNoRealMoney}</span>
      </label>
      <label className="flex min-h-11 items-start gap-3 leading-relaxed">
        <input type="checkbox" className="mt-1.5 size-5 accent-primary" checked={budgetWritten} onChange={(e) => setBudgetWritten(e.target.checked)} />
        <span>{he.gate.contractBudgetWritten}</span>
      </label>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="min-h-11 self-start" disabled={pending}>
        {pending ? he.common.saving : he.gate.contractSign}
      </Button>
    </form>
  );
}
