# Design brief — paste into Claude Design

Design a Hebrew (RTL) web app called **TradePath IL**: a step-by-step course that teaches a complete beginner to trade stocks and currencies. Mobile first (375px), with desktop layouts (1280px). Light and dark themes.

## Who it is for

An adult professional who has never traded and felt lost in YouTube tutorials. He studies in short sessions, two or three times a week, often on his phone. He wants to know exactly what to do next and to feel that each step is small.

## What it must feel like

A calm study tool. Closer to a language-learning app or a well-made textbook than to a trading terminal.

- Not a casino: no flashing prices, no confetti for "wins", no red/green everywhere, no rockets or bulls.
- Not a bank: no stock photos, no navy-and-gold.
- Dense information only where the learner asked for it (charts, stats, the demo trading screens). Lessons are spacious, with one clear action per screen.
- The demo trading screens should feel as capable and as fast as a commercial trading platform, in our own visual language. Do not imitate any broker's branding, layout or wording. Keep them calm: live prices update without flashing, profit is not celebrated.

## Constraints

- Everything is RTL **except** charts, prices, percentages, tickers and currency pairs, which stay LTR. Show this in the lesson and chart screens.
- Rising and falling candles must differ by more than colour (hollow vs solid).
- Hebrew typeface with good numerals and a matching Latin for English terms; English trading terms appear inline in Hebrew sentences constantly, so the pairing matters.
- WCAG AA contrast in both themes. Touch targets 44px.
- A one-line disclaimer sits in the footer of every screen; design it so it is readable and not alarming.

## Screens to design

1. **Today** — next lesson card, flashcards due, weekly time goal, weeks-in-a-row streak.
2. **Roadmap** — 8 stages as a vertical path; modules and lessons inside; locked, available, done; a gate marker at the end of each stage.
3. **Lesson** — reading view with: glossary term with tooltip open, a worked-example block with numbers, an embedded interactive widget, a warning callout, a "verified on <date>" tag, progress, and the quiz entry button.
4. **Quiz** — one question, four options, the state after answering with the explanation.
5. **Flashcards** — front, back, "knew it / didn't".
6. **Widget: position size calculator** — inputs, result, and the arithmetic written out step by step.
7. **Widget: chart drill** — a candlestick chart where the learner draws a support line, and the scored result with the model answer overlaid.
8. **Chart replay** — chart with hidden future, next-bar control, order ticket with mandatory stop.
9. **Journal** — list of trades and a trade entry form (reason, stop, emotion, followed-plan).
10. **Stats** — expectancy in R, win rate, drawdown, rule adherence, equity curve.
11. **Stage gate** — exam score plus practical task checklist, and the locked/unlocked state.
12. **Glossary** — searchable term list.
13. **Markets** — instrument list by class with live buy and sell prices, daily change, open/closed state, favourites, search. Permanent label: "שוק סימולציה · מחירי אמת בהשהיה של 8 שבועות".
14. **Instrument** — candlestick chart with the current price line and draggable lines for an open position's entry, Close at Loss and Close at Profit; instrument facts; large Buy and Sell buttons showing the two prices.
15. **Order ticket** — market or pending order; quantity with a "risk 1%" helper; Close at Loss (required), Close at Profit, trailing, guaranteed; a live summary of margin and of the loss at the stop in money, percent of equity and R; plan-check warnings; reason field.
16. **Positions, Orders, History** — three tabs; live profit and loss in money and in R; edit, partial close, close.
17. **Account bar** — Equity, Available, open P&L and a margin-level meter, visible on every trading screen.

## Components to define

Buttons, cards, term tooltip, callouts (note, tip, warning), number chip (LTR), progress ring, stage/lesson node (three states), quiz option (four states), form fields, bottom navigation, chart container with attribution line, price button (buy/sell with live price), account bar, margin meter, position row, order ticket summary.

## Sample content (use real Hebrew, not lorem ipsum)

- Lesson title: "מה זה שוק ומי קובע את המחיר"
- Term tooltip: "ספר פקודות (Order Book) — הרשימה של כל מי שמחכה לקנות או למכור, ובאיזה מחיר."
- Callout: "המחיר שאתה רואה על המסך הוא של העסקה האחרונה. הוא לא בהכרח המחיר שתקבל."
- Calculator result: "כמות: 100 מניות. סכום בסיכון: 200 ₪."
- Footer: "התוכן כאן לימודי בלבד ואינו ייעוץ השקעות. מסחר כרוך בסיכון, ורוב הסוחרים הפרטיים מפסידים כסף."

## Deliver

Design tokens (colour, type scale, spacing, radius) for both themes, the component set, and the 17 screens at mobile width plus Today, Lesson, Chart replay, Instrument with order ticket, and Stats at desktop width. Export to a `design/` folder the developer agent can read.
