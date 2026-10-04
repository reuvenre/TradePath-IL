import type { Root } from "mdast";

// In an RTL paragraph the Unicode bidi algorithm reorders "100 × 10.10 = 1,010" because the
// operators sit between numbers. This remark plugin wraps any arithmetic run (two or more numbers
// joined by operators, optionally with % or a currency sign) in <Num>, which renders <bdi dir="ltr">.
// Single numbers are left alone; lessons wrap those with <Num> by hand (docs/03-LESSON-SPEC.md).

// A number may carry a thousands separator, decimals and a trailing %.
const NUMBER = String.raw`\d[\d,]*(?:\.\d+)?%?`;
// Operators may have spaces around them but never a line break; ":" only as a ratio glued to digits (1:10),
// so a label colon ("הסיכון הוא 1%:") never pulls the next line into the island.
const OP = String.raw`(?:[ \t]*[×x\*÷/+\-−–=≈][ \t]*|:(?=\d))`;
// A leading minus must not be the Hebrew prefix hyphen ("ב-10.10"), so it may not follow a Hebrew letter.
const LEAD = String.raw`(?:(?<![\u0590-\u05FF])[−-][ \t]*)?`;
export const ARITHMETIC = new RegExp(`${LEAD}${NUMBER}(?:${OP}(?:[−-][ \t]*)?${NUMBER})+`, "g");

interface TextNode {
  type: "text";
  value: string;
}
interface JsxTextNode {
  type: "mdxJsxTextElement";
  name: string;
  attributes: never[];
  children: TextNode[];
}
interface Parent {
  type: string;
  name?: string | null;
  children?: (Parent | TextNode)[];
}

/** Splits a text value into text and <Num> nodes. Exported for tests. */
export function splitArithmetic(value: string): (TextNode | JsxTextNode)[] {
  const out: (TextNode | JsxTextNode)[] = [];
  let last = 0;
  for (const m of value.matchAll(ARITHMETIC)) {
    const start = m.index;
    const text = m[0];
    if (start > last) out.push({ type: "text", value: value.slice(last, start) });
    out.push({ type: "mdxJsxTextElement", name: "Num", attributes: [], children: [{ type: "text", value: text }] });
    last = start + text.length;
  }
  if (out.length === 0) return [{ type: "text", value }];
  if (last < value.length) out.push({ type: "text", value: value.slice(last) });
  return out;
}

const SKIP = new Set(["code", "inlineCode", "link", "html"]);

function visit(node: Parent, insideNum: boolean) {
  if (!node.children) return;
  const isNum = (node.type === "mdxJsxTextElement" || node.type === "mdxJsxFlowElement") && node.name === "Num";
  const next: (Parent | TextNode)[] = [];
  for (const child of node.children) {
    if (child.type === "text" && !insideNum && !isNum) {
      next.push(...(splitArithmetic((child as TextNode).value) as (Parent | TextNode)[]));
      continue;
    }
    if (!SKIP.has(child.type)) visit(child as Parent, insideNum || isNum);
    next.push(child);
  }
  node.children = next;
}

export default function remarkLtrMath() {
  return (tree: Root) => {
    visit(tree as unknown as Parent, false);
  };
}
