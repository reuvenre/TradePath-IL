---
description: Review an existing lesson for clarity, accuracy and spec compliance without rewriting it
argument-hint: <lesson id>
---

Review lesson $ARGUMENTS. Do not edit files unless Reuven asks afterwards.

1. Read the lesson folder, `docs/03-LESSON-SPEC.md` and the lesson's row in `docs/02-CURRICULUM.md`.
2. Run the `beginner-reviewer` subagent on it.
3. Run the `fact-checker` subagent on every factual claim and number.
4. Check the quiz yourself: answer each question from the lesson text alone. Flag any question that needs knowledge the lesson does not give, has two defensible answers, or tests recall only.
5. Recompute every worked example.
6. Report in Hebrew as a list ordered by severity: wrong (facts, arithmetic), unclear (beginner would get lost), spec violations, nice-to-have. For each: the exact sentence, the problem, a proposed fix.
