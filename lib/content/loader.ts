import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import {
  cardsSchema,
  exerciseSchema,
  frontmatterSchema,
  glossarySchema,
  quizSchema,
  type Cards,
  type Exercise,
  type Frontmatter,
  type GlossaryEntry,
  type Quiz,
} from "./schemas";

// Reads content/ from disk. Server-only (fs); the validator and the pages share it.
// Every reader throws a descriptive error on invalid content, so a broken file fails the build,
// not the learner's session.

export const CONTENT_ROOT = join(process.cwd(), "content");

export interface LessonFiles {
  meta: Frontmatter;
  body: string;
  quiz: Quiz;
  cards: Cards;
}

export function lessonDir(root: string, id: string): string {
  return join(root, "lessons", id);
}

export function listWrittenLessonIds(root = CONTENT_ROOT): string[] {
  const dir = join(root, "lessons");
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export function lessonExists(id: string, root = CONTENT_ROOT): boolean {
  return existsSync(join(lessonDir(root, id), "index.mdx"));
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function readFrontmatter(id: string, root = CONTENT_ROOT): { meta: Frontmatter; body: string } {
  const raw = readFileSync(join(lessonDir(root, id), "index.mdx"), "utf8");
  const parsed = matter(raw);
  const meta = frontmatterSchema.parse(parsed.data);
  return { meta, body: parsed.content };
}

export function readQuiz(id: string, root = CONTENT_ROOT): Quiz {
  return quizSchema.parse(readJson(join(lessonDir(root, id), "quiz.json")));
}

export function readCards(id: string, root = CONTENT_ROOT): Cards {
  return cardsSchema.parse(readJson(join(lessonDir(root, id), "cards.json")));
}

export function readLesson(id: string, root = CONTENT_ROOT): LessonFiles {
  const { meta, body } = readFrontmatter(id, root);
  return { meta, body, quiz: readQuiz(id, root), cards: readCards(id, root) };
}

export function readGlossary(root = CONTENT_ROOT): GlossaryEntry[] {
  return glossarySchema.parse(readJson(join(root, "glossary.json")));
}

export function listExerciseIds(root = CONTENT_ROOT): string[] {
  const dir = join(root, "exercises");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length))
    .sort();
}

export function exerciseExists(id: string, root = CONTENT_ROOT): boolean {
  return existsSync(join(root, "exercises", `${id}.json`));
}

export function readExercise(id: string, root = CONTENT_ROOT): Exercise {
  return exerciseSchema.parse(readJson(join(root, "exercises", `${id}.json`)));
}

/** Card id → lesson id ("s1-m1-l1-c3" → "s1-m1-l1"). */
export function lessonIdOfCard(cardId: string): string {
  return cardId.replace(/-c\d+$/, "");
}
