import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GateScreen } from "@/components/gate/gate-screen";
import { stageSpec } from "@/lib/content/curriculum";
import { stageQuestionBank } from "@/lib/learner/bank";
import { drawExam } from "@/lib/learner/exam";
import { getGateAttemptCount, getLearner } from "@/lib/learner/queries";
import { he } from "@/lib/strings/he";

type Props = { params: Promise<{ stage: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stage } = await params;
  return { title: he.gate.title(Number(stage)) };
}

export default async function GatePage({ params }: Props) {
  const { stage: raw } = await params;
  const stage = Number(raw);
  const spec = Number.isInteger(stage) ? stageSpec(stage) : undefined;
  if (!spec) notFound();

  const learner = await getLearner();
  if (!learner) redirect("/sign-in");
  const view = learner.unlocks.stages.find((s) => s.stage === stage)!;

  const examSpec = spec.gate.find((g) => g.spec.kind === "exam")?.spec;
  const exam =
    view.gate.state !== "locked" && examSpec?.kind === "exam"
      ? drawExam(stageQuestionBank(stage), examSpec.questions, (await getGateAttemptCount(learner.userId, stage)) + 1)
      : null;

  const passedAt = Object.fromEntries(learner.gates.filter((g) => g.stage === stage).map((g) => [g.requirement, g.passed_at]));

  return (
    <GateScreen
      spec={spec}
      gate={view.gate}
      exam={exam}
      userId={learner.userId}
      learningBudget={learner.profile.learning_budget_ils === null ? null : Math.round(Number(learner.profile.learning_budget_ils))}
      contractSignedAt={learner.profile.contract_signed_at}
      passedAt={passedAt}
      persist
    />
  );
}
