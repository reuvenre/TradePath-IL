"use client";

import { BookOpen, FlaskConical, Layers, Map, type LucideIcon, Milestone, NotebookPen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { he } from "@/lib/strings/he";

const ICONS: LucideIcon[] = [BookOpen, Map, Layers, NotebookPen, Milestone, FlaskConical];

/** Stage 0, lesson 1: a step-through of the screens the learner will use. */
export function SystemTour() {
  const steps = he.widgets.tour.steps;
  const [i, setI] = useState(0);
  const finished = i >= steps.length;
  const Icon = ICONS[Math.min(i, ICONS.length - 1)];

  return (
    <section className="my-6 rounded-xl border bg-card p-4 shadow-xs" aria-label={he.widgets.tour.title} data-widget="SystemTour">
      <Progress value={(Math.min(i, steps.length) / steps.length) * 100} label={he.widgets.tour.title} size="sm" />
      {finished ? (
        <div className="mt-4" role="status">
          <p className="leading-relaxed">{he.widgets.tour.finished}</p>
          <Button variant="outline" className="mt-3 min-h-11" onClick={() => setI(0)}>
            {he.common.reset}
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground">{he.widgets.tour.stepOf(i + 1, steps.length)}</p>
          <div className="mt-2 flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Icon className="size-6" aria-hidden />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{steps[i].title}</h3>
              <p className="mt-1 leading-relaxed">{steps[i].body}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="min-h-11 flex-1" onClick={() => setI((n) => n + 1)}>
              {i === steps.length - 1 ? he.common.continue : he.common.next}
            </Button>
            {i > 0 ? (
              <Button variant="outline" className="min-h-11" onClick={() => setI((n) => n - 1)}>
                {he.common.back}
              </Button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
