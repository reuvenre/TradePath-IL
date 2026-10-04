import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LockedLessonScreen } from "@/components/lesson/lesson-screen";
import { Quiz } from "@/components/quiz/quiz";
import { lessonSpec } from "@/lib/content/curriculum";
import { lessonExists, readFrontmatter, readQuiz } from "@/lib/content/loader";
import { getLearner } from "@/lib/learner/queries";
import { isLastInStage, nextLessonId } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: he.quiz.heading(lessonSpec(id)?.title ?? "") };
}

export default async function QuizPage({ params }: Props) {
  const { id } = await params;
  const spec = lessonSpec(id);
  if (!spec) notFound();
  const learner = await getLearner();
  if (!learner) redirect("/sign-in");

  const state = learner.unlocks.lessonState(id);
  if ((state !== "available" && state !== "done") || !lessonExists(id)) {
    return <LockedLessonScreen title={spec.title} unwritten={state === "unwritten"} />;
  }

  const { meta } = readFrontmatter(id);
  const quiz = readQuiz(id);
  const next = nextLessonId(id);
  const toGate = isLastInStage(id);
  return (
    <Quiz
      lessonId={id}
      lessonTitle={meta.title}
      questions={quiz.questions}
      persist
      lessonHref={`/lesson/${id}`}
      nextHref={toGate ? `/gate/${spec.stage}` : next ? `/lesson/${next}` : "/roadmap"}
      nextLabel={toGate ? he.lesson.toGate : next ? he.lesson.nextLesson : he.lesson.toRoadmap}
    />
  );
}
