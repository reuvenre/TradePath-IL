import { notFound } from "next/navigation";
import { GateScreen } from "@/components/gate/gate-screen";
import { stageSpec } from "@/lib/content/curriculum";
import { stageQuestionBank } from "@/lib/learner/bank";
import { drawExam } from "@/lib/learner/exam";
import { mockUnlocks } from "../../mock";

export default async function DevGatePage({ params }: { params: Promise<{ stage: string }> }) {
  const stage = Number((await params).stage);
  const spec = Number.isInteger(stage) ? stageSpec(stage) : undefined;
  if (!spec) notFound();
  const unlocks = mockUnlocks(stage === 0 ? "gate-0-open" : "stage-1-open");
  const view = unlocks.stages.find((s) => s.stage === stage)!;
  const examSpec = spec.gate.find((g) => g.spec.kind === "exam")?.spec;
  const exam = examSpec?.kind === "exam" ? drawExam(stageQuestionBank(stage), examSpec.questions, 1) : null;
  return (
    <GateScreen spec={spec} gate={view.gate} exam={exam} userId={null} learningBudget={15000} contractSignedAt={null} passedAt={{}} persist={false} />
  );
}
