import { Construction } from "lucide-react";
import { he } from "@/lib/strings/he";

/** Shown where a lesson embeds a widget that a later build phase delivers. */
export function WidgetPlaceholder({ name, phase, description }: { name: string; phase: number; description: string }) {
  return (
    <div className="my-6 rounded-xl border border-dashed p-5 text-center" role="note" data-widget-placeholder={name}>
      <Construction className="mx-auto mb-2 size-6 text-muted-foreground" aria-hidden />
      <p className="font-medium">{he.lesson.widgetPlaceholderTitle(name)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-1 text-sm text-muted-foreground">{he.lesson.widgetPlaceholderBody(phase)}</p>
    </div>
  );
}
