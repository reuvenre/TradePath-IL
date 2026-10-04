---
description: Build one interactive widget from docs/04-WIDGETS.md
argument-hint: <WidgetName>
---

Build the widget $ARGUMENTS.

1. Read its row and engine in `docs/04-WIDGETS.md`. If it is not listed, stop and ask.
2. If it needs a function in `lib/finance/` or `lib/market/`, write that function and its tests first, including the vectors from the doc.
3. Have the `widget-builder` subagent implement it on the correct engine, register it for `<Widget name="…">`, add it to the Lab index, and add a `lesson` preset.
4. Verify its "Accept when" condition and the shared requirements (375px, touch, reset, Hebrew instruction line, reasoning shown with the result).
5. Run the `rtl-a11y-reviewer` subagent on it.
6. Report in Hebrew with steps for Reuven to try it.
