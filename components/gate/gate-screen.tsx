import { CheckCircle2, Circle, Lock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StageSpec } from "@/lib/content/curriculum";
import type { GateView } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";
import { ContractForm } from "./contract-form";
import { EvidenceForm } from "./evidence-form";
import { GateExam, type ExamQuestion } from "./gate-exam";

interface Props {
  spec: StageSpec;
  gate: GateView;
  /** Drawn exam questions (without answers); null when there is no exam or the gate is locked. */
  exam: ExamQuestion[] | null;
  userId: string | null;
  learningBudget: number | null;
  contractSignedAt: string | null;
  passedAt: Record<string, string>;
  persist: boolean;
}

/** Stage gate: every requirement from docs/02-CURRICULUM.md as its own card. */
export function GateScreen({ spec, gate, exam, userId, learningBudget, contractSignedAt, passedAt, persist }: Props) {
  const locked = gate.state === "locked";
  return (
    <div className="mx-auto max-w-2xl" data-gate-screen={spec.stage} data-state={gate.state}>
      <p className="text-sm text-muted-foreground">
        {he.common.stage} {spec.stage} · {spec.title}
      </p>
      <h1 className="mt-1 text-2xl font-semibold">{he.gate.title(spec.stage)}</h1>
      <p className="mt-1 text-muted-foreground">{he.gate.intro}</p>

      {locked ? (
        <section className="mt-6 rounded-xl border p-5 text-center">
          <Lock className="mx-auto size-6 text-muted-foreground" aria-hidden />
          <h2 className="mt-2 text-lg font-semibold">{he.gate.lockedTitle}</h2>
          <p className="mt-1 text-muted-foreground">{he.gate.lockedBody}</p>
          <Button variant="outline" render={<Link href="/roadmap" />} className="mt-4 min-h-11">
            {he.lesson.toRoadmap}
          </Button>
        </section>
      ) : null}

      {gate.state === "passed" ? (
        <section className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5" role="status">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <CheckCircle2 className="size-5" aria-hidden />
            {he.gate.passedTitle}
          </h2>
          <p className="mt-1">{he.gate.passedBody(spec.stage + 1)}</p>
          <Button render={<Link href="/roadmap" />} className="mt-3 min-h-11">
            {he.lesson.toRoadmap}
          </Button>
        </section>
      ) : null}

      <ol className="mt-6 space-y-4">
        {spec.gate.map((g) => {
          const passed = gate.requirements.find((r) => r.requirement === g.requirement)?.passed ?? false;
          const label = he.gate.requirement[g.requirement] ?? g.requirement;
          return (
            <li key={g.requirement} className="rounded-xl border bg-card p-4 shadow-xs" data-requirement={g.requirement} data-passed={passed}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  {passed ? (
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" aria-hidden />
                  )}
                  {label}
                </h2>
                <Badge variant={passed ? "success" : "muted"}>{passed ? he.common.done : locked ? he.common.locked : he.common.available}</Badge>
              </div>

              {locked ? null : g.spec.kind === "exam" ? (
                <>
                  <p className="mt-2 text-sm text-muted-foreground">{he.gate.examIntro(g.spec.questions, g.spec.passPercent)}</p>
                  {passed ? null : exam && exam.length === g.spec.questions ? (
                    <GateExam stage={spec.stage} questions={exam} passPercent={g.spec.passPercent} persist={persist} />
                  ) : (
                    <p className="mt-2 text-sm text-destructive">{he.common.unwritten}</p>
                  )}
                </>
              ) : g.spec.kind === "contract" ? (
                <ContractForm initialBudget={learningBudget} signedAt={passed ? contractSignedAt ?? passedAt[g.requirement] ?? null : null} persist={persist} />
              ) : g.spec.kind === "evidence" ? (
                <EvidenceForm
                  stage={spec.stage}
                  requirement={g.requirement}
                  description={g.spec.description}
                  userId={userId}
                  passedAt={passed ? passedAt[g.requirement] ?? null : null}
                  persist={persist}
                />
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  {g.spec.description} {he.gate.later(g.spec.phase)}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
