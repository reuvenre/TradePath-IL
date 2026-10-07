import { cn } from "@/lib/utils";

/** A price, percentage, quantity, ticker or arithmetic run inside Hebrew text. Always LTR. */
export function Num({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={cn("tabular-nums", className)}>
      {children}
    </bdi>
  );
}
