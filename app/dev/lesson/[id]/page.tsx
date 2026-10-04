import { notFound } from "next/navigation";
import { LessonScreen } from "@/components/lesson/lesson-screen";
import { lessonExists, readLesson } from "@/lib/content/loader";
import { nextLessonId } from "@/lib/learner/unlock";
import { he } from "@/lib/strings/he";

export default async function DevLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!lessonExists(id)) notFound();
  const next = nextLessonId(id);
  return (
    <LessonScreen
      lesson={readLesson(id)}
      state="available"
      persist={false}
      quizHref={`/dev/lesson/${id}/quiz`}
      nextHref={next ? `/dev/lesson/${next}` : null}
      nextLabel={next ? he.lesson.nextLesson : null}
    />
  );
}
