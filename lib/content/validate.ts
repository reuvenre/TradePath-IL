import { existsSync } from "node:fs";
import { join } from "node:path";
import { ZodError } from "zod";
import { analyzeMdx, type JsxUse } from "./mdx-analysis";
import { LESSONS, lessonIndex, lessonSpec } from "./curriculum";
import {
  CONTENT_ROOT,
  exerciseExists,
  lessonDir,
  listExerciseIds,
  listWrittenLessonIds,
  readCards,
  readExercise,
  readFrontmatter,
  readGlossary,
  readQuiz,
} from "./loader";
import { EXERCISE_WIDGETS, widgetInfo } from "./widgets";

// The rules from docs/03-LESSON-SPEC.md, applied to a content root.
// `errors` fail `npm run content:validate`; `warnings` are printed only.

export interface Problem {
  /** "s1-m1-l1", "glossary", "exercises/<id>" */
  where: string;
  message: string;
}

export interface ValidationReport {
  errors: Problem[];
  warnings: Problem[];
  lessons: string[];
}

export const REQUIRED_HEADINGS = [
  "בשורה אחת",
  "נתחיל ממשהו מוכר",
  "ועכשיו בשוק",
  "דוגמה עם מספרים",
  "נסה בעצמך",
  "טעויות נפוצות",
  "סיכום",
];

const MAX_CALLOUTS = 2;
const STALE_DAYS = 90;
const WORDS_MIN = 500;
const WORDS_MAX = 900;

function zodMessage(e: unknown): string {
  if (e instanceof ZodError) {
    return e.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`).join("; ");
  }
  return e instanceof Error ? e.message : String(e);
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

export async function validateContent(root = CONTENT_ROOT, today = new Date()): Promise<ValidationReport> {
  const errors: Problem[] = [];
  const warnings: Problem[] = [];
  const error = (where: string, message: string) => errors.push({ where, message });
  const warn = (where: string, message: string) => warnings.push({ where, message });

  // ---- glossary ----
  const glossary = new Map<string, { introducedIn: string }>();
  try {
    const entries = readGlossary(root);
    const seen = new Set<string>();
    for (const g of entries) {
      if (seen.has(g.id)) error("glossary", `duplicate term id "${g.id}"`);
      seen.add(g.id);
      if (lessonIndex(g.introducedIn) < 0) error("glossary", `term "${g.id}": introducedIn "${g.introducedIn}" is not a curriculum lesson`);
      glossary.set(g.id, { introducedIn: g.introducedIn });
    }
  } catch (e) {
    error("glossary", `content/glossary.json: ${zodMessage(e)}`);
  }

  // ---- exercises ----
  const exercises = new Map<string, { widget: string; lessonId: string }>();
  for (const id of listExerciseIds(root)) {
    const where = `exercises/${id}`;
    try {
      const ex = readExercise(id, root);
      if (ex.id !== id) error(where, `id "${ex.id}" does not match file name`);
      if (lessonIndex(ex.lessonId) < 0) error(where, `lessonId "${ex.lessonId}" is not a curriculum lesson`);
      exercises.set(id, { widget: ex.widget, lessonId: ex.lessonId });
    } catch (e) {
      error(where, zodMessage(e));
    }
  }

  // ---- lessons ----
  const lessons = listWrittenLessonIds(root);
  for (const id of lessons) {
    const where = id;
    const spec = lessonSpec(id);
    if (!spec) {
      error(where, "folder is not a lesson in docs/02-CURRICULUM.md");
      continue;
    }
    for (const file of ["index.mdx", "quiz.json", "cards.json"]) {
      if (!existsSync(join(lessonDir(root, id), file))) error(where, `missing ${file}`);
    }

    let meta;
    let body = "";
    try {
      ({ meta, body } = readFrontmatter(id, root));
    } catch (e) {
      error(where, `index.mdx frontmatter: ${zodMessage(e)}`);
      continue;
    }

    if (meta.id !== id) error(where, `frontmatter id "${meta.id}" does not match folder`);
    if (meta.stage !== spec.stage) error(where, `stage ${meta.stage} should be ${spec.stage}`);
    if ((meta.module ?? null) !== (spec.module ?? null)) error(where, `module ${meta.module ?? "none"} should be ${spec.module ?? "none"}`);
    if (meta.order !== spec.order) error(where, `order ${meta.order} should be ${spec.order}`);
    if (spec.volatile && !meta.volatile) error(where, "curriculum marks this lesson ⏱ (volatile) but frontmatter says volatile: false");
    if (meta.volatile) {
      if (!meta.sources.some((s) => s.url)) error(where, "volatile lessons need at least one source with a url");
      if (meta.verified_on) {
        const age = daysBetween(new Date(meta.verified_on), today);
        if (age > STALE_DAYS) warn(where, `verified_on is ${age} days old; re-verify (limit ${STALE_DAYS})`);
      }
    }

    // prerequisite graph
    const myIndex = lessonIndex(id);
    const allowedTerms = new Set<string>();
    for (const t of meta.requires) {
      const g = glossary.get(t);
      if (!g) {
        error(where, `requires "${t}" which is not in content/glossary.json`);
        continue;
      }
      const introIndex = lessonIndex(g.introducedIn);
      if (introIndex < 0 || introIndex >= myIndex) {
        error(where, `requires "${t}" but it is introduced in ${g.introducedIn}, which is not an earlier lesson`);
      }
      allowedTerms.add(t);
    }
    for (const t of meta.introduces) {
      const g = glossary.get(t);
      if (!g) {
        error(where, `introduces "${t}" which is not in content/glossary.json`);
        continue;
      }
      if (g.introducedIn !== id) error(where, `introduces "${t}" but glossary says it is introduced in ${g.introducedIn}`);
      allowedTerms.add(t);
    }
    for (const [termId, g] of glossary) {
      if (g.introducedIn === id && !meta.introduces.includes(termId)) {
        error(where, `glossary says "${termId}" is introduced here, but frontmatter introduces does not list it`);
      }
    }

    // widgets declared
    for (const w of meta.widgets) {
      if (!widgetInfo(w)) error(where, `widgets lists "${w}", which is not a registered widget`);
    }

    // body
    let analysis;
    try {
      analysis = await analyzeMdx(body);
    } catch (e) {
      error(where, `index.mdx does not compile: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }

    const headings = analysis.headings;
    if (headings.length !== REQUIRED_HEADINGS.length || headings.some((h, i) => h !== REQUIRED_HEADINGS[i])) {
      error(where, `body headings must be exactly, in order: ${REQUIRED_HEADINGS.join(" / ")} (found: ${headings.join(" / ") || "none"})`);
    }
    if (analysis.hebrewWords < WORDS_MIN || analysis.hebrewWords > WORDS_MAX) {
      warn(where, `about ${analysis.hebrewWords} Hebrew words; the spec asks for ${WORDS_MIN}–${WORDS_MAX}`);
    }

    const termsUsed = new Set<string>();
    const widgetsUsed = new Set<string>();
    let callouts = 0;
    const at = (c: JsxUse) => (c.line ? ` (line ${c.line})` : "");
    for (const c of analysis.components) {
      switch (c.name) {
        case "Term": {
          const termId = c.attributes.id;
          if (typeof termId !== "string") {
            error(where, `<Term> without an id${at(c)}`);
            break;
          }
          if (!glossary.has(termId)) error(where, `<Term id="${termId}"> is not in content/glossary.json${at(c)}`);
          else if (!allowedTerms.has(termId)) error(where, `<Term id="${termId}"> is used but not listed in requires or introduces${at(c)}`);
          if (termsUsed.has(termId)) warn(where, `<Term id="${termId}"> appears more than once; later uses should be plain text${at(c)}`);
          termsUsed.add(termId);
          break;
        }
        case "Callout": {
          callouts += 1;
          const type = c.attributes.type;
          if (type !== "warn" && type !== "tip" && type !== "note") error(where, `<Callout type> must be warn, tip or note${at(c)}`);
          break;
        }
        case "Figure": {
          if (typeof c.attributes.alt !== "string" || c.attributes.alt.trim() === "") error(where, `<Figure> needs a Hebrew alt${at(c)}`);
          if (typeof c.attributes.src !== "string") error(where, `<Figure> needs src${at(c)}`);
          break;
        }
        case "Volatile": {
          if (typeof c.attributes.verifiedOn !== "string") error(where, `<Volatile> needs verifiedOn${at(c)}`);
          if (!meta.volatile) error(where, `<Volatile> used but frontmatter says volatile: false${at(c)}`);
          break;
        }
        case "Widget": {
          const name = c.attributes.name;
          if (typeof name !== "string") {
            error(where, `<Widget> without a name${at(c)}`);
            break;
          }
          widgetsUsed.add(name);
          const info = widgetInfo(name);
          if (!info) error(where, `<Widget name="${name}"> is not a registered widget${at(c)}`);
          if (!meta.widgets.includes(name)) error(where, `<Widget name="${name}"> is used but not listed in frontmatter widgets${at(c)}`);
          const preset = c.attributes.preset;
          if (info?.exercise) {
            if (typeof preset !== "string") error(where, `<Widget name="${name}"> needs preset = an exercise id${at(c)}`);
            else if (!exerciseExists(preset, root)) error(where, `<Widget name="${name}" preset="${preset}">: content/exercises/${preset}.json does not exist${at(c)}`);
            else {
              const ex = exercises.get(preset);
              if (ex && ex.widget !== name) error(where, `exercise "${preset}" is a ${ex.widget}, not a ${name}${at(c)}`);
              if (ex && ex.lessonId !== id) error(where, `exercise "${preset}" belongs to lesson ${ex.lessonId}${at(c)}`);
            }
          }
          break;
        }
        case "Example":
        case "Num":
          break;
        default:
          error(where, `unknown component <${c.name}>${at(c)}`);
      }
    }
    if (callouts > MAX_CALLOUTS) error(where, `${callouts} callouts; at most ${MAX_CALLOUTS}`);
    for (const t of meta.introduces) {
      if (!termsUsed.has(t)) error(where, `introduces "${t}" but the body never wraps it in <Term id="${t}">`);
    }
    for (const w of meta.widgets) {
      if (!widgetsUsed.has(w)) error(where, `frontmatter widgets lists "${w}" but the body never uses <Widget name="${w}">`);
    }

    // quiz
    try {
      const quiz = readQuiz(id, root);
      if (quiz.lessonId !== id) error(where, `quiz.json lessonId "${quiz.lessonId}" does not match`);
      const covered = new Set<number>();
      quiz.questions.forEach((q, i) => {
        if (q.objective >= meta.objectives.length) error(where, `quiz question ${i + 1}: objective ${q.objective} does not exist (lesson has ${meta.objectives.length})`);
        covered.add(q.objective);
      });
      meta.objectives.forEach((_, i) => {
        if (!covered.has(i)) error(where, `quiz does not test objective ${i + 1}`);
      });
    } catch (e) {
      error(where, `quiz.json: ${zodMessage(e)}`);
    }

    // cards
    try {
      const cards = readCards(id, root);
      if (cards.lessonId !== id) error(where, `cards.json lessonId "${cards.lessonId}" does not match`);
    } catch (e) {
      error(where, `cards.json: ${zodMessage(e)}`);
    }
  }

  // exercises must belong to a written lesson that uses them
  for (const [exId, ex] of exercises) {
    if (!lessons.includes(ex.lessonId)) warn(`exercises/${exId}`, `lesson ${ex.lessonId} is not written yet`);
  }

  void LESSONS;
  void EXERCISE_WIDGETS;
  return { errors, warnings, lessons };
}

export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  for (const p of report.errors) lines.push(`ERROR ${p.where}: ${p.message}`);
  for (const p of report.warnings) lines.push(`warn  ${p.where}: ${p.message}`);
  return lines.join("\n");
}
