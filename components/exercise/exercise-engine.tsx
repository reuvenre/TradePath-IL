"use client";

import { Check, ExternalLink, RotateCcw, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Num } from "@/components/lesson/num";
import type { Exercise } from "@/lib/content/schemas";
import { judge, summarize, toEngineItems, type EngineItem, type Response, type Verdict } from "@/lib/exercise/judge";
import { saveDrillAttempt } from "@/lib/learner/actions";
import { he } from "@/lib/strings/he";
import { cn } from "@/lib/utils";

/**
 * ExerciseEngine: item → learner response → instant feedback → score (docs/04-WIDGETS.md).
 * Sort, Match, TrueFalse, GuessReveal and ScenarioChoice are thin renderers over `lib/exercise/judge`.
 */
export function ExerciseEngine({ exercise, persist }: { exercise: Exercise; persist: boolean }) {
  const items = useMemo(() => toEngineItems(exercise), [exercise]);
  const [index, setIndex] = useState(0);
  const [verdicts, setVerdicts] = useState<Verdict[]>([]);
  const [pending, setPending] = useState<Verdict | null>(null);
  const [lastResponse, setLastResponse] = useState<Response | null>(null);

  const finished = index >= items.length;
  const item = items[index];

  function answer(response: Response) {
    if (!item || pending) return;
    const verdict = judge(item, response);
    setPending(verdict);
    setLastResponse(response);
    if (persist) void saveDrillAttempt({ widget: exercise.widget, itemId: `${exercise.id}:${item.id}`, correct: verdict.correct, detail: verdict.detail });
  }

  function next() {
    if (!pending) return;
    setVerdicts((v) => [...v, pending]);
    setPending(null);
    setLastResponse(null);
    setIndex((i) => i + 1);
  }

  function reset() {
    setIndex(0);
    setVerdicts([]);
    setPending(null);
    setLastResponse(null);
  }

  return (
    <section
      className="my-6 rounded-xl border bg-card p-4 shadow-xs"
      aria-label={exercise.instruction}
      data-exercise={exercise.id}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{exercise.instruction}</p>
        <Button variant="ghost" onClick={reset} aria-label={he.common.reset} className="min-h-11 shrink-0">
          <RotateCcw aria-hidden />
          {he.common.reset}
        </Button>
      </div>

      {finished ? (
        <Summary items={items} verdicts={verdicts} />
      ) : (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {he.exercise.progress(index + 1, items.length)}
          </p>
          <ItemView item={item} disabled={pending !== null} response={lastResponse} onAnswer={answer} />
          {pending ? (
            <Feedback item={item} verdict={pending} response={lastResponse} onNext={next} isLast={index === items.length - 1} />
          ) : null}
        </div>
      )}
    </section>
  );
}

function ItemView({
  item,
  disabled,
  response,
  onAnswer,
}: {
  item: EngineItem;
  disabled: boolean;
  response: Response | null;
  onAnswer: (r: Response) => void;
}) {
  switch (item.kind) {
    case "sort":
      return (
        <ChoiceList
          prompt={item.text}
          label={he.exercise.sortPrompt}
          options={item.buckets}
          chosen={response?.kind === "bucket" ? response.bucket : null}
          disabled={disabled}
          onChoose={(id) => onAnswer({ kind: "bucket", bucket: id })}
        />
      );
    case "match":
      return (
        <ChoiceList
          prompt={item.left}
          label={he.exercise.matchPrompt}
          options={item.options.map((o, i) => ({ id: String(i), label: o }))}
          chosen={response?.kind === "option" ? String(response.index) : null}
          disabled={disabled}
          onChoose={(id) => onAnswer({ kind: "option", index: Number(id) })}
        />
      );
    case "truefalse":
      return (
        <ChoiceList
          prompt={item.statement}
          label=""
          options={[
            { id: "true", label: he.exercise.trueLabel },
            { id: "false", label: he.exercise.falseLabel },
          ]}
          chosen={response?.kind === "bool" ? String(response.value) : null}
          disabled={disabled}
          onChoose={(id) => onAnswer({ kind: "bool", value: id === "true" })}
          row
        />
      );
    case "scenario":
      return (
        <ChoiceList
          prompt={item.scenario}
          label={he.exercise.scenarioPrompt}
          options={item.options.map((o, i) => ({ id: String(i), label: o }))}
          chosen={response?.kind === "option" ? String(response.index) : null}
          disabled={disabled}
          onChoose={(id) => onAnswer({ kind: "option", index: Number(id) })}
        />
      );
    case "guess":
      return <GuessView item={item} disabled={disabled} onAnswer={onAnswer} />;
  }
}


function ChoiceList({
  prompt,
  label,
  options,
  chosen,
  disabled,
  onChoose,
  row = false,
}: {
  prompt: string;
  label: string;
  options: { id: string; label: string }[];
  chosen: string | null;
  disabled: boolean;
  onChoose: (id: string) => void;
  row?: boolean;
}) {
  return (
    <div className="mt-2">
      <p className="text-base leading-relaxed">{prompt}</p>
      {label ? <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p> : null}
      <div className={cn("mt-2 flex gap-2", row ? "flex-row flex-wrap" : "flex-col")} role="group" aria-label={label || prompt}>
        {options.map((o) => (
          <Button
            key={o.id}
            type="button"
            variant={chosen === o.id ? "default" : "outline"}
            disabled={disabled}
            onClick={() => onChoose(o.id)}
            className={cn("h-auto min-h-11 justify-start whitespace-normal py-2 text-start text-base", row && "flex-1")}
            aria-pressed={chosen === o.id}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function GuessView({
  item,
  disabled,
  onAnswer,
}: {
  item: Extract<EngineItem, { kind: "guess" }>;
  disabled: boolean;
  onAnswer: (r: Response) => void;
}) {
  const [value, setValue] = useState((item.min + item.max) / 2);
  const inputId = `guess-${item.id}`;
  return (
    <div className="mt-2">
      <p className="text-base leading-relaxed">{item.prompt}</p>
      <label htmlFor={inputId} className="mt-3 block text-sm font-medium text-muted-foreground">
        {he.exercise.guessLabel}:{" "}
        <Num className="text-base font-semibold text-foreground">{value}</Num>
        {withUnit(item.unit)}
      </label>
      <div dir="ltr" className="mt-2">
        <input
          id={inputId}
          type="range"
          min={item.min}
          max={item.max}
          step={item.step}
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(Number(e.target.value))}
          className="h-11 w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
          <span>
            <Num>{item.min}</Num>
            {withUnit(item.unit)}
          </span>
          <span>
            <Num>{item.max}</Num>
            {withUnit(item.unit)}
          </span>
        </div>
      </div>
      <Button type="button" className="mt-3 min-h-11" disabled={disabled} onClick={() => onAnswer({ kind: "number", value })}>
        {he.common.reveal}
      </Button>
    </div>
  );
}

function Feedback({
  item,
  verdict,
  response,
  onNext,
  isLast,
}: {
  item: EngineItem;
  verdict: Verdict;
  response: Response | null;
  onNext: () => void;
  isLast: boolean;
}) {
  const isGuess = item.kind === "guess";
  const tone = isGuess ? (verdict.correct ? "ok" : "neutral") : verdict.correct ? "ok" : "bad";
  return (
    <div
      role="status"
      className={cn(
        "mt-4 rounded-lg border p-3 text-[0.95rem] leading-relaxed",
        tone === "ok" && "border-emerald-500/40 bg-emerald-500/10",
        tone === "bad" && "border-destructive/40 bg-destructive/10",
        tone === "neutral" && "border-border bg-muted/60",
      )}
    >
      {isGuess && item.kind === "guess" && response?.kind === "number" ? (
        <GuessResult item={item} guess={response.value} close={verdict.correct} />
      ) : (
        <p className="flex items-center gap-2 font-semibold">
          {verdict.correct ? <Check className="size-5" aria-hidden /> : <X className="size-5" aria-hidden />}
          {verdict.correct ? he.common.correct : he.common.wrong}
        </p>
      )}
      <p className="mt-2">{item.explanation}</p>
      <Button type="button" className="mt-3 min-h-11" onClick={onNext}>
        {isLast ? he.quiz.finish : he.common.next}
      </Button>
    </div>
  );
}

function GuessResult({ item, guess, close }: { item: Extract<EngineItem, { kind: "guess" }>; guess: number; close: boolean }) {
  const pct = (v: number) => `${((v - item.min) / (item.max - item.min)) * 100}%`;
  const gap = Math.abs(guess - item.actual);
  return (
    <div>
      <p className="font-semibold">
        {he.exercise.guessActual}: <Num>{item.actual}</Num>
        {withUnit(item.unit)}
        {" · "}
        {close ? he.exercise.guessClose : he.exercise.guessFar(<><Num>{Number(gap.toFixed(2))}</Num>{withUnit(item.unit)}</>)}
      </p>
      <div dir="ltr" className="mt-2 space-y-1 text-xs tabular-nums">
        <Bar label={he.exercise.guessLabel} width={pct(guess)} value={<><Num>{guess}</Num>{withUnit(item.unit)}</>} muted />
        <Bar label={he.exercise.guessActual} width={pct(item.actual)} value={<><Num>{item.actual}</Num>{withUnit(item.unit)}</>} />
      </div>
      {item.source ? (
        <a
          href={item.source.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex min-h-9 items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
        >
          <ExternalLink className="size-4" aria-hidden />
          {he.exercise.source}: <bdi dir="ltr">{item.source.title}</bdi>
        </a>
      ) : null}
    </div>
  );
}

/** "%" hugs its number; a Hebrew unit follows after a space, outside the LTR island. */
function withUnit(unit: string): React.ReactNode {
  return unit === "%" ? "%" : <span dir="rtl"> {unit}</span>;
}

function Bar({ label, width, value, muted = false }: { label: string; width: string; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span dir="rtl" className="w-24 shrink-0 text-end text-muted-foreground">
        {label}
      </span>
      <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
        <div className={cn("h-full rounded", muted ? "bg-muted-foreground/60" : "bg-primary")} style={{ width }} />
      </div>
      <span dir="rtl" className="w-24 shrink-0 text-start">
        {value}
      </span>
    </div>
  );
}

function Summary({ items, verdicts }: { items: EngineItem[]; verdicts: Verdict[] }) {
  const s = summarize(items, verdicts);
  const isGuess = items[0]?.kind === "guess";
  return (
    <div className="mt-3 rounded-lg bg-muted/60 p-4" role="status">
      <p className="font-semibold">{he.exercise.resultTitle}</p>
      {isGuess && s.averageGap !== null ? (
        <p className="mt-1">
          {he.exercise.guessAverageGap(<><Num>{Number(s.averageGap.toFixed(1))}</Num>{withUnit(items[0].kind === "guess" ? items[0].unit : "")}</>)}
        </p>
      ) : (
        <p className="mt-1">{he.exercise.score(s.correct, s.total)}</p>
      )}
    </div>
  );
}

