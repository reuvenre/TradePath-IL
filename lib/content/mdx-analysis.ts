import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import type { Root } from "mdast";

// Reads the MDX syntax tree of a lesson body and reports what the validator needs:
// which components are used, with which attributes, and which headings appear in which order.

export interface JsxUse {
  name: string;
  attributes: Record<string, string | true>;
  line: number | undefined;
}

export interface MdxAnalysis {
  components: JsxUse[];
  /** Depth-2 headings as plain text, in document order. */
  headings: string[];
  /** Approximate word count of the prose (text nodes only: not code, not JSX attributes). */
  hebrewWords: number;
}

interface MdastNode {
  type: string;
  name?: string | null;
  depth?: number;
  value?: string;
  children?: MdastNode[];
  attributes?: { type: string; name?: string; value?: unknown }[];
  position?: { start: { line: number } };
}

function textOf(node: MdastNode): string {
  if (typeof node.value === "string" && (node.type === "text" || node.type === "inlineCode")) return node.value;
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: MdastNode, out: MdxAnalysis) {
  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    const attributes: Record<string, string | true> = {};
    for (const a of node.attributes ?? []) {
      if (a.type !== "mdxJsxAttribute" || !a.name) continue;
      attributes[a.name] = typeof a.value === "string" ? a.value : true;
    }
    out.components.push({ name: node.name ?? "", attributes, line: node.position?.start.line });
  }
  if (node.type === "heading" && node.depth === 2) out.headings.push(textOf(node).trim());
  if (node.type === "text" && typeof node.value === "string") {
    out.hebrewWords += (node.value.match(/[\p{L}\p{N}][\p{L}\p{N}"'׳״.,%:-]*/gu) ?? []).length;
  }
  for (const child of node.children ?? []) walk(child, out);
}

/** Parses an MDX body. Throws on a syntax error with the compiler's message. */
export async function analyzeMdx(body: string): Promise<MdxAnalysis> {
  const out: MdxAnalysis = { components: [], headings: [], hebrewWords: 0 };
  const collect = () => (tree: Root) => walk(tree as unknown as MdastNode, out);
  await compile(body, { remarkPlugins: [remarkGfm, collect], outputFormat: "function-body" });
  return out;
}
