# Decisions

Every non-obvious technical choice: date, decision, why, alternatives rejected.

## 2026-10-04 — Phase 0

### Versions at scaffold time
Next.js 16.3.8 (App Router, Turbopack), React 19.2.8, TypeScript 5 `strict`, Tailwind CSS 4, shadcn CLI 4.21 (style `base-nova`, Base UI primitives, `rtl: true`), `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.117, Vitest 5.0, Playwright 1.63, Node 24.

Next.js 16 differs from older tutorials. `AGENTS.md` (written by `create-next-app`, re-added by `next dev`) tells agents to read `node_modules/next/dist/docs/` before writing Next code. Keep it.

### `proxy.ts`, not `middleware.ts`
Next.js 16 renamed Middleware to Proxy. Session refresh and the signed-out redirect live in `proxy.ts` → `lib/supabase/proxy.ts`. The proxy is an optimistic check; `app/(app)/layout.tsx` repeats it with `auth.getUser()` and is the authoritative one.

### Learner pages are always dynamic
`app/(app)/layout.tsx` sets `dynamic = "force-dynamic"`. Without it, a build with no Supabase env prerendered `/` as a static redirect. Rejected: relying on `cookies()` being called, which depends on env being present at build time.

### The app boots without Supabase keys
`lib/supabase/env.ts` exposes `isSupabaseConfigured`. With no keys every request is treated as signed out and the sign-in form shows a Hebrew "not connected" message. Why: `build` and the e2e smoke tests must pass on a fresh clone and in CI without secrets.

### Magic-link callback accepts both link shapes
`app/auth/callback/route.ts` handles `?code=` (PKCE, the default e-mail template) and `?token_hash=&type=` (custom template). Rejected: supporting only one, which breaks when the Supabase e-mail template is edited.

### RTL
`<html lang="he" dir="rtl">`, shadcn initialised with `--rtl` (components use logical classes). Only logical utilities (`ms-`, `pe-`, `start`, `inset-x-`) in our code. Latin runs inside Hebrew (`TradePath IL`, e-mail input) use `<bdi dir="ltr">` / `dir="ltr"`.

### Font: Heebo via `next/font/google`
Self-hosted at build, Hebrew + Latin subsets in one family so English trading terms inside Hebrew sentences match, good numerals. Fallback stack: `"Arial Hebrew", "Noto Sans Hebrew", Arial, system-ui, sans-serif`. Revisit when `design/` exists. Rejected: Geist (no Hebrew), Assistant and Rubik (kept as candidates for the design pass).

### Theme
`next-themes` with the `class` attribute, default `system`. Colours are the shadcn neutral tokens until `design/` provides tokens; there is no `design/` folder yet.

### User-facing strings in `lib/strings/he.ts`
PRD: strings are centralised so another language or a feminine variant can be added. Rejected for now: an i18n library (one language, no need).

### `cn` package
The current shadcn CLI generates `import { cn } from "cn"` (package `cn`, repo `shadcn-ui/cn`, a compiled replacement for `clsx` + `tailwind-merge`). Kept as generated; `lib/utils.ts` re-exports it.

### MDX pipeline (decided, installed in Phase 1)
Lessons stay as files in `content/lessons/<id>/index.mdx`, outside `app/`. Load them with a small loader in `lib/content/`: `gray-matter` for frontmatter → zod validation → `next-mdx-remote/rsc` (`compileMDX`) rendered in a Server Component with our component map (`Term`, `Callout`, `Example`, `Num`, `Figure`, `Volatile`, `Widget`).
Why: content is data that must be validated, graph-checked and unlocked per learner before rendering, and the same loader feeds `content:validate`.
Rejected: `@next/mdx` (treats MDX as routes/imports; frontmatter and per-lesson gating are awkward), Contentlayer (unmaintained), Velite (extra build step for 74 files).
Check at install time that `next-mdx-remote` supports React 19.2 / Next 16; fallback is `@mdx-js/mdx` `evaluate` directly.

### Tests
- Vitest, `node` environment, files in `lib/**/*.test.ts` and `tests/**/*.test.ts`. Config is `vitest.config.mts` (ESM; avoids a Vite loader warning).
- `tests/rls.test.ts` is an integration test against the real Supabase project (two users created with the service role, then signed in with the anon key). It is skipped when `.env.local` has no keys. It uses `@example.com` addresses and deletes the users afterwards.
- Playwright runs the dev server on port 3100 at two viewports: 375 and 1280.
- `app/dev/shell` is a development-only preview of the signed-in shell (404 in production, public only when `NODE_ENV !== "production"`). It exists so the shell can be tested and screenshotted without a session. It shows no user data.

### `content:validate` is a placeholder in Phase 0
It only checks that each lesson folder has its three files. The real validator is Phase 1 work per `docs/06-BUILD-PLAN.md`.

### `@types/node` 24
Vitest 5 requires `@types/node` 22 or 24+; the scaffold shipped 20.

### Removed duplicate docs
`TradePath-IL-curriculum.md` (older than `docs/02-CURRICULUM.md`) and `TradePath-IL-simulator-spec.md` (identical to `docs/10-SIMULATOR.md`) were removed from the repo root. `docs/` is canonical.

### Supabase project
Hosted project "TradePath IL", ref `weicsmgvsxbwgfprowmf`, region `eu-central-1` (Frankfurt, closest common region to Israel), free plan. `supabase/schema.sql` was applied as migration `initial_schema`. The free plan allows two active projects, so the unused "WhatsApp CRM" project was paused to make room.

### `handle_new_user()` is not executable by API roles
Supabase's security advisor flagged the `SECURITY DEFINER` sign-up trigger function as callable by `anon` and `authenticated`. `EXECUTE` is revoked from `public`, `anon` and `authenticated` (migration `20261004130000_revoke_handle_new_user_execute.sql`, also folded into `schema.sql` for fresh installs). The trigger still fires.

### Skills
`scripts/install-skills.ps1` was not run in Phase 0; `.claude/skills/` does not exist yet. Reuven should run it and review each `SKILL.md` (see `docs/09-SKILLS.md`).

### Playwright uses the preinstalled Chromium in cloud sessions
Claude cloud sessions ship Chromium at `/opt/pw-browsers/chromium` and block `playwright install`; its build does not match the headless shell the pinned `@playwright/test` expects. `playwright.config.ts` points `launchOptions.executablePath` at that binary only when it exists (or at `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` if set), so local Windows runs are unchanged. Alternative rejected: pinning `@playwright/test` to the preinstalled build, which would drift as the cloud image updates.

## 2026-10-04 — Phase 1

### `"type": "module"` in package.json
`content:validate` runs `lib/content/validate.ts` through `tsx`. Without `"type": "module"` tsx compiled the `.ts` files to CommonJS and `require()` of the ESM-only `@mdx-js/mdx` chain (`estree-walker`) failed. The whole package is now ESM; Next, Vitest, Playwright and ESLint all run unchanged. Rejected: Node's built-in type stripping (needs `.ts` extensions in every relative import), renaming `lib/content` to `.mts`.

### MDX pipeline as decided
`gray-matter` → zod (`lib/content/schemas.ts`) → `next-mdx-remote/rsc` 6.0 (`compileMDX`, peer `react >= 16`, works with React 19.2) with `remark-gfm` for the tables in the reference lessons. The validator parses the same MDX with `@mdx-js/mdx` and a remark plugin that collects JSX elements and headings (`lib/content/mdx-analysis.ts`), so a lesson that compiles for the page is the lesson the validator checked.

### Arithmetic is wrapped LTR automatically
In an RTL paragraph the bidi algorithm reverses `100 × 10.10 = 1,010`. `lib/content/remark-ltr-math.ts` wraps every arithmetic run (two or more numbers joined by operators) in `<Num>` at compile time; `components/lesson/ltr-text.tsx` does the same for quiz, card and exercise strings. Single numbers stay as the author wrote them (`<Num>` by hand, per the spec). Rejected: asking authors to wrap every expression by hand (the reference lessons do not).

### The curriculum is code
`lib/content/curriculum.ts` holds all 74 lessons, stage goals, weeks and gate requirements from `docs/02-CURRICULUM.md`. Lesson files are checked against it (id, stage, module, order, ⏱ flag). The roadmap shows unwritten lessons as "עוד לא נכתב"; unlock rules in `lib/learner/unlock.ts` are pure and unit-tested. Gate requirements that later phases deliver (chart drill, hand sizing, strategy card…) are `kind: "later"` with the phase number, so the gate screen already shows the full checklist.

### Exercise presets are JSON files
`<Widget name="Sort" preset="s0-l2-trader-or-investor" />` reads `content/exercises/<preset>.json` (zod discriminated union over Sort, Match, TrueFalse, GuessReveal, ScenarioChoice). The validator checks that the preset exists, has the right type and belongs to the lesson. Rejected: inline JSX props in the MDX (unreadable for authors, unvalidatable).

### Validator rules beyond the spec list
Also errors: the seven body headings in order; `introduces` terms not wrapped in `<Term>`; `widgets` and `<Widget>` usage out of sync; more than two callouts; `<Figure>` without alt; `<Volatile>` in a non-volatile lesson; `Callout type` outside warn/tip/note. Word count 500–900 is a warning only (both reference lessons are under 500 by this count). Fixtures: `tests/fixtures/content-broken/`.

### Leitner details
Intervals 1, 2, 4, 8, 16 days for boxes 1–5. A new card enters box 1 **due today** so it is reviewed in the same session the lesson was completed. Wrong → box 1, due tomorrow, `lapses + 1`. Dates are `YYYY-MM-DD` strings in the learner's calendar: the client sends its local date, the server never guesses a time zone. Calendar statistics computed on the server (week of the weekly goal, streak) use `Asia/Jerusalem`; weeks start on Sunday.

### Quiz and exam scoring is server-side
The client shows instant feedback from the quiz JSON it already has, but `submitLessonQuiz` and `submitGateExam` re-score on the server from the content files, write `quiz_attempts`, and only then mark `lesson_progress.completed` / `stage_gates`. The stage exam bank (`lib/learner/bank.ts`) is `server-only`; the page sends the client a draw without answers, seeded by the attempt count so each retry differs.

### Weeks remaining
`estimateWeeksLeft`: remaining lesson minutes × (110 ÷ 50), divided by the learner's weekly goal (a typical 110-minute week holds 50 minutes of lessons). Unwritten lessons count 20 minutes.

### Gate evidence upload uses the `journal` bucket
Migration `20261004160000_journal_bucket.sql` creates the private bucket from `docs/05-DATA-MODEL.md` with per-user folder policies (first path segment = `auth.uid()`), 5 MB, PNG/JPEG/WebP. Gate screenshots go to `<user_id>/gates/s<stage>/…`; journal trades will use `<user_id>/<trade_id>.png`. The server action records only paths inside the caller's own folder.

### Stage 0 glossary terms
Stage 0 introduces nine everyday-level terms (`asset`, `trader`, `investor`, `day-trading`, `emergency-fund`, `learning-budget`, `trading-arena`, `binary-options`, `signal-group`) so later lessons can say "סוחר" without re-explaining. `content/glossary.json` was created from the seed plus these.

### Stage 0 content review
Five lessons went through fact-checker → lesson-writer → quiz-author → beginner-reviewer (two rounds each). The fact-checker could not open any primary page from this cloud session (network policy): s0-l3 figures were cross-checked from search extracts of the primary papers; s0-l5 regulatory facts are stated in general terms only. Both still need one read of the source URLs from Reuven's machine (listed in the phase report). s0-l3 is `volatile: true` because of the ESMA disclosure rule.

### Dev previews instead of `/dev/shell`
`app/dev/*` renders every Phase 1 screen with fixed mock state (`app/dev/mock.ts`, `?scenario=`), 404 in production. The Playwright suite runs against them; the signed-in routes are covered by unit tests of the pure logic and by hand.

### UI primitives written by hand
`ui.shadcn.com` is blocked by the cloud network policy, so `popover`, `progress`, `badge` and `textarea` were written directly on Base UI / Tailwind in the same style as the generated components. They can be replaced by `npx shadcn add` later.

### RTL review outcomes
`rtl-a11y-reviewer` rendered all Phase 1 screens at 375/1280 in both themes. Fixed from its report: the arithmetic regex no longer swallows the Hebrew prefix hyphen (`ב-10.10`) or a label colon before a line break, and `:` counts as an operator only inside a ratio (`1:10`); Hebrew units stay outside the LTR number island; whole Hebrew sentences are never wrapped in `<bdi dir="ltr">`; a wrong quiz answer uses a darker red (AA in light theme); stale-fact badges carry text, not only colour; `Button` sets `nativeButton={false}` when it renders a link. The glossary and source links inside running text stay inline (18px tall) under the inline-text exception.
