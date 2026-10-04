# Demo trading simulator

The learner practises in **our own demo account**, built to the capability level of a commercial CFD platform such as Plus500: streaming two-sided prices, leverage and margin, pending orders, protective orders including trailing and guaranteed stops, overnight funding, automatic stop-out, and a clean trading UI.

Match the capability, not the look. Do not copy any broker's branding, layout, wording or visual identity. Design comes from `docs/07-DESIGN-BRIEF.md`.

This document supersedes the "Paper trading" row in `docs/01-PRD.md` and the "No real-time data" statement in earlier versions of the docs.

## 1. Decision: where prices come from

**Chosen: a shifted-market feed.** The simulator shows real market prices from a fixed number of weeks ago, minute by minute, as if they were happening now. The architecture leaves a slot for a live feed later (section 10).

```
simTime = now − FEED_OFFSET        FEED_OFFSET = 8 weeks (whole weeks, so weekdays and sessions line up)
```

Why this and not a live feed:

| Reason | Detail |
|---|---|
| No always-on server | Because every past and "future" sim price is already stored, the server can work out exactly when a stop, limit, trailing stop or margin stop-out would have triggered while the learner was offline. A live feed needs a process holding a WebSocket open around the clock, which does not fit Vercel functions and adds hosting and operations. |
| Testable engine | Fills, margin and P&L can be tested against fixed price fixtures. With live prices nothing is repeatable. |
| Free and sufficient | Free live feeds are partial (for example trades only, a few dozen symbols, trial-level WebSocket access) and their terms restrict redistribution. Historical one-minute bars are obtainable on a free plan for personal use. |
| Same lessons | Spread, slippage, gaps at the open, sessions, weekend closure, funding and margin all appear naturally, because the data is real. |

What is given up, and must be stated in the UI: prices are not today's prices; today's news does not match the screen; a determined learner could look up what happened next. The stage 7 gate measures rule adherence, not profit, so peeking only cheats the learner himself. The trading screen carries a permanent label: "שוק סימולציה · מחירי אמת בהשהיה של 8 שבועות".

## 2. Price feed

### Data

- One-minute OHLCV bars per instrument in `price_bars` (`timeframe = '1m'`), plus hourly and daily bars for chart history.
- `lib/market/provider.ts` adapter. Start with Twelve Data's free plan; verify at build time that the chosen symbols and intraday history are included, and record limits and terms in `docs/DECISIONS.md`. Free plans are for personal use; revisit licensing before any other user is given access.
- Ingestion: a daily job fetches the bars for the next sim day (data that is 8 weeks old minus one day, so always available). Schedule with Supabase `pg_cron` + `pg_net` calling a protected route, authenticated by a secret header. A one-off backfill script loads two years of daily, six months of hourly and the last 10 weeks of one-minute bars.
- Missing minutes mean the market is closed for that instrument. Never fabricate bars.

### Ticks inside a minute

`lib/sim/feed.ts` exports pure functions used by **both** server and client:

```ts
midAt(bar: MinuteBar, secondInMinute: number, seed: string): Decimal
quoteAt(instrument, bar, second): { bid, ask, mid }
pathOf(bar: MinuteBar, seed: string): Decimal[]   // 60 mids: starts at open, touches high and low, ends at close
```

- The path is deterministic for `(symbol, minute)`. Whether high or low comes first is decided by the seed.
- `spread = instrument.base_spread × sessionMultiplier(simTime)` (wider in the first minutes of a session and in thin hours; multipliers in config). `bid = mid − spread/2`, `ask = mid + spread/2`.
- The client animates quotes once per second from the current minute's bar. It polls `GET /api/sim/bars` every 20–30 seconds for bars up to the current sim minute. The server never sends bars beyond the current sim minute.

## 3. Instruments (v1)

About 20, in `instruments`. Final list depends on what the data plan covers.

| Class | Examples | Notes |
|---|---|---|
| Forex | EUR/USD, GBP/USD, USD/JPY, USD/ILS, EUR/ILS | 24 hours, 5 days |
| US shares | AAPL, MSFT, NVDA, AMZN, TSLA, TEVA, CHKP | US session only |
| Index and commodity proxies | SPY, QQQ, GLD | ETFs standing in for indices and gold until index data is available |
| Crypto | BTC/USD | Open at weekends, so there is always something to practise on |

Per instrument: quote currency, quantity step and minimum, price precision, base spread, leverage, maintenance ratio, long and short funding rates, funding time, guaranteed-stop availability, premium and minimum distance, trading hours text.

Spreads, leverage and funding rates are **illustrative configuration**, not any broker's actual terms. Regulatory leverage caps for Israeli retail clients are not yet verified (`docs/08-SOURCES.md`); defaults are conservative: forex 1:30, shares 1:5, ETFs 1:10, crypto 1:2.

## 4. Orders and execution

Buys execute at the ask, sells at the bid. Each trade is its own position; several positions in one instrument are allowed and are not netted.

| Order | Trigger | Fill price |
|---|---|---|
| Market | Immediately, only while the instrument is open | Current ask (buy) or bid (sell) |
| Entry limit (buy below, sell above) | Price reaches the level | The level, or better if the market opens beyond it |
| Entry stop (buy above, sell below) | Price reaches the level | The level, or worse if the market gaps beyond it |
| Close at Profit | Bid (long) or ask (short) reaches the level | The level, or better on a gap |
| Close at Loss | Bid (long) or ask (short) reaches the level | The level, or the first available price after a gap (slippage) |
| Trailing Stop | A Close at Loss that follows the best bid (long) or ask (short) at a fixed distance and never moves back | As Close at Loss |
| Guaranteed Stop | As Close at Loss | Exactly the level, even through a gap. Costs a premium charged when it is set, needs a minimum distance, exists on some instruments only, and cannot be removed once active (only replaced by closing the position) |

Also: partial close; edit protective orders on an open position; pending orders with optional expiry; cancel pending orders.

Rejections return a Hebrew reason: market closed, insufficient available margin, quantity below minimum or off step, protective level on the wrong side of the price or closer than the minimum distance, trading locked by the learner's own stop rules.

When Close at Profit and Close at Loss both fall inside one minute, the deterministic path of that minute decides which came first. If they fall on the same tick, the loss is taken.

## 5. Account, margin and costs

| Term | Definition |
|---|---|
| Balance | Starting funds + realised P&L + funding + fees |
| Unrealised P&L | Sum over open positions, valued at the price they would close at (bid for long, ask for short), converted to account currency |
| Equity | Balance + unrealised P&L |
| Initial margin | Position notional ÷ leverage, fixed at open, per position |
| Available | Equity − total initial margin. A new position needs Available ≥ its initial margin |
| Maintenance margin | Initial margin × maintenance ratio (default 50%) |
| Margin level | Equity ÷ total maintenance margin |

- **Margin warning** when Equity falls below total initial margin.
- **Stop-out** when Equity falls below total maintenance margin: close the position with the largest unrealised loss, recompute, repeat until Equity ≥ maintenance or nothing is open. This is the simulator's rule; real brokers differ, and the lesson says so.
- **Negative balance protection:** if a gap leaves the balance below zero, reset it to zero and write a ledger line.
- **Overnight funding:** once per day at the instrument's funding time, `notional × daily rate` for the side held, tripled on the configured weekday to cover the weekend. Written to the ledger and to the position's running total.
- **Currency conversion:** when the quote currency differs from the account currency, convert P&L, margin and funding at the simulator's own rate for that pair at that moment. Account currency is USD or ILS, chosen when the account is created. An optional conversion fee percentage is in config (default 0).
- **Starting funds:** the learner's own learning budget from stage 0, not a large round number. Reset is allowed and logged; a reset during stage 7 restarts the gate count.

All money is decimal; round to the account currency's minor unit, half away from zero, only when writing to the ledger.

## 6. Settlement: how orders trigger while nobody is watching

There is no matching process running in the background. State is brought up to date on demand.

```
settle(accountId, upTo = simNow):
  begin transaction; lock the account row (SELECT … FOR UPDATE)
  for each minute from account.last_settled_at to upTo, for symbols with open positions or pending orders:
      walk that minute's deterministic path
      update trailing stops → trigger entries → trigger protective orders → apply funding if due
      recompute equity → stop-out if required
      append ledger lines and position changes
  set last_settled_at = upTo; commit
```

- `settle` runs at the start of every simulator request for that account, so what the learner sees is always current and identical on every device.
- It is idempotent: running it twice for the same interval changes nothing.
- An optional `pg_cron` job every five minutes settles accounts with open exposure, only so that alerts and notifications can fire. Correctness never depends on it.
- The engine is pure TypeScript in `lib/sim/engine/`: `(state, bars, command | tick) → (newState, events)`. No I/O. A thin persistence layer applies the events in one database transaction over a direct Postgres connection (Supabase pooled connection string); the Supabase JS client cannot do multi-statement transactions.
- Engine tables are written by the server only. Clients read them under RLS and never insert or update them. Every server query filters by the authenticated user id, because the direct connection bypasses RLS.

## 7. What our demo adds that a broker's demo does not

These are the reason to build it ourselves. They are on by default and belong to the learner's plan.

| Feature | Behaviour |
|---|---|
| Mandatory Close at Loss | A position cannot be opened without one. Deliberate difference from real platforms, labelled as such |
| Risk on the ticket | Before sending, the ticket shows the loss at the stop in money, as % of equity and as 1R, plus margin used |
| Size from risk | "Risk 1%" button computes the quantity from equity, entry and stop (`lib/finance/positionSize`), rounded down to the quantity step |
| Plan check | Warns when the order exceeds the plan's risk per trade, the instrument is not in the plan, or the reward-to-risk is below the plan's minimum |
| Stop rules lock | When the plan's daily, weekly or monthly loss limit is reached, new positions are blocked until the period ends. Closing is always allowed |
| Journal link | Opening a position asks for setup and reason; closing it creates the journal entry with R-multiple filled in |
| Explain this | Every number on the ticket and the account bar has a tooltip linking to the lesson that taught it |
| Leverage cap | The account has its own maximum leverage (default: the instrument's, capped at 1:10 until stage 3 is passed) |

## 8. Screens

1. **Markets** — instrument list by class, search, favourites; live bid and ask, daily change, open/closed state.
2. **Instrument** — chart (candles, timeframes, indicators from stage 2, bid line; open positions and their protective levels drawn as lines that can be dragged), instrument facts (spread, leverage, margin, funding, hours), Buy and Sell buttons showing the live prices.
3. **Order ticket** — market or pending; quantity; Close at Loss (required), Close at Profit, Trailing, Guaranteed; live summary of margin, risk in money, % and R; plan check; reason field.
4. **Positions** — open positions with live P&L in money and R; edit, partial close, close.
5. **Orders** — pending orders; edit, cancel.
6. **History** — closed positions with reason closed, P&L, R, funding, link to the journal entry.
7. **Account bar** (always visible on trading screens) — Equity, Available, unrealised P&L, margin level meter.
8. **Ledger** — every balance change.
9. **Alerts** — price alerts, in-app; e-mail optional.

Mobile first. One-thumb order entry. Numbers and charts LTR. No celebratory effects on profit.

## 9. Engine test vectors

Fixtures in `lib/sim/engine/__fixtures__/`. Implement as tests before any UI.

| # | Case | Setup | Expected |
|---|---|---|---|
| S1 | Market buy, margin, spread cost | EUR/USD mid 1.08500, spread 0.00010; buy 10,000; leverage 1:30; USD account | Fill at ask 1.08505; notional 10,850.50; initial margin 361.68; maintenance 180.84; unrealised P&L immediately −1.00 |
| S2 | Close at Loss | S1 with stop 1.08205; bid trades down through it | Fill 1.08205; P&L −30.00 |
| S3 | Gap through stop | Long 100 shares at ask 50.05, stop 48.00; next session opens with bid 46.50 | Fill 46.50; P&L −355.00 (planned −205.00) |
| S3b | Guaranteed stop | S3 with a guaranteed stop, premium 0.20 per share | Fill 48.00; P&L −205.00; premium −20.00; total −225.00 |
| S4 | Trailing stop | Long 50 at 100.00, distance 2.00; bid goes 99.95 → 103.00 → 101.50 → 100.90 | Stop moves to 101.00 and never back; fill 101.00; P&L +50.00 |
| S5 | Stop-out | S1 position, balance 1,000.00, no stop reached | Stop-out fires when equity < 180.84, that is when bid < 1.003134 |
| S6 | Overnight funding | S1 position held through funding time; long rate 0.01% per day | Ledger −1.09 |
| S7 | Currency conversion | Long 10,000 USD/JPY at ask 150.010, closed at bid 150.510; USD account | P&L 5,000 JPY = 33.22 USD at 150.510 |
| S8 | Entry limit, favourable gap | Buy limit 100 shares at 49.00; market opens with ask 48.60 | Fill 48.60 (40.00 better than the limit) |
| S9 | Entry stop, adverse gap | Buy stop 100 shares at 51.00; market opens with ask 51.80 | Fill 51.80 (80.00 worse) |
| S10 | Size from risk | Equity 10,000.00; risk 1%; EUR/USD; stop 30 pips; step 1,000 units | 33,333.33 → 33,000 units; risk 99.00; initial margin 1,193.56 at ask 1.08505 |
| S11 | Both protective orders in one minute | Fixed bar and seed in fixtures | The order given by `pathOf`; on the same tick, the loss |
| S12 | Idempotent settlement | Run `settle` twice over the same interval | Second run produces no events |
| S13 | Offline settlement | Position opened, no requests for 3 sim days including a weekend, stop hit on day 2 | Position closed at the correct minute and price; funding applied for the nights held before the close |
| S14 | Closed market | Market order for a share outside its session | Rejected "השוק סגור"; a pending order is accepted and waits |
| S15 | Stop rules lock | Daily loss limit from the plan reached | New position rejected with the reason; close still allowed |

## 10. Later: live feed (optional phase 7)

`PriceFeed` is an interface (`quoteAt`, `barsBetween`, `isOpen`). A live implementation writes incoming quotes to one-second bars and serves the same interface, so the engine and UI do not change. It needs an always-on worker outside Vercel and a data plan whose licence covers the use. Do not start it before stage 7 has been used on the shifted feed for a month.

## 11. Honesty rules for the simulator

- The label "שוק סימולציה" with the delay is always visible on trading screens.
- Demo results are never shown as a forecast; the Stats screen repeats that fills, liquidity and emotions differ with real money.
- Spreads, leverage and funding are described as illustrative wherever they appear.
- Leverage, CFDs and guaranteed stops link to the lessons that explain their risk and cost.
