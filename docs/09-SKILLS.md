# Agent skills for this project

Skills are folders with a `SKILL.md` that Claude Code loads when a task matches the skill's description. They live in `.claude/skills/` and are committed to the repo so the version is pinned.

Install: `.\scripts\install-skills.ps1` (core) or `.\scripts\install-skills.ps1 -Optional` (everything).
Each install command below was run successfully on 2026-10-04 with `npx skills add <repo> -s <skill> -a claude-code -y`.

**Precedence:** this project's docs win. Where a skill's advice conflicts with `CLAUDE.md` or `docs/` (RTL rules, content honesty, finance math in `lib/finance/`, chart direction), follow the project docs and note the conflict in `docs/DECISIONS.md`.

**Review before use.** Skills run with the agent's full permissions. Read each `SKILL.md` and any scripts it ships once after installing and again after `npx skills update`.

## Core

| Skill | Source | Publisher | Helps with | Phases |
|---|---|---|---|---|
| `supabase` | supabase/agent-skills | Supabase (official) | Auth with `@supabase/ssr` in Next.js, RLS, Realtime, Storage, migrations, debugging | 0–8 |
| `supabase-postgres-best-practices` | supabase/agent-skills | Supabase (official) | Schema changes, column types, indexes, RLS policies and their tests, simulator tables and transactions | 0–7 |
| `vercel-react-best-practices` | vercel-labs/agent-skills | Vercel (official) | React and Next.js performance: data fetching, bundle size, lazy-loading charts | 0–8 |
| `web-design-guidelines` | vercel-labs/agent-skills | Vercel (official) | UI review against interface guidelines; pairs with `rtl-a11y-reviewer` | 1–8 |
| `shadcn` | shadcn-ui/ui | shadcn (official) | Adding and composing shadcn/ui components through its CLI | 0–6 |
| `frontend-design` | anthropics/skills | Anthropic (official) | Visual direction and typography so the UI does not look templated; use with `design/` | 1–6 |
| `webapp-testing` | anthropics/skills | Anthropic (official) | Driving the local app with Playwright, screenshots, console logs — verifying widgets and the trading screens at 375px | 1–8 |
| `lightweight-charts` | tradingview/lightweight-charts | TradingView (official) | `ChartCore` and the demo trading chart: v5 API, candlestick and volume series, streaming updates, price lines, markers, panes, SSR loading, React wrapper pitfalls | 2, 6, 7 |
| `test-driven-development` | obra/superpowers | Community | Tests first for `lib/finance/` and the simulator engine (fills, margin, funding, settlement) | 2–5 |
| `verification-before-completion` | obra/superpowers | Community | Run the checks and show the output before claiming a phase is done | all |
| `systematic-debugging` | obra/superpowers | Community | Root-cause method for chart, realtime and RLS bugs | all |

## Optional

| Skill | Source | Publisher | Helps with | Note |
|---|---|---|---|---|
| `claude-api` | anthropics/skills | Anthropic (official) | The AI tutor route: current SDK usage, streaming, model ids | Install at Phase 8; about 2 MB |
| `deploy-to-vercel` | vercel-labs/agent-skills | Vercel (official) | Preview and production deploys | Phase 8 |
| `nextjs-app-router-patterns` | wshobson/agents | Community | App Router structure, server components, streaming | Check its advice against the Next.js version recorded in `docs/DECISIONS.md` |
| `wcag-audit-patterns` | wshobson/agents | Community | WCAG 2.2 audit procedure | Complements `rtl-a11y-reviewer` |
| `risk-metrics-calculation` | wshobson/agents | Community | Drawdown, Sharpe, Sortino and related formulas for the Stats screen | Portfolio-oriented reference; our vectors in `docs/04-WIDGETS.md` remain the test of truth |
| `backtesting-frameworks` | wshobson/agents | Community | Look-ahead bias, transaction costs, sample-size pitfalls for ChartReplay and lesson s5-l9 | Reference for concepts, not a library to adopt |
| `playwright-cli` | microsoft/playwright-cli | Microsoft (official) | Browser automation and Playwright tests from the CLI | Alternative to `webapp-testing`; keep one as the default |

## Not available as a skill — write our own

No published skill was found for these. Each is worth a short project skill under `.claude/skills/` once the relevant code exists (use Anthropic's `skill-creator`):

| Project skill | Content | When |
|---|---|---|
| `rtl-hebrew-ui` | The RTL/LTR rules from `CLAUDE.md` with before/after code examples from this codebase | After Phase 1 |
| `trading-sim-engine` | Order lifecycle, fill rules, margin and P&L formulas with worked examples and the test fixtures | After build phase 5, from `docs/10-SIMULATOR.md` |
| `lesson-authoring` | Already covered by `docs/03-LESSON-SPEC.md` and the `lesson-writer` / `beginner-reviewer` agents; convert to a skill only if lessons are also written outside this repo | Later, if needed |

## Maintenance

- `npx skills list` shows what is installed; `npx skills update -p` updates project skills.
- After an update, skim the diff of `.claude/skills/` before committing.
- Keep the set small. If a skill is never triggered after two phases, remove it.
