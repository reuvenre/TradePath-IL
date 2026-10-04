# Product requirements — TradePath IL

## Problem

A motivated adult with no trading background tries to learn from YouTube and gets lost: no order, no feedback, unexplained jargon, sales pitches dressed as lessons, and nothing that says "you are ready for the next step". Much of that material is also out of date.

## Goal

A single place where one learner moves through a fixed sequence, practises each idea by doing it, is tested before moving on, and ends with a written trading plan and a record of at least 60 simulated trades that followed it.

Success is measured by learner behaviour, not by trading profit:

- completes stages 0–6 (74 lessons) with every gate passed
- can size a position by hand without error
- holds a complete written trading plan
- logs 60+ demo trades in our simulator with at least 90% rule adherence

## Non-goals

- Executing real trades or connecting to a broker
- Signals, stock picks, "strategies that work"
- A live market-data feed in v1. The demo runs on real prices shifted by 8 weeks (`docs/10-SIMULATOR.md`); a live feed is an optional later phase
- Copying any broker's look, wording or branding. We match capability, with our own design
- Options, futures, crypto beyond a short orientation lesson
- English or multi-language UI (strings are centralised so it can be added later)
- A marketing site, payments, or multi-tenant admin (schema is multi-user-ready; UI is single-learner)

## The learner

Total beginner. Comfortable with software, impatient with fluff. Reads Hebrew, can read English terms. 2–3 hours a week, often on a phone. Has not chosen a trading style; the product helps choose one in stage 5.

## Core loop

```
Today screen → lesson (20–25 min) → interactive practice → 5-question quiz
            → 3–4 flashcards enter the review deck → next lesson unlocks
Each week: 2 lessons + 1 practice session + flashcard review
Each stage ends with a gate (exam + practical task). The next stage stays locked until it is passed.
```

## Features

### P1 — learning core (build phases 0–1)

| Feature | Requirement |
|---|---|
| Roadmap | Vertical map of 8 stages, modules and lessons. Shows locked / available / done, current position, and estimated weeks remaining at the learner's pace. |
| Today | One screen answering "what do I do now?": next lesson, flashcards due, weekly time goal progress, current streak of weeks (weeks, not days — the learner studies 2–3 times a week). |
| Lesson page | MDX renderer with the components in `docs/03-LESSON-SPEC.md`. Reading progress, time spent, "mark complete" only after the quiz. |
| Glossary tooltips | Every `<Term>` shows a one-sentence definition on tap/hover and links to the glossary page. The glossary page is searchable and shows where each term was taught. |
| Quiz | 5 questions per lesson, immediate explanation per answer, pass at 4/5, unlimited retries with shuffled options. |
| Flashcards | Leitner 5-box spaced repetition (`lib/srs/`). Daily due list. Self-graded: knew it / did not. |
| Stage gates | Exam drawn from the stage's question bank plus a practical task with evidence (see curriculum). Recorded in `stage_gates`. |
| Auth + progress sync | Supabase magic link. All progress is per user under RLS. |

### P2 — practice lab (build phases 2–3)

Chart engine and the stage 1–3 widgets from `docs/04-WIDGETS.md`. Each widget is usable inside a lesson and on its own from a "Lab" screen.

### P3 — becoming a trader (build phases 4–7)

| Feature | Requirement |
|---|---|
| Chart replay | Bar-by-bar replay on historical or synthetic data with hidden future, paper entries with stop and target, automatic R-multiple. Used for manual backtests in stage 5. |
| Demo trading simulator | Our own demo account at the capability level of a commercial CFD platform: streaming bid/ask, leverage and margin, market and pending orders, Close at Loss, Close at Profit, trailing and guaranteed stops, overnight funding, stop-out, plus a risk overlay tied to the learner's plan. Full spec: `docs/10-SIMULATOR.md`. |
| Journal | Every backtest and simulator trade is a journal entry: setup, reason, stop, target, emotion, followed-plan yes/no, screenshot, lesson learned. Closing a simulator position creates the entry automatically. |
| Trading plan builder | Guided form producing a versioned plan document; printable. |
| Stats | Expectancy in R, win rate, average win/loss in R, max drawdown, rule adherence, equity curve; filter by setup and mode. |
| Weekly review | Structured form each week, linked to that week's trades. |
| Style fit quiz | Scores the four trading styles against time, capital, temperament; explains the result. |

### P4 — tutor and polish (build phase 8)

| Feature | Requirement |
|---|---|
| AI tutor | "Ask about this lesson" panel. Server route calls the Anthropic API with the lesson text and the learner's known-terms list. Rules: answer in Hebrew; use only terms the learner has been taught, or define new ones inline; never recommend a security, a broker or a trade; say so when a question needs a licensed adviser or an accountant. Model id comes from `ANTHROPIC_MODEL`. Per-user daily message cap. |
| PWA | Installable, lessons readable offline, progress syncs when back online. |
| Volatile-facts banner | Lessons with `volatile: true` show "verified on <date>"; older than 90 days shows a warning to the learner and appears in `/status`. |

## Screens

Today · Roadmap · Lesson · Quiz · Flashcards · Glossary · Lab (widget index) · Chart replay · Markets · Instrument · Order ticket · Positions · Orders · History · Ledger · Alerts · Journal · Trade detail · Trading plan · Stats · Weekly review · Stage gate · Settings.

## Non-functional

- RTL throughout; charts and numbers LTR (see `CLAUDE.md`).
- Mobile first (375px); every widget must be operable by touch.
- WCAG 2.1 AA: contrast, focus order, keyboard operation, text alternatives for chart exercises where feasible. Up/down colours must not be the only signal (add shape or sign).
- Lighthouse performance 90+ on lesson pages; charts load lazily.
- No tracking beyond the learner's own progress data.

## Persistent disclaimers

Footer on every page and first line of the tutor: the product is educational, is not investment advice, and most retail traders lose money. Wording is in `docs/03-LESSON-SPEC.md`.
