---
description: Write one lesson from the curriculum with quiz, flashcards, beginner review and fact check
argument-hint: <lesson id, e.g. s1-m2-l2>
---

Create lesson $ARGUMENTS.

1. Find $ARGUMENTS in `docs/02-CURRICULUM.md`. If it is not there, stop and say so.
2. Read `docs/03-LESSON-SPEC.md` and both reference lessons (`content/lessons/s1-m1-l1/`, `content/lessons/s3-l4/`).
3. Work out which glossary terms earlier lessons have introduced (curriculum order). If an earlier lesson that this one depends on has not been written yet, list the terms you are assuming and continue.
4. If the lesson is marked ⏱ in the curriculum or states statistics, have the `fact-checker` subagent gather and confirm the facts **before** writing. Do not write changeable facts from memory.
5. Have the `lesson-writer` subagent draft `index.mdx` and add new terms to `content/glossary.json`.
6. Have the `quiz-author` subagent write `quiz.json` and `cards.json`.
7. Have the `beginner-reviewer` subagent read the lesson. Fix every item it raises and send it back until it returns PASS. Three rounds at most; if it still fails, report what is stuck.
8. Run `npm run content:validate` and fix failures.
9. Report in Hebrew: lesson title, new terms, the widget it needs and whether that widget exists yet, facts that were verified with their sources, and anything Reuven should read himself.
