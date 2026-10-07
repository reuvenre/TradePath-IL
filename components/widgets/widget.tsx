import { ExerciseEngine } from "@/components/exercise/exercise-engine";
import { exerciseExists, readExercise } from "@/lib/content/loader";
import { widgetInfo } from "@/lib/content/widgets";
import { he } from "@/lib/strings/he";
import { LearningBudgetWidget } from "./learning-budget";
import { WidgetPlaceholder } from "./placeholder";
import { SystemTour } from "./system-tour";

// Server component behind <Widget name="…" preset="…" /> in lessons. Resolves the registry entry,
// loads exercise data from content/exercises when the widget is an ExerciseEngine preset, and
// shows a placeholder for widgets that a later build phase delivers.

export function Widget({ name, preset, persist }: { name: string; preset?: string; lessonId: string; persist: boolean }) {
  const info = widgetInfo(name);
  if (!info) return <WidgetPlaceholder name={name} phase={0} description={he.lesson.widgetUnknown(name)} />;

  if (info.exercise) {
    if (!preset || !exerciseExists(preset)) {
      return <WidgetPlaceholder name={name} phase={info.phase} description={he.lesson.exerciseMissing(preset ?? "")} />;
    }
    return <ExerciseEngine exercise={readExercise(preset)} persist={persist} />;
  }

  switch (name) {
    case "SystemTour":
      return <SystemTour />;
    case "LearningBudget":
      return <LearningBudgetWidget persist={persist} />;
    default:
      return <WidgetPlaceholder name={name} phase={info.phase} description={info.he} />;
  }
}

