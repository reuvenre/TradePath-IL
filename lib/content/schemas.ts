import { z } from "zod";

// Shapes of everything under content/. docs/03-LESSON-SPEC.md is the source of these rules.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const LESSON_ID = /^s[0-7](-m\d+)?-l\d+$/;
const GLOSSARY_ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const isoDate = z.string().regex(ISO_DATE, "date must be YYYY-MM-DD");
export const lessonId = z.string().regex(LESSON_ID, "lesson id like s1-m2-l3 or s3-l4");
export const glossaryId = z.string().regex(GLOSSARY_ID, "glossary id is kebab-case");

export const sourceSchema = z
  .object({
    title: z.string().min(1),
    url: z.string().url().optional(),
    ref: z.string().min(1).optional(),
    accessed: isoDate,
  })
  .refine((s) => s.url !== undefined || s.ref !== undefined, {
    message: "a source needs a url or a ref",
  });

export const frontmatterSchema = z
  .object({
    id: lessonId,
    title: z.string().min(1),
    stage: z.number().int().min(0).max(7),
    module: z.number().int().min(1).optional(),
    order: z.number().int().min(1),
    minutes: z.number().int().min(15).max(25),
    objectives: z.array(z.string().min(1)).min(2).max(3),
    requires: z.array(glossaryId),
    introduces: z.array(glossaryId).max(4),
    widgets: z.array(z.string().min(1)),
    volatile: z.boolean(),
    verified_on: isoDate.optional(),
    sources: z.array(sourceSchema).min(1),
  })
  .strict()
  .superRefine((fm, ctx) => {
    if (fm.volatile && fm.verified_on === undefined) {
      ctx.addIssue({ code: "custom", path: ["verified_on"], message: "volatile lessons need verified_on" });
    }
  });

export type Frontmatter = z.infer<typeof frontmatterSchema>;

const questionBase = {
  id: z.string().regex(/^q\d+$/),
  prompt: z.string().min(1),
  explanation: z.string().min(1),
  objective: z.number().int().min(0),
};

export const singleQuestionSchema = z
  .object({
    ...questionBase,
    type: z.literal("single"),
    options: z.array(z.string().min(1)).length(4),
    answer: z.number().int().min(0).max(3),
  })
  .strict();

export const numericQuestionSchema = z
  .object({
    ...questionBase,
    type: z.literal("numeric"),
    answer: z.number(),
    tolerance: z.number().min(0),
    unit: z.string().optional(),
  })
  .strict();

export const questionSchema = z.discriminatedUnion("type", [singleQuestionSchema, numericQuestionSchema]);
export type Question = z.infer<typeof questionSchema>;
export type SingleQuestion = z.infer<typeof singleQuestionSchema>;
export type NumericQuestion = z.infer<typeof numericQuestionSchema>;

export const quizSchema = z
  .object({
    lessonId,
    questions: z.array(questionSchema).length(5),
  })
  .strict()
  .superRefine((quiz, ctx) => {
    const ids = new Set<string>();
    quiz.questions.forEach((q, i) => {
      if (ids.has(q.id)) ctx.addIssue({ code: "custom", path: ["questions", i, "id"], message: `duplicate id ${q.id}` });
      ids.add(q.id);
    });
  });
export type Quiz = z.infer<typeof quizSchema>;

export const cardSchema = z
  .object({
    id: z.string().regex(/^s[0-7](-m\d+)?-l\d+-c\d+$/, "card id is <lessonId>-c<n>"),
    front: z.string().min(1),
    back: z.string().min(1),
  })
  .strict();
export type Card = z.infer<typeof cardSchema>;

export const cardsSchema = z
  .object({
    lessonId,
    cards: z.array(cardSchema).min(3).max(4),
  })
  .strict()
  .superRefine((file, ctx) => {
    file.cards.forEach((c, i) => {
      if (!c.id.startsWith(`${file.lessonId}-c`)) {
        ctx.addIssue({ code: "custom", path: ["cards", i, "id"], message: `card id must start with ${file.lessonId}-c` });
      }
    });
  });
export type Cards = z.infer<typeof cardsSchema>;

export const glossaryEntrySchema = z
  .object({
    id: glossaryId,
    he: z.string().min(1),
    en: z.string().min(1),
    short: z.string().min(1),
    introducedIn: lessonId,
  })
  .strict();
export type GlossaryEntry = z.infer<typeof glossaryEntrySchema>;
export const glossarySchema = z.array(glossaryEntrySchema);

// ---- Exercises (ExerciseEngine presets) -------------------------------------------------------

const exerciseBase = {
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  lessonId,
  /** One Hebrew line: what to do and what to notice. */
  instruction: z.string().min(1),
};

export const sortExerciseSchema = z
  .object({
    ...exerciseBase,
    widget: z.literal("Sort"),
    buckets: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) }).strict()).min(2).max(4),
    items: z
      .array(
        z.object({ id: z.string().min(1), text: z.string().min(1), bucket: z.string().min(1), explanation: z.string().min(1) }).strict(),
      )
      .min(4),
  })
  .strict()
  .superRefine((ex, ctx) => {
    const buckets = new Set(ex.buckets.map((b) => b.id));
    ex.items.forEach((item, i) => {
      if (!buckets.has(item.bucket)) {
        ctx.addIssue({ code: "custom", path: ["items", i, "bucket"], message: `unknown bucket ${item.bucket}` });
      }
    });
  });

export const matchExerciseSchema = z
  .object({
    ...exerciseBase,
    widget: z.literal("Match"),
    pairs: z
      .array(
        z.object({ id: z.string().min(1), left: z.string().min(1), right: z.string().min(1), explanation: z.string().min(1) }).strict(),
      )
      .min(3),
  })
  .strict();

export const trueFalseExerciseSchema = z
  .object({
    ...exerciseBase,
    widget: z.literal("TrueFalse"),
    items: z
      .array(z.object({ id: z.string().min(1), statement: z.string().min(1), answer: z.boolean(), explanation: z.string().min(1) }).strict())
      .min(3),
  })
  .strict();

export const guessRevealExerciseSchema = z
  .object({
    ...exerciseBase,
    widget: z.literal("GuessReveal"),
    items: z
      .array(
        z
          .object({
            id: z.string().min(1),
            prompt: z.string().min(1),
            unit: z.string().min(1),
            min: z.number(),
            max: z.number(),
            step: z.number().positive(),
            actual: z.number(),
            /** A guess within this distance counts as "close". */
            tolerance: z.number().min(0),
            explanation: z.string().min(1),
            source: z.object({ title: z.string().min(1), url: z.string().url() }).strict().optional(),
          })
          .strict()
          .refine((it) => it.min < it.max && it.actual >= it.min && it.actual <= it.max, {
            message: "actual must lie inside [min, max]",
          }),
      )
      .min(2),
  })
  .strict();

export const scenarioChoiceExerciseSchema = z
  .object({
    ...exerciseBase,
    widget: z.literal("ScenarioChoice"),
    items: z
      .array(
        z
          .object({
            id: z.string().min(1),
            scenario: z.string().min(1),
            options: z.array(z.string().min(1)).min(2).max(4),
            answer: z.number().int().min(0),
            explanation: z.string().min(1),
          })
          .strict()
          .refine((it) => it.answer < it.options.length, { message: "answer index out of range" }),
      )
      .min(3),
  })
  .strict();

export const exerciseSchema = z.discriminatedUnion("widget", [
  sortExerciseSchema,
  matchExerciseSchema,
  trueFalseExerciseSchema,
  guessRevealExerciseSchema,
  scenarioChoiceExerciseSchema,
]);
export type Exercise = z.infer<typeof exerciseSchema>;
export type SortExercise = z.infer<typeof sortExerciseSchema>;
export type MatchExercise = z.infer<typeof matchExerciseSchema>;
export type TrueFalseExercise = z.infer<typeof trueFalseExerciseSchema>;
export type GuessRevealExercise = z.infer<typeof guessRevealExerciseSchema>;
export type ScenarioChoiceExercise = z.infer<typeof scenarioChoiceExerciseSchema>;
