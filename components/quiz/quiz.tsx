"use client";

import { Check, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { LtrText } from "@/components/lesson/ltr-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import type { Question } from "@/lib/content/schemas";
import { seedFrom, shuffle } from "@/lib/exercise/random";
import { submitLessonQuiz, type QuizResult } from "@/lib/learner/actions";
import { scoreQuestion, type QuizAnswer } from "@/lib/learner/scoring";
import { localDate } from "@/lib/srs/leitner";
import { he } from "@/lib/strings/he";
import { cn } from "@/lib/utils";

interface Props {
  lessonId: string;
  lessonTitle: string;
  questions: Question[];
  persist: boolean;
  lessonHref: string;
  /** Shown after a pass: the next lesson or the stage gate. */
  nextHref: string | null;
  nextLabel: string | null;
  /** Fixed seed for tests; otherwise each attempt shuffles differently. */
  seed?: number;
}

interface Shuffled {
  question: Question;
  /** For single questions: display order of option indexes. */
  order: number[];
}

const PASS = 4;

export function Quiz({ lessonId, lessonTitle, questions, persist, lessonHref, nextHref, nextLabel, seed }: Props) {
  const [attempt, setAttempt] = useState(0);
  const shuffled = useMemo<Shuffled[]>(() => {
    // Deterministic per lesson; each retry (attempt + 1) reshuffles the options.
    const s = (seed ?? seedFrom(lessonId)) + attempt;
    return questions.map((q, i) => ({
      question: q,
      order: q.type === "single" ? shuffle([0, 1, 2, 3], s + i) : [],
    }));
  }, [questions, lessonId, seed, attempt]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>(() => questions.map(() => null));
  const [chosen, setChosen] = useState<number | null>(null);
  const [numeric, setNumeric] = useState("");
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const current = shuffled[index];
  const q = current?.question;
  const finished = index >= questions.length;
  const currentAnswer: QuizAnswer = q?.type === "single" ? chosen : numeric.trim() === "" ? null : Number(numeric.replace(/,/g, ""));
  const currentCorrect = q ? scoreQuestion(q, currentAnswer) : false;

  function check() {
    if (!q || currentAnswer === null || Number.isNaN(currentAnswer)) return;
    setChecked(true);
    setAnswers((a) => a.map((v, i) => (i === index ? currentAnswer : v)));
  }

  function next() {
    const nextIndex = index + 1;
    setChecked(false);
    setChosen(null);
    setNumeric("");
    setIndex(nextIndex);
    if (nextIndex >= questions.length) finish();
  }

  function finish() {
    const perQuestion = questions.map((qq, i) => scoreQuestion(qq, answers[i] ?? null));
    const local: QuizResult = { correct: perQuestion.filter(Boolean).length, total: questions.length, passed: false, perQuestion };
    local.passed = local.correct >= PASS;
    if (!persist) {
      setResult(local);
      return;
    }
    start(async () => {
      const r = await submitLessonQuiz({ lessonId, answers, today: localDate() });
      if (r.ok) setResult({ correct: r.correct, total: r.total, passed: r.passed, perQuestion: r.perQuestion });
      else {
        setError(r.error);
        setResult(local);
      }
    });
  }

  function retry() {
    setAttempt((a) => a + 1);
    setIndex(0);
    setAnswers(questions.map(() => null));
    setChosen(null);
    setNumeric("");
    setChecked(false);
    setResult(null);
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl" data-quiz={lessonId}>
      <p className="text-sm text-muted-foreground">{lessonTitle}</p>
      <h1 className="mt-1 text-2xl font-semibold">{he.quiz.title}</h1>
      {!persist ? <p className="mt-1 text-xs text-muted-foreground">{he.quiz.previewNote}</p> : null}

      {finished ? (
        <section className="mt-6 rounded-xl border p-5" aria-live="polite">
          <h2 className="text-lg font-semibold">{he.quiz.resultTitle}</h2>
          {pending || (!result && !error) ? (
            <p className="mt-2 text-muted-foreground">{he.quiz.saving}</p>
          ) : (
            <>
              <p className="mt-2 text-3xl font-bold">{he.quiz.score(result!.correct, result!.total)}</p>
              <ul className="mt-3 flex gap-1" aria-label={he.quiz.resultTitle}>
                {result!.perQuestion.map((ok, i) => (
                  <li
                    key={i}
                    className={cn("flex size-9 items-center justify-center rounded-md text-sm font-medium", ok ? "bg-emerald-500/15" : "bg-destructive/10")}
                    aria-label={`${he.quiz.question(i + 1, result!.total)}: ${ok ? he.common.correct : he.common.wrong}`}
                  >
                    {ok ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                  </li>
                ))}
              </ul>
              <p className="mt-4 leading-relaxed">{result!.passed ? he.quiz.passed : he.quiz.failed}</p>
              {error ? (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {he.quiz.saveFailed}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {result!.passed && nextHref && nextLabel ? (
                  <Button render={<Link href={nextHref} />} className="min-h-11">
                    {nextLabel}
                  </Button>
                ) : null}
                {!result!.passed || error ? (
                  <Button onClick={retry} className="min-h-11">
                    {he.quiz.retry}
                  </Button>
                ) : null}
                <Button variant="outline" render={<Link href={lessonHref} />} className="min-h-11">
                  {he.quiz.backToLesson}
                </Button>
              </div>
            </>
          )}
        </section>
      ) : q ? (
        <section className="mt-6" aria-labelledby="quiz-question">
          <Progress value={(index / questions.length) * 100} label={he.quiz.question(index + 1, questions.length)} size="sm" />
          <p className="mt-3 text-sm text-muted-foreground">{he.quiz.question(index + 1, questions.length)}</p>
          <h2 id="quiz-question" className="mt-1 text-lg leading-relaxed font-medium">
            <LtrText text={q.prompt} />
          </h2>

          {q.type === "single" ? (
            <div className="mt-4 flex flex-col gap-2" role="group" aria-labelledby="quiz-question">
              {current.order.map((optionIndex) => {
                const isChosen = chosen === optionIndex;
                const isAnswer = optionIndex === q.answer;
                return (
                  <Button
                    key={optionIndex}
                    type="button"
                    variant={checked ? (isAnswer ? "default" : "outline") : isChosen ? "secondary" : "outline"}
                    disabled={checked}
                    aria-pressed={isChosen}
                    onClick={() => setChosen(optionIndex)}
                    className={cn(
                      "h-auto min-h-11 justify-start gap-2 whitespace-normal py-2 text-start text-base",
                      checked && isAnswer && "ring-2 ring-emerald-500/60",
                      checked && !isAnswer && isChosen && "border-red-700/70 text-red-700 dark:border-red-300/70 dark:text-red-300",
                    )}
                  >
                    {checked ? (
                      isAnswer ? (
                        <Check className="size-4 shrink-0" aria-label={he.common.correct} />
                      ) : isChosen ? (
                        <X className="size-4 shrink-0" aria-label={he.common.wrong} />
                      ) : (
                        <span className="size-4 shrink-0" aria-hidden />
                      )
                    ) : null}
                    <LtrText text={q.options[optionIndex]} />
                  </Button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="quiz-numeric">{he.quiz.numericLabel}</Label>
              <Input
                id="quiz-numeric"
                inputMode="decimal"
                dir="ltr"
                className="h-11 max-w-xs text-base"
                placeholder={he.quiz.numericPlaceholder}
                value={numeric}
                disabled={checked}
                onChange={(e) => setNumeric(e.target.value)}
              />
            </div>
          )}

          {checked ? (
            <div
              role="status"
              className={cn(
                "mt-4 rounded-lg border p-3 leading-relaxed",
                currentCorrect ? "border-emerald-500/40 bg-emerald-500/10" : "border-destructive/40 bg-destructive/10",
              )}
            >
              <p className="font-semibold">{currentCorrect ? he.quiz.correct : he.quiz.wrong}</p>
              {!currentCorrect && q.type === "numeric" ? (
                <p className="mt-1">
                  {he.quiz.correctAnswerWas} <bdi dir="ltr">{q.answer}</bdi>
                </p>
              ) : null}
              <LtrText as="p" className="mt-1" text={q.explanation} />
              <Button type="button" onClick={next} className="mt-3 min-h-11">
                {index === questions.length - 1 ? he.quiz.finish : he.quiz.next}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={check} disabled={currentAnswer === null || Number.isNaN(currentAnswer)} className="mt-4 min-h-11">
              {he.quiz.check}
            </Button>
          )}
        </section>
      ) : null}
    </div>
  );
}
