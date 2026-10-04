import { notFound } from "next/navigation";
import { ExerciseEngine } from "@/components/exercise/exercise-engine";
import { exerciseExists, readExercise } from "@/lib/content/loader";

export default async function DevExercisePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!exerciseExists(id)) notFound();
  const exercise = readExercise(id);
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">{exercise.instruction}</h1>
      <ExerciseEngine exercise={exercise} persist={false} />
    </div>
  );
}
