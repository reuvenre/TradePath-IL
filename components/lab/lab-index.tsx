import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { lessonSpec } from "@/lib/content/curriculum";
import { listExerciseIds, readExercise } from "@/lib/content/loader";
import { WIDGETS } from "@/lib/content/widgets";
import { he } from "@/lib/strings/he";

/** Lab index: the exercises written so far, and every widget with its build status. Fills up from Phase 2. */
export function LabIndex() {
  const exercises = listExerciseIds().map((id) => {
    const ex = readExercise(id);
    return { id, instruction: ex.instruction, widget: ex.widget, lessonId: ex.lessonId, lessonTitle: lessonSpec(ex.lessonId)?.title ?? ex.lessonId };
  });
  const built = WIDGETS.filter((w) => w.status === "built" && !w.exercise);
  const planned = WIDGETS.filter((w) => w.status === "planned");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">{he.lab.title}</h1>
      <p className="mt-1 text-muted-foreground">{he.lab.intro}</p>

      <section className="mt-6" aria-labelledby="lab-exercises">
        <h2 id="lab-exercises" className="text-lg font-semibold">
          {he.lab.exercises}
        </h2>
        <p className="text-sm text-muted-foreground">{he.lab.exercisesIntro}</p>
        <ul className="mt-3 divide-y rounded-xl border">
          {exercises.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium">{e.instruction}</p>
                <p className="text-xs text-muted-foreground">
                  {e.widget} · {e.lessonTitle}
                </p>
              </div>
              <Link href={`/lesson/${e.lessonId}`} className="inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline">
                {he.lab.openLesson}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="lab-widgets">
        <h2 id="lab-widgets" className="text-lg font-semibold">
          {he.lab.title}
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {[...built, ...planned].map((w) => (
            <li key={w.name} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <span>
                <span className="block font-medium">{w.he}</span>
                <bdi dir="ltr" className="block text-xs text-muted-foreground">
                  {w.name}
                </bdi>
              </span>
              <Badge variant={w.status === "built" ? "success" : "muted"}>
                {w.status === "built" ? he.lab.built : he.common.comingInPhase(w.phase)}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
