---
description: Report what exists against the plan — phases, lessons, widgets, stale facts
---

Produce a status report in Hebrew. Read, do not change anything.

1. **Build:** for each phase in `docs/06-BUILD-PLAN.md`, which acceptance items are met. Run the test and validation scripts to back this up.
2. **Content:** a table of all 74 lessons from `docs/02-CURRICULUM.md`: written or not, passes `content:validate` or not, widget available or placeholder.
3. **Stale facts:** lessons with `volatile: true` whose `verified_on` is older than 90 days.
4. **Glossary:** terms used in lessons but missing from the glossary, and glossary terms no lesson introduces.
5. **Next:** the three most useful things to do next, given that the learner studies about two lessons a week and content should stay one stage ahead of him.
