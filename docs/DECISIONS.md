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

### Skills
`scripts/install-skills.ps1` was not run in Phase 0; `.claude/skills/` does not exist yet. Reuven should run it and review each `SKILL.md` (see `docs/09-SKILLS.md`).
