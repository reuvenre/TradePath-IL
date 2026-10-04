// Phase 0 placeholder. Phase 1 replaces this with the zod schemas, the prerequisite graph
// and the glossary coverage check described in docs/03-LESSON-SPEC.md.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const lessonsDir = join("content", "lessons");
const required = ["index.mdx", "quiz.json", "cards.json"];
const lessons = existsSync(lessonsDir) ? readdirSync(lessonsDir) : [];
const problems = [];

for (const id of lessons) {
  for (const file of required) {
    if (!existsSync(join(lessonsDir, id, file))) problems.push(`${id}: missing ${file}`);
  }
}

if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`content:validate — ${lessons.length} lessons have all three files.`);
console.log("Schema, prerequisite and glossary checks arrive in Phase 1.");
