# Data model

Schema: `supabase/schema.sql`. Apply it once in Phase 0, then manage changes as migrations under `supabase/migrations/`.

## What lives where

| Data | Location | Why |
|---|---|---|
| Lessons, quizzes, flashcards, glossary, gate question banks | Git (`content/`) | Reviewed, versioned, validated at build time |
| Learner state | Postgres, per-user RLS | Syncs across phone and desktop |
| Price bars | Postgres cache (`price_bars`) + synthetic generator in code | No client calls to data vendors |
| Screenshots | Supabase Storage bucket `journal`, path `<user_id>/<trade_id>.png`, storage policy restricting each user to their own folder | Private by default |

## Tables

| Table | One row is | Notes |
|---|---|---|
| `profiles` | a learner | Created by trigger on sign-up. Holds the weekly goal, the stage-0 learning budget and contract date, and the style chosen in stage 5. |
| `lesson_progress` | learner × lesson | `completed` only after the lesson quiz is passed. |
| `quiz_attempts` | one attempt | Lesson quizzes and stage exams (`quiz_id = 'gate-s3'`). |
| `card_state` | learner × flashcard | Leitner box 1–5. Suggested intervals: 1, 2, 4, 8, 16 days. Wrong answer → box 1. |
| `drill_attempts` | one exercise item answered | Feeds gate requirements such as "75% on 30 charts". |
| `stage_gates` | one passed requirement | A stage unlocks when all its requirements exist for stage − 1. Requirements per stage are defined in code from the curriculum. |
| `instruments` | a tradable instrument in the simulator | Spread, leverage, funding and guaranteed-stop settings. Illustrative values. |
| `sim_accounts` | a demo account | `balance` changes only through `sim_ledger`. `last_settled_at` is the settlement cursor in sim time. |
| `sim_positions` | one trade in the simulator | Open or closed. A partial close creates a closed child row. |
| `sim_orders` | a pending entry order | |
| `sim_ledger` | one balance change | Append-only. The sum of `amount` for an account equals its `balance` (the starting funds are the first ledger line); test this invariant. |
| `sim_alerts` | a price alert | The only simulator table the client writes directly. |
| `trades` | a journal entry | Backtest, simulator (`mode = 'paper'`, linked by `position_id`) and externally-executed demo trades share one table so stats work across them. `stop_price` is not nullable on purpose. `reason` is written at entry. |
| `trading_plans` | a plan version | One active version per learner. |
| `weekly_reviews` | one week | |
| `tutor_messages` | one message | Used for the daily cap and for context. |
| `price_bars` | one OHLCV bar | Written only by the server ingestion job. Readable only up to "sim now" (now − 8 weeks); the policy and `FEED_OFFSET_WEEKS` must stay equal. |

## Simulator writes

`sim_accounts`, `sim_positions`, `sim_orders` and `sim_ledger` are written only by the server engine, inside one transaction per request, over a direct Postgres connection. That connection bypasses RLS, so every engine query must filter by the authenticated user id; add a test that user B's request can never touch user A's account. Clients have select-only policies on these tables.

## Derived, not stored

Unlock state, weekly minutes, streak of weeks, expectancy, drawdown and rule adherence are computed from the tables above. Do not add columns for them. If a query becomes slow, add a view first.

## Rule adherence

`followed_plan = true` trades ÷ closed trades, over the gate window. A trade with any entry in `rule_breaks` cannot have `followed_plan = true` (enforce in the form and in a check when saving).
