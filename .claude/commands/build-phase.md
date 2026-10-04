---
description: Build one phase from docs/06-BUILD-PLAN.md, verify it, then stop and report in Hebrew
argument-hint: <phase number 0-8>
---

Build phase $ARGUMENTS of TradePath IL.

1. Read `CLAUDE.md`, the section for phase $ARGUMENTS in `docs/06-BUILD-PLAN.md`, and every doc that section depends on. If `design/` exists, read the relevant screens.
2. Confirm the previous phase's acceptance criteria still pass. If not, fix that first and say so.
3. Post a short plan: files to create or change, and any question that blocks the phase. Ask blocking questions and wait. Otherwise proceed without waiting.
4. Implement. Finance math goes in `lib/finance/` with tests before any widget uses it. Delegate individual widgets to the `widget-builder` subagent when several are independent.
5. Verify: run `lint`, `typecheck`, `test`, `content:validate`, `build`, and `test:e2e` where it applies. Then go through the phase's "Accept when" list one item at a time and state how each was checked.
6. Run the `rtl-a11y-reviewer` subagent on the UI you changed and fix what it finds.
7. Record decisions in `docs/DECISIONS.md`.
8. Report to Reuven in Hebrew:
   - what was built
   - each acceptance item: passed, failed, or not checkable by you (and why)
   - what he should check by hand, with exact steps
   - anything you did differently from the docs
9. Stop. Do not begin the next phase.
