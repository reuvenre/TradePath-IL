# Lesson specification

The learner has never traded and got lost in YouTube videos. Every rule here exists to keep one promise: **he never meets a word, a number or a step he was not prepared for.**

Two complete reference lessons ship with the kit. Match their depth, tone and structure:

- `content/lessons/s1-m1-l1/` — a concept lesson
- `content/lessons/s3-l4/` — a calculation lesson

## Files per lesson

```
content/lessons/<lesson-id>/
  index.mdx    lesson body with frontmatter
  quiz.json    exactly 5 questions
  cards.json   3–4 flashcards
```

Lesson ids come from `docs/02-CURRICULUM.md` (`s1-m2-l3`, `s3-l4`). Do not invent lessons or reorder them without asking.

## Frontmatter

```yaml
---
id: s1-m2-l2
title: "Bid, Ask ומרווח"
stage: 1
module: 2            # omit for stages without modules
order: 2
minutes: 20          # 15–25
objectives:          # 2–3, each starts with a verb the learner can be tested on
  - "לחשב כמה עולה המרווח בעסקה"
requires: [market, order-book, price]     # glossary ids taught in earlier lessons and used here
introduces: [bid, ask, spread, liquidity] # glossary ids taught in this lesson (4 at most)
widgets: [SpreadCalc]
volatile: false      # true when the lesson states facts that change
verified_on: "2026-10-04"                 # required when volatile
sources:                                  # at least one; primary sources preferred; use `ref` instead of `url` for a book
  - title: "..."
    url: "https://..."
    accessed: "2026-10-04"
---
```

`npm run content:validate` must fail when: a field is missing; a `<Term>` id is not in `requires` or `introduces`; a `requires` id is not introduced by an earlier lesson in curriculum order; an `introduces` id is missing from `content/glossary.json`; a widget name is not registered; `volatile: true` without `verified_on` and a source.

## Body structure

Use these Hebrew headings, in this order. Total 500–900 Hebrew words.

| Section | Heading | Content |
|---|---|---|
| 1 | `## בשורה אחת` | The whole idea in one or two sentences a 12-year-old would follow. |
| 2 | `## נתחיל ממשהו מוכר` | An everyday situation that works the same way (market stall, renting a flat, a loan from a friend, exchanging money before a flight). No finance words yet. |
| 3 | `## ועכשיו בשוק` | The same idea in market terms. Each new term wrapped in `<Term>` on first use, Hebrew then English in parentheses. |
| 4 | `## דוגמה עם מספרים` | One fully worked example. Round numbers, shekels unless the topic is forex or US stocks. Show every step of arithmetic. |
| 5 | `## נסה בעצמך` | The widget, with a one-line instruction of what to do and what to notice. |
| 6 | `## טעויות נפוצות` | 2–3 beginner misconceptions, each stated and corrected in two sentences. |
| 7 | `## סיכום` | Three sentences. No new information. |

Do not add an introduction before section 1 or a sign-off after section 7.

## MDX components

| Component | Use |
|---|---|
| `<Term id="spread">מרווח (Spread)</Term>` | First use of every glossary term in the lesson. Later uses are plain text. |
| `<Callout type="warn">` / `type="tip"` / `type="note"` | At most two per lesson. |
| `<Example>` | Wraps the worked example; renders numbers LTR. |
| `<Num>10.25</Num>` | Any price, percentage, quantity or ticker inside Hebrew text. Renders `<bdi dir="ltr">`. |
| `<Widget name="SpreadCalc" preset="lesson" />` | Widgets from `docs/04-WIDGETS.md`. |
| `<Figure src alt caption>` | Static diagram. `alt` is mandatory and in Hebrew. |
| `<Volatile verifiedOn="2026-10-04">` | Wraps a sentence that states a changeable fact; shows the date to the learner. |

## Writing rules

1. Second person singular, everyday Hebrew, sentences under 20 words. No academic tone, no hype.
2. One new idea per lesson; at most 4 new terms. If a lesson needs more, stop and propose a split.
3. Never use a trading term that is not in `requires` or `introduces`. If you need one, describe it in plain words instead ("המחיר הכי טוב שמוכר מוכן לקבל").
4. Every claim with a number has the arithmetic shown.
5. English terms appear exactly as on trading platforms (Stop-Limit, not "סטופ-לימיט" alone), because the learner will meet them there.
6. Analogies must hold. If the everyday example breaks in an important way, say where.
7. No emoji. No exclamation marks. No "בוא נצלול", "חשוב לציין", "בשורה התחתונה".
8. Gender: write in masculine singular for this learner; keep strings in files so a later variant is possible.

## Content rules (honesty and compliance)

1. No lesson says or implies that the learner is likely to profit. Where results are discussed, state the base rate (stage 0, lesson 3).
2. No recommendation of a security, broker, platform, signal service or course. Brokers and platforms may be named only as examples of a category, at least two per category, with "לא המלצה".
3. Real tickers may illustrate a concept with historical data. Never with a view on future direction.
4. Strategies are "דוגמה ללימוד מבנה", always with the conditions where they fail.
5. Backtest and paper results are never presented as a forecast.
6. Tax and regulation: general information with source and date, ending with "לפרטים שנוגעים אליך, פנה לרואה חשבון". Never compute the learner's actual tax liability.
7. Leverage, CFDs, forex and short selling are always introduced together with their specific risk.
8. Binary options are mentioned only as something banned for Israeli retail clients and a common fraud vector.

Footer disclaimer (every page), Hebrew:

> התוכן כאן לימודי בלבד ואינו ייעוץ השקעות או שיווק השקעות. מסחר כרוך בסיכון, ורוב הסוחרים הפרטיים מפסידים כסף.

## quiz.json

```json
{
  "lessonId": "s1-m2-l2",
  "questions": [
    {
      "id": "q1",
      "type": "single",
      "prompt": "…",
      "options": ["…", "…", "…", "…"],
      "answer": 1,
      "explanation": "…",
      "objective": 0
    }
  ]
}
```

- Exactly 5 questions; every objective is tested at least once.
- At least 2 questions ask the learner to apply (calculate, choose for a scenario), not recall.
- 4 options. Wrong options are mistakes a beginner would actually make, not jokes.
- `type` is `single` or `numeric` (`answer` is a number, add `"tolerance"`).
- `explanation` says why the right answer is right and why the most tempting wrong one is wrong.
- Options of similar length; the correct answer is not always the longest.

## cards.json

```json
{ "lessonId": "s1-m2-l2",
  "cards": [ { "id": "s1-m2-l2-c1", "front": "מה זה מרווח (Spread)?", "back": "ההפרש בין מחיר הקנייה למחיר המכירה באותו רגע. זו עלות שמשלמים בכל עסקה." } ] }
```

One fact per card. Front is a question. Back is at most two sentences.

## Glossary

`content/glossary.json` is the single source of truth. Seed: `content/glossary.seed.json` (copy it in Phase 1).

```json
{ "id": "spread", "he": "מרווח", "en": "Spread",
  "short": "ההפרש בין מחיר הקנייה למחיר המכירה באותו רגע.",
  "introducedIn": "s1-m2-l2" }
```

`short` is one sentence that uses no other glossary term unless that term was introduced earlier.

## Review pipeline (run by `/new-lesson`)

1. `lesson-writer` drafts `index.mdx` and adds glossary entries.
2. `quiz-author` writes `quiz.json` and `cards.json`.
3. `beginner-reviewer` reads as the learner and returns every point of confusion. Fix and re-review until it returns PASS.
4. `fact-checker` runs when `volatile: true` or when the lesson cites statistics.
5. `npm run content:validate`.
