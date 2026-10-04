# TradePath IL — project memory

Hebrew-first (RTL) interactive learning platform that takes a complete beginner to a disciplined, plan-driven trader of stocks and forex. The owner and first learner is Reuven: an experienced IT/automation professional who has never traded. He studies 2–3 hours a week.

**Education only.** No brokerage integration, no real-money execution, no buy/sell recommendations, no promises of profit. Trading practice happens in our own demo simulator on real prices shifted by 8 weeks.

## Read before working

| Doc | Read when |
|---|---|
| `docs/01-PRD.md` | Always, once per session |
| `docs/06-BUILD-PLAN.md` | Building any phase |
| `docs/02-CURRICULUM.md` + `docs/03-LESSON-SPEC.md` | Writing or reviewing content |
| `docs/04-WIDGETS.md` | Building interactive components or finance math |
| `docs/05-DATA-MODEL.md` + `supabase/schema.sql` | Touching the database |
| `docs/07-DESIGN-BRIEF.md` + `design/` (if present) | Building UI |
| `docs/08-SOURCES.md` | Any fact about markets, tax, regulation |
| `docs/10-SIMULATOR.md` | Anything about the demo account, price feed, orders, margin |
| `docs/09-SKILLS.md` | Once, to know which skills are installed and when project docs override them |

Record every non-obvious technical choice in `docs/DECISIONS.md` (create it in Phase 0): date, decision, why, alternatives rejected.

## Stack

- Next.js App Router, TypeScript `strict`. Use the current stable release at scaffold time and record the version in `docs/DECISIONS.md`.
- Tailwind CSS + shadcn/ui, configured for RTL (logical properties: `ms-`, `me-`, `ps-`, `pe-`, `start`, `end`; never `left`/`right`).
- Supabase: Postgres, Auth (email magic link), Row Level Security on every table.
- Lessons: MDX files in `content/lessons/<lesson-id>/`, validated with zod at build time.
- Charts: `lightweight-charts` (TradingView). Apache-2.0; the TradingView attribution must stay visible.
- Tests: Vitest for unit tests, Playwright for smoke e2e.
- Deploy: Vercel.

## Layout

```
app/                  routes (learner UI)
components/ui/        shadcn primitives
components/lesson/    lesson renderer, Term tooltip, Quiz, Callout
components/widgets/   one folder per widget from docs/04-WIDGETS.md
lib/finance/          pure functions for all trading math + tests
lib/market/           synthetic bar generator, data provider adapter
lib/sim/feed.ts       deterministic ticks from minute bars (shared by server and client)
lib/sim/engine/       pure order, margin, funding and settlement logic + fixtures
lib/sim/store/        transaction layer applying engine events to Postgres
lib/content/          MDX loading, zod schemas, prerequisite graph
lib/srs/              flashcard scheduling
content/lessons/      <lesson-id>/index.mdx, quiz.json, cards.json
content/glossary.json single source of truth for terms
supabase/             schema.sql, migrations
```

## Rules that are easy to get wrong

1. **Charts are always LTR.** Time runs left to right even though the page is RTL. Wrap every chart in `dir="ltr"`. Prices, percentages, tickers and currency pairs render inside `<bdi dir="ltr">`.
2. **All trading math lives in `lib/finance/` as pure, unit-tested functions.** Components never compute. Every function must pass the test vectors in `docs/04-WIDGETS.md` before any widget uses it. Use decimal-safe arithmetic for money (integer minor units or a decimal library), not raw floats.
3. **No term before it is taught.** A lesson may only use glossary terms listed in its `requires` (taught earlier) or `introduces` (taught here). `npm run content:validate` enforces this and must pass.
4. **Volatile facts are tagged.** Anything that can change (tax rates, regulation, trading hours, broker rules, fees) goes in a lesson with `volatile: true`, a `verified_on` date and a source URL. Verify by web search before writing; do not rely on training knowledge. Much online material about these topics is out of date (see `docs/08-SOURCES.md`).
5. **User-facing text is Hebrew.** Plain, short sentences, second person singular. On first use a term appears as Hebrew followed by the English term in parentheses, because trading platforms are in English. Code, comments, commit messages and docs for developers are English.
6. **Secrets stay on the server.** Market-data and Anthropic keys are used only in route handlers or server actions. The client never calls a third-party API directly.
7. **RLS on everything.** Every query for user data goes through the user's session. The service role key is used only for the price cache job.
8. **The simulator engine is pure and server-authoritative.** `lib/sim/engine/` has no I/O and is fully covered by the vectors in `docs/10-SIMULATOR.md`. Only the server writes simulator tables, always after `settle`, always in one transaction, always filtered by the authenticated user id (the direct connection bypasses RLS). The client animates prices but never decides a fill.
9. **Match capability, not appearance.** The demo should feel as capable as a commercial CFD platform. Never copy a broker's branding, layout or wording.
10. **Content honesty.** No lesson, widget, tutor reply or UI string may imply that trading profits are likely, name a security as a buy or sell, or present backtest results as a forecast. See "Content rules" in `docs/03-LESSON-SPEC.md`.

## Commands

```
npm run dev
npm run lint
npm run typecheck
npm run test              # Vitest
npm run test:e2e          # Playwright
npm run content:validate  # schema + prerequisite graph + glossary coverage
npm run build
```

Create these scripts in Phase 0.

## Definition of done (every change)

- `lint`, `typecheck`, `test`, `content:validate` and `build` pass.
- New UI checked at 375px and 1280px width, in RTL, in light and dark theme.
- New finance math has unit tests including the vectors from `docs/04-WIDGETS.md`.
- New lesson passed `beginner-reviewer`, and `fact-checker` if `volatile: true`.
- Report to Reuven in Hebrew: what changed, what was verified and how, what he should check by hand.

## Working style

- One phase at a time. Stop at the end of a phase and report; do not start the next one unprompted.
- If the docs conflict with each other, or a decision would be expensive to undo (schema change, new paid service, new dependency over ~50 kB client-side), ask before proceeding. Otherwise decide, record it in `docs/DECISIONS.md`, and continue.
- Slash commands live in `.claude/commands/`, subagents in `.claude/agents/`, skills in `.claude/skills/` (installed by `scripts/install-skills.ps1`). Where a skill conflicts with this file or `docs/`, the project docs win.
