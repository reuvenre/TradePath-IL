import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { LessonScreen, LockedLessonScreen } from "@/components/lesson/lesson-screen";
import { lessonSpec } from "@/lib/content/curriculum";
import { lessonExists, readLesson } from "@/lib/content/loader";
import { getLearner } from "@/lib/learner/queries";
import { isLastInStage, nextLessonId } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: lessonSpec(id)?.title ?? he.common.lesson };
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const spec = lessonSpec(id);
  if (!spec) notFound();

  const learner = await getLearner();
  if (!learner) redirect("/sign-in");

  // A locked lesson cannot be opened by URL: the content is not rendered.
  const state = learner.unlocks.lessonState(id);
  if (state === "locked" || state === "unwritten" || !lessonExists(id)) {
    return <LockedLessonScreen title={spec.title} unwritten={state === "unwritten" || !lessonExists(id)} />;
  }

  const lesson = readLesson(id);
  const next = nextLessonId(id);
  const toGate = isLastInStage(id);
  return (
    <LessonScreen
      lesson={lesson}
      state={state}
      persist
      quizHref={`/lesson/${id}/quiz`}
      nextHref={toGate ? `/gate/${spec.stage}` : next ? `/lesson/${next}` : null}
      nextLabel={toGate ? he.lesson.toGate : next ? he.lesson.nextLesson : null}
    />
  );
}
