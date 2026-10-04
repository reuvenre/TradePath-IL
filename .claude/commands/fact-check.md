---
description: Re-verify changeable facts against primary sources
argument-hint: <lesson id | all-volatile>
---

Fact-check: $ARGUMENTS

- If the argument is a lesson id, check that lesson.
- If it is `all-volatile`, list every lesson with `volatile: true`, oldest `verified_on` first, and check each. Also check the "Verified facts" tables in `docs/08-SOURCES.md` and the config files behind SessionClock and TaxCalc.

For each item use the `fact-checker` subagent. Follow the rules at the bottom of `docs/08-SOURCES.md`.

When a fact has changed: update the lesson text, the widget config if any, `docs/08-SOURCES.md`, the frontmatter `sources` and `verified_on`; then re-run the quiz and cards for consistency and run `npm run content:validate`.

Report in Hebrew as a table: lesson, fact, status (confirmed / changed / could not confirm), source, what was edited. Put changed facts first.
