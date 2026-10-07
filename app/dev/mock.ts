import { listWrittenLessonIds } from "@/lib/content/loader";
import { lessonsOfStage } from "@/lib/content/curriculum";
import { computeUnlocks, gateKey, type Unlocks } from "@/lib/learner/unlock";

// Fixed learner states for the dev previews and the Playwright suite.

export type Scenario = "fresh" | "mid-stage-0" | "gate-0-open" | "stage-1-open";

export function mockUnlocks(scenario: Scenario = "mid-stage-0"): Unlocks {
  const written = new Set(listWrittenLessonIds());
  const stage0 = lessonsOfStage(0).map((l) => l.id);
  const completed: string[] = [];
  const gates: string[] = [];
  if (scenario === "mid-stage-0") completed.push("s0-l1");
  if (scenario === "gate-0-open") completed.push(...stage0);
  if (scenario === "stage-1-open") {
    completed.push(...stage0);
    gates.push(gateKey(0, "exam"), gateKey(0, "contract"));
  }
  return computeUnlocks({ completed: new Set(completed), gates: new Set(gates), written });
}

export function scenarioFrom(value: string | string[] | undefined): Scenario {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "fresh" || v === "gate-0-open" || v === "stage-1-open" ? v : "mid-stage-0";
}
