import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { MDXComponents } from "mdx/types";
import { readGlossary } from "@/lib/content/loader";
import remarkLtrMath from "@/lib/content/remark-ltr-math";
import { localDate } from "@/lib/srs/leitner";
import { he } from "@/lib/strings/he";
import { Callout } from "./callout";
import { Example } from "./example";
import { Figure } from "./figure";
import { Num } from "./num";
import { Term } from "./term";
import { Volatile } from "./volatile";
import { Widget } from "@/components/widgets/widget";

// Server component: compiles one lesson body with the component map from docs/03-LESSON-SPEC.md.

interface Props {
  body: string;
  lessonId: string;
  /** false on dev previews: widgets must not write progress. */
  persist: boolean;
}

export async function LessonBody({ body, lessonId, persist }: Props) {
  const glossary = new Map(readGlossary().map((g) => [g.id, g]));
  const today = localDate();

  const components: MDXComponents = {
    Term: ({ id, children }: { id: string; children: React.ReactNode }) => {
      const g = glossary.get(id);
      return <Term term={g ? { id: g.id, he: g.he, en: g.en, short: g.short } : undefined}>{children}</Term>;
    },
    Callout,
    Example,
    Num,
    Figure,
    Volatile: ({ verifiedOn, children }: { verifiedOn: string; children: React.ReactNode }) => (
      <Volatile verifiedOn={verifiedOn} today={today}>
        {children}
      </Volatile>
    ),
    Widget: ({ name, preset }: { name: string; preset?: string }) => (
      <Widget name={name} preset={preset} lessonId={lessonId} persist={persist} />
    ),
    table: (props) => (
      <div className="my-4 overflow-x-auto">
        <table className="text-sm" {...props} />
      </div>
    ),
  };

  const { content } = await compileMDX({
    source: body,
    components,
    options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkLtrMath] } },
  });

  return (
    <div
      className="lesson-prose max-w-none text-[1.05rem] leading-8 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:scroll-mt-20 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:my-4 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-6 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-6 [&_li]:my-1 [&_strong]:font-semibold [&_th]:text-start [&_th]:font-semibold [&_thead]:border-b"
      aria-label={he.common.lesson}
    >
      {content}
    </div>
  );
}
