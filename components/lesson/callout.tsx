import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import { he } from "@/lib/strings/he";
import { cn } from "@/lib/utils";

type CalloutType = "warn" | "tip" | "note";

const STYLE: Record<CalloutType, { icon: typeof Info; box: string }> = {
  warn: { icon: AlertTriangle, box: "border-amber-500/40 bg-amber-500/10" },
  tip: { icon: Lightbulb, box: "border-emerald-500/40 bg-emerald-500/10" },
  note: { icon: Info, box: "border-border bg-muted/60" },
};

export function Callout({ type = "note", children }: { type?: CalloutType; children: React.ReactNode }) {
  const kind: CalloutType = type in STYLE ? type : "note";
  const { icon: Icon, box } = STYLE[kind];
  return (
    <aside className={cn("my-6 flex gap-3 rounded-xl border p-4 text-[0.95rem] leading-relaxed", box)} role="note">
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div className="min-w-0 [&>p]:my-0 [&>p+p]:mt-2">
        <span className="sr-only">{he.lesson.callout[kind]}: </span>
        {children}
      </div>
    </aside>
  );
}
