import { notFound } from "next/navigation";
import { Quiz } from "@/components/quiz/quiz";
import { lessonExists, readFrontmatter, readQuiz } from "@/lib/content/loader";
import { he } from "@/lib/strings/he";

export default async function DevQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!lessonExists(id)) notFound();
  return (
    <Quiz
      lessonId={id}
      lessonTitle={readFrontmatter(id).meta.title}
      questions={readQuiz(id).questions}
      persist={false}
      lessonHref={`/dev/lesson/${id}`}
      nextHref="/dev/roadmap"
      nextLabel={he.lesson.toRoadmap}
      seed={1}
    />
  );
}
