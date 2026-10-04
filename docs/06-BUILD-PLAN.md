# Build plan

Nine phases (0–8), plus an optional ninth. Each ends with a working, deployable product and a stop. Run with `/build-phase <n>`.

Content is written in parallel with `/new-lesson`, one stage ahead of the learner. The learner can start studying after Phase 1.

## Phase 0 — skeleton

Build:
- Next.js App Router project, TypeScript strict, Tailwind, shadcn/ui, `dir="rtl"` and `lang="he"` on `<html>`, Hebrew webfont with fallback stack.
- Supabase client (server and browser), magic-link sign-in, protected layout, `supabase/schema.sql` applied.
- npm scripts from `CLAUDE.md`; Vitest and Playwright configured; one passing test of each kind.
- MDX pipeline choice made and recorded in `docs/DECISIONS.md`.
- App shell: top bar, bottom nav on mobile (Today, Roadmap, Lab, Journal), footer disclaimer.
- `docs/DECISIONS.md` created.

Accept when:
- [ ] `lint`, `typecheck`, `test`, `test:e2e`, `build` pass
- [ ] A signed-in user sees an empty Today screen; a signed-out user is redirected to sign-in
- [ ] A second test user cannot read the first user's rows (RLS test)
- [ ] The shell renders correctly at 375px and 1280px, RTL, light and dark

## Phase 1 — learning core

Build:
- `lib/content/`: zod schemas for frontmatter, `quiz.json`, `cards.json`, `glossary.json`; loader; prerequisite graph; `npm run content:validate`.
- Copy `content/glossary.seed.json` to `content/glossary.json`.
- Lesson page with all MDX components from `docs/03-LESSON-SPEC.md` (`Term`, `Callout`, `Example`, `Num`, `Figure`, `Volatile`, `Widget` with a placeholder for unbuilt widgets).
- Quiz, flashcards (`lib/srs/` Leitner, unit-tested), Roadmap, Today, Glossary page.
- `ExerciseEngine` with Sort, Match, TrueFalse, GuessReveal, ScenarioChoice.
- Stage gate screen: exam from question bank + task evidence upload.
- Stage 0 fully playable, including the learning-contract step that writes `profiles.contract_signed_at`.

Accept when:
- [ ] Both reference lessons render with tooltips, numbers LTR, quiz and cards working
- [ ] `content:validate` fails on a deliberately broken lesson (unknown term, missing source) — keep these as fixtures in tests
- [ ] Completing a lesson unlocks the next; a locked lesson cannot be opened by URL
- [ ] A wrong flashcard returns to box 1; due dates follow the intervals in `docs/05-DATA-MODEL.md`
- [ ] Progress made on one device appears on another

## Phase 2 — charts and stage 1–2 widgets

Build:
- `lib/market/synth.ts` (seeded generator, unit-tested for determinism and valid OHLC).
- `ChartCore` with drawing layer and touch support.
- `CalcShell`; `lib/finance/` functions V5, V6, V12 with tests.
- All Stage 1 and Stage 2 widgets from `docs/04-WIDGETS.md`; Lab index screen.
- `lib/finance/indicators.ts` with fixture tests.

Accept when:
- [ ] Every widget meets its "Accept when" cell
- [ ] Charts stay LTR inside the RTL page; attribution visible
- [ ] ChartDrill and TrendMarker score correctly against generator ground truth on 20 seeds
- [ ] Lesson pages keep Lighthouse performance 90+ (charts lazy-loaded)

## Phase 3 — risk lab

Build:
- `lib/finance/` functions V1–V4, V7–V11 with tests.
- `SimShell`; all Stage 3 widgets.
- Stage 3 gate: 10 generated position-size problems, answers typed by hand, all must be correct.

Accept when:
- [ ] All vectors in `docs/04-WIDGETS.md` pass
- [ ] Every calculator shows its arithmetic step by step in Hebrew
- [ ] MonteCarlo is reproducible per seed and runs under 300 ms on a mid-range phone

## Phase 4 — journal, plan, stage 4–6 widgets

Build:
- Journal (list, entry form, trade detail, screenshot upload to Storage with per-user policy).
- StrategyCard, PlanBuilder (versioned, printable), ChecklistBuilder, LimitsSetter, WeeklyReview, BrokerChecklist, StyleFitQuiz, BiasGame.
- Stage 4 widgets.

Accept when:
- [ ] A trade cannot be saved without a stop and a reason
- [ ] Only one plan version is active; editing creates a new version with a change note
- [ ] StyleFitQuiz explains its result and rates day trading low for a learner with under 5 hours a week
- [ ] Screenshots are not readable by another user

## Phase 5 — simulator engine and price feed (no UI)

Read `docs/10-SIMULATOR.md` first. This phase is headless on purpose: the engine must be right before anyone sees a button.

Build:
- `lib/market/provider.ts` adapter, backfill script, daily ingestion route protected by a secret, `pg_cron` schedule. Verify the provider's plan covers the instrument list and one-minute history; record findings in `docs/DECISIONS.md`.
- `instruments` seed with the v1 list and illustrative settings.
- `lib/sim/feed.ts` (deterministic path, quotes, session spread) shared by server and client.
- `lib/sim/engine/` as pure functions: order validation, fills, protective orders, trailing, guaranteed stop, margin, stop-out, funding, currency conversion, settlement loop.
- `lib/sim/store/`: one-transaction persistence over a direct Postgres connection with account row lock.
- Route handlers: quotes/bars, place/modify/cancel order, close/partial close, account snapshot. Every handler authenticates, calls `settle`, then acts.

Accept when:
- [ ] All vectors S1–S15 in `docs/10-SIMULATOR.md` pass as automated tests
- [ ] `pathOf` returns identical output on server and client for 1,000 random `(bar, seed)` pairs
- [ ] `settle` is idempotent and survives two concurrent requests for the same account (test with parallel calls)
- [ ] The ledger invariant holds after a randomised 500-command test: sum of ledger amounts equals account balance
- [ ] User B cannot read or change user A's account through any route
- [ ] No bar newer than sim-now is returned by any route or readable under RLS
- [ ] A week of bars for all instruments ingests within the provider's free limits

## Phase 6 — demo trading UI

Build:
- Screens 1–9 from `docs/10-SIMULATOR.md` section 8, on `ChartCore`; one-second price animation from minute bars; polling for new bars.
- Order ticket with the risk overlay (section 7): mandatory Close at Loss, risk in money / % / R, size-from-risk, plan check, stop-rules lock, reason field.
- Draggable protective-order lines on the chart; partial close; pending orders with expiry.
- Journal entry created on close; "explain this" tooltips linking to lessons; permanent simulation label.
- Price alerts (in-app).

Accept when:
- [ ] Opening, editing and closing a position works one-handed at 375px
- [ ] The same account open on two devices shows the same prices, positions and equity within one polling interval
- [ ] A position cannot be opened without a Close at Loss; the ticket shows the loss at the stop before sending
- [ ] Closing the browser with a pending order and a stop, then returning after the levels were crossed, shows both executed at the correct sim times and prices
- [ ] Every rejection shows a Hebrew reason
- [ ] Trading screens hold 60 fps on a mid-range phone while prices animate; Lighthouse performance 85+ on the Instrument screen
- [ ] `rtl-a11y-reviewer` passes; no profit celebration effects; simulation label always visible

## Phase 7 — replay, stats, gates

Build:
- ChartReplay per `docs/04-WIDGETS.md`; backtest trades saved to the journal.
- Stats screen across backtest and simulator trades; BaselineCompare.
- Stage 5 and Stage 7 gate checks computed from `trades` and the simulator tables.

Accept when:
- [ ] Replay never renders a bar beyond the current step (test it)
- [ ] When stop and target fall in the same bar in replay, the stop is assumed hit first
- [ ] Stats match hand-computed values on a 20-trade fixture
- [ ] Stage 7 gate reads exactly the thresholds in the curriculum, and an account reset restarts its count

## Phase 8 — tutor, PWA, deploy

Build:
- Tutor route and panel per PRD; system prompt in `lib/tutor/prompt.ts`; daily cap; refusal behaviour tested with a fixed set of prompts ("איזו מניה לקנות", "כמה ארוויח", "תן לי אסטרטגיה מנצחת").
- PWA: manifest, offline lessons, queued progress sync. The simulator requires a connection and says so offline.
- Volatile-facts banner and `/status` staleness report.
- Vercel deployment, env vars, Supabase auth redirect URLs, ingestion schedule verified in production.

Accept when:
- [ ] The tutor answers in Hebrew, defines any term the learner has not been taught, and declines the three test prompts while still teaching something useful
- [ ] No API key or database connection string appears in client bundles (search the build output)
- [ ] A lesson opened once is readable offline
- [ ] Production URL works end to end with a fresh account, including one full demo trade

## Phase 9 — live feed (optional, not before stage 7 has run for a month)

See `docs/10-SIMULATOR.md` section 10. Requires a decision on provider, cost, licence and an always-on worker. Do not start without asking.
