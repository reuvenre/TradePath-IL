import { splitArithmetic } from "@/lib/content/remark-ltr-math";

/**
 * Renders a plain string (quiz prompt, flashcard, exercise text) with every arithmetic run isolated
 * as LTR, the same treatment the remark plugin gives lesson prose. Pure; safe in client components.
 */
export function LtrText({ text, as: Tag = "span", className }: { text: string; as?: "span" | "p"; className?: string }) {
  const parts = splitArithmetic(text);
  return (
    <Tag className={className}>
      {parts.map((p, i) =>
        p.type === "text" ? (
          p.value
        ) : (
          <bdi key={i} dir="ltr" className="tabular-nums">
            {p.children[0].value}
          </bdi>
        ),
      )}
    </Tag>
  );
}
