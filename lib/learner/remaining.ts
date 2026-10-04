import { lessonExists, readFrontmatter } from "@/lib/content/loader";
import type { Unlocks } from "./unlock";

const DEFAULT_MINUTES = 20;

/** Minutes of lessons not yet completed, using each written lesson's own `minutes` and 20 for unwritten ones. */
export function remainingLessonMinutes(unlocks: Unlocks): number {
  let total = 0;
  for (const stage of unlocks.stages) {
    for (const l of stage.lessons) {
      if (l.state === "done") continue;
      total += lessonExists(l.id) ? safeMinutes(l.id) : DEFAULT_MINUTES;
    }
  }
  return total;
}

function safeMinutes(id: string): number {
  try {
    return readFrontmatter(id).meta.minutes;
  } catch {
    return DEFAULT_MINUTES;
  }
}
