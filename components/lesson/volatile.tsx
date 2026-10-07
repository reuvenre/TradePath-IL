import { CalendarCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { he } from "@/lib/strings/he";
import { daysBetween } from "@/lib/srs/leitner";

export const STALE_AFTER_DAYS = 90;

export function isStale(verifiedOn: string, today: string): boolean {
  return daysBetween(verifiedOn, today) > STALE_AFTER_DAYS;
}

/** Wraps a sentence that states a changeable fact and shows the learner when it was last verified. */
export function Volatile({ verifiedOn, today, children }: { verifiedOn: string; today: string; children: React.ReactNode }) {
  const stale = isStale(verifiedOn, today);
  return (
    <span className="inline">
      {children}{" "}
      <Badge variant={stale ? "warn" : "muted"} className="align-middle">
        <CalendarCheck aria-hidden />
        <span>
          {he.lesson.verifiedOn("")}
          <bdi dir="ltr">{verifiedOn}</bdi>
        </span>
        {stale ? <span className="sr-only">. {he.lesson.staleFact}</span> : null}
      </Badge>
    </span>
  );
}
