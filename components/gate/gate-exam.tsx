"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LtrText } from "@/components/lesson/ltr-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { submitGateExam, type ExamResult } from "@/lib/learner/actions";
import { he } from "@/lib/strings/he";
import { cn } from "@/lib/utils";

/** A drawn exam question, without its answer. */
export interface ExamQuestion {
  key: string;
  type: "single" | "numeric";
  prompt: string;
  options?: string[];
  unit?: string;
}

interface Props {
  stage: number;
  questions: ExamQuestion[];
  passPercent: number;
  persist: boolean;
}

/** Stage exam: all answers are collected, then scored on the server in one call. */
export function GateExam({ stage, questions, passPercent, persist }: Props) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [numeric, setNumeric] = useState("");
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const q = questions[index];
  const answer = answers[index];
  const total = questions.length;

  function choose(i: number) {
    setAnswers((a) => a.map((v, k) => (k === index ? i : v)));
  }

  function next() {
    if (q.type === "numeric") {
      const n = numeric.trim() === "" ? null : Number(numeric.replace(/,/g, ""));
      setAnswers((a) => a.map((v, k) => (k === index ? n : v)));
    }
    setNumeric("");
    if (index + 1 < total) setIndex(index + 1);
    else submit();
  }

  function submit() {
    const payload = questions.map((qq, i) => ({ key: qq.key, answer: answers[i] }));
    if (q.type === "numeric") payload[index].answer = numeric.trim() === "" ? null : Number(numeric.replace(/,/g, ""));
    if (!persist) {
      setResult({ correct: 0, total, percent: 0, passed: false, passPercent, perQuestion: payload.map((p) => ({ key: p.key, correct: false })) });
      return;
    }
    start(async () => {
      const r = await submitGateExam({ stage, answers: payload });
      if (r.ok) setResult(r);
      else setError(r.error);
    });
  }

  if (!started) {
    return (
      <Button className="mt-3 min-h-11" onClick={() => setStarted(true)} data-testid="exam-start">
        {he.gate.examStart}
      </Button>
    );
  }

  if (result || pending || error) {
    return (
      <div className="mt-3 rounded-lg border p-4" role="status">
        {pending ? <p>{he.quiz.saving}</p> : null}
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : null}
        {result ? (
          <>
            <p className="text-lg font-semibold">
              {result.passed ? he.gate.examPassed(result.percent) : he.gate.examFailed(result.percent, result.passPercent)}
            </p>
            <ul className="mt-2 flex flex-wrap gap-1" aria-label={he.quiz.resultTitle}>
              {result.perQuestion.map((p, i) => (
                <li
                  key={p.key}
                  className={cn("flex size-8 items-center justify-center rounded-md text-xs", p.correct ? "bg-emerald-500/15" : "bg-destructive/10")}
                  aria-label={`${he.quiz.question(i + 1, result.total)}: ${p.correct ? he.common.correct : he.common.wrong}`}
                >
                  {p.correct ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                </li>
              ))}
            </ul>
            {!result.passed ? (
              <Button className="mt-3 min-h-11" onClick={() => router.refresh()}>
                {he.gate.examRetry}
              </Button>
            ) : null}
            {!persist ? <p className="mt-2 text-xs text-muted-foreground">{he.quiz.previewNote}</p> : null}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3" data-testid="exam">
      <Progress value={(index / total) * 100} label={he.quiz.question(index + 1, total)} size="sm" />
      <p className="mt-2 text-sm text-muted-foreground">{he.quiz.question(index + 1, total)}</p>
      <h3 className="mt-1 text-lg font-medium leading-relaxed">
        <LtrText text={q.prompt} />
      </h3>
      {q.type === "single" && q.options ? (
        <div className="mt-3 flex flex-col gap-2" role="group">
          {q.options.map((opt, i) => (
            <Button
              key={i}
              type="button"
              variant={answer === i ? "default" : "outline"}
              aria-pressed={answer === i}
              onClick={() => choose(i)}
              className="h-auto min-h-11 justify-start whitespace-normal py-2 text-start text-base"
            >
              <LtrText text={opt} />
            </Button>
          ))}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-1.5">
          <Label htmlFor="exam-numeric">{he.quiz.numericLabel}</Label>
          <Input id="exam-numeric" dir="ltr" inputMode="decimal" className="h-11 max-w-xs text-base" value={numeric} onChange={(e) => setNumeric(e.target.value)} />
        </div>
      )}
      <Button
        type="button"
        className="mt-4 min-h-11"
        disabled={q.type === "single" ? answer === null : numeric.trim() === ""}
        onClick={next}
      >
        {index + 1 < total ? he.quiz.next : he.quiz.finish}
      </Button>
    </div>
  );
}
