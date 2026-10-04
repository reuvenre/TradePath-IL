/**
 * The worked example. Stays RTL (Hebrew prose) but gives tables and arithmetic lines room;
 * arithmetic runs inside it are wrapped LTR by the remark plugin and <Num>.
 */
export function Example({ children }: { children: React.ReactNode }) {
  return (
    <section
      aria-label="דוגמה עם מספרים"
      className="my-6 rounded-xl border bg-card p-4 leading-relaxed shadow-xs [&_p]:my-2 [&_table]:my-3 [&_table]:w-auto [&_td]:px-3 [&_td]:py-1 [&_th]:px-3 [&_th]:py-1 [&_td:last-child]:text-end [&_td:last-child]:tabular-nums"
    >
      {children}
    </section>
  );
}
