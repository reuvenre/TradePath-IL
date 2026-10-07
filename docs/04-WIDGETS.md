# Interactive components

The curriculum names about 40 widgets. Build them as thin configurations of **four engines**, not as 40 one-off components.

| Engine | What it is | Widgets built on it |
|---|---|---|
| `ExerciseEngine` | item → learner response → instant feedback → score saved to `drill_attempts` | Sort, Match, TrueFalse, GuessReveal, ScenarioChoice and every unnamed "מיון / התאמה / נכון-לא נכון" exercise in the curriculum |
| `CalcShell` | labelled inputs → pure function from `lib/finance/` → result **plus the arithmetic written out step by step in Hebrew** | all calculators |
| `ChartCore` | wrapper around `lightweight-charts`: candles, volume, overlays, drawing layer (horizontal line, trend line, zone, marker), LTR container, touch support | all chart widgets, replay |
| `SimShell` | parameters → seeded simulation → animated result with "run again" | simulators |

Every widget: works at 375px by touch; has a `preset` prop so a lesson can pin inputs; has a "reset" control; exposes a short Hebrew instruction line; never shows a result without the reasoning behind it.

## Market data

1. **Synthetic bars (default for teaching).** `lib/market/synth.ts`: seeded generator producing OHLCV series with controllable regime (uptrend, downtrend, range, breakout, false breakout, gap) and embedded patterns. Deterministic per seed so drills have known answers. No licensing issues.
2. **Real bars for the simulator and for replay.** Server-side adapter (`lib/market/provider.ts`) for one provider, cached in `price_bars` (daily, hourly, one-minute). The demo simulator replays them shifted by 8 weeks; see `docs/10-SIMULATOR.md`. Respect the provider's rate limits and terms (free plans are typically for personal, non-commercial use — re-check before any public launch). The client never calls the provider.
3. **No live feed in v1.** It is an optional later phase behind the same `PriceFeed` interface.

Chart conventions: time left to right; up candles and down candles differ by colour **and** fill (hollow/solid) so colour is not the only signal; prices LTR; the TradingView attribution stays visible.

## Stage 0 widgets (Phase 1)

| Widget | Lesson | The learner does | Accept when |
|---|---|---|---|
| SystemTour | s0-l1 | Steps through the six screens of the system with one sentence each | Reachable by keyboard; works at 375px |
| Sort / GuessReveal / ScenarioChoice (ExerciseEngine presets in `content/exercises/`) | s0-l2, s0-l3, s0-l5 | Sorts 8 scenarios; guesses four research figures before revealing them; classifies 10 fictional ads | Every item shows its explanation; score saved to `drill_attempts` |
| LearningBudget | s0-l4 | Enters income, expenses, liquid savings and emergency-fund months; sees the maximum learning budget with the five arithmetic steps | `lib/finance/learning-budget.ts` vectors: 15,000 / 10,000 / 70,000 / 4 months → 15,000 (rebuild cap binds); savings 35,000 → 0 |

## Stage 1 widgets

| Widget | Lesson | The learner does | Accept when |
|---|---|---|---|
| OrderBookSim | s1-m1-l1 | Sees buyers and sellers queued by price; sends buy/sell orders of chosen size; watches which queue entries are consumed and how the last price moves | Buying more than the best level walks up the book and shows the average fill price |
| PairExplorer | s1-m1-l5 | Picks a pair; moves a slider for the quote; sees "1 EUR = x USD" and which currency strengthened | Works for a USD-quoted pair, a JPY pair and USD/ILS |
| SpreadCalc | s1-m2-l2 | Enters bid, ask, quantity; sees round-trip spread cost | Vector V5 |
| OrderTypeLab | s1-m2-l3, l4 | Reads a scenario; places Market, Limit, Stop, Stop-Limit or OCO on a mini chart; presses play; sees if and where it filled | Includes a gap scenario where a Stop fills worse than its trigger and a Stop-Limit does not fill |
| LongShortSim | s1-m2-l5 | Opens long or short; drags the price; sees P&L; short P&L keeps falling as price rises | Shows that long loss is capped at the stake and short loss is not |
| CostCalc | s1-m2-l6 | Enters trade value, commission model, spread, FX conversion, nights held | Shows total cost and cost as % of the trade |
| SessionClock | s1-m2-l7 | 24-hour dial in Israel time with Tel Aviv, London, New York and forex sessions | Session data comes from one config file marked volatile |
| LeverageSim | s1-m3-l1 | Sets account, leverage, price move; sees account change and margin call level | Vector V6 |
| TaxCalc | s1-m3-l3 | Enters gains and losses for a year; sees offset and illustrative tax at the stated rate | Labelled "illustration, not a tax computation"; rate from config marked volatile |

## Stage 2 widgets (ChartCore)

| Widget | Lesson | The learner does | Accept when |
|---|---|---|---|
| TimeframeSwitcher | s2-m1-l1 | Switches the same series between daily, hourly, 5-minute | One daily candle visibly equals the hourly candles inside it |
| CandleBuilder | s2-m1-l2 | Drags open, high, low, close to build a candle; then names O/H/L/C on given candles | Rejects impossible candles (high below open) with an explanation |
| VolumeReader | s2-m1-l3 | Compares pairs of moves with high and low volume | — |
| TrendMarker | s2-m1-l4 | Taps swing highs and lows; widget labels HH/HL/LH/LL and names the trend | Scored against generator ground truth |
| ChartDrill | s2-m2-l1, l2 | Draws support/resistance lines or trend lines; scored against answer zones with tolerance | Shows the model answer overlaid after each attempt |
| BreakoutOrFake | s2-m2-l3 | Sees a chart cut at the breakout bar; predicts; reveals what followed | Explains which evidence (close, volume) was available at decision time |
| PatternSpotter | s2-m3-l1..l3 | Flash-card drill: chart → choose pattern (or "none") | At least 25% of items are "none" |
| IndicatorPlayground | s2-m4-l1..l5 | Toggles MA, RSI, MACD, ATR; changes parameters with sliders | Indicator math in `lib/finance/indicators.ts` with unit tests against hand-computed values |
| MultiTimeframe | s2-m5-l1 | Two synced charts (daily, hourly) | Crosshair time is synced |

## Stage 3 widgets (CalcShell, SimShell)

| Widget | Lesson | The learner does | Accept when |
|---|---|---|---|
| RiskPerTrade | s3-l2 | Slider for account and risk % | Shows the amount and what 10 losses in a row would leave (vector V9) |
| StopPlacer | s3-l3 | Places a stop on a chart; widget shows distance in price, in % and in ATR | Flags stops inside normal noise (< 1 ATR) |
| PositionSizeCalc | s3-l4 | Account, risk %, entry, stop → quantity, position value, % of account | Vectors V1, V2 |
| PipCalc | s3-l5 | Pair, account currency, risk, stop in pips → pip value, lots | Vectors V3, V4 |
| RRVisualizer | s3-l6 | Drags entry, stop, target on a chart; sees R multiple and break-even win rate | Vectors V7, V8 |
| ExpectancySim | s3-l7 | Win rate and average win/loss in R → expectancy and a simulated 100-trade equity curve | Vector V10 |
| DrawdownRecovery | s3-l8 | Slider for loss % → gain needed to recover | Vector V11 |
| MonteCarlo | s3-l9 | Win rate, R, risk % → 200 simulated accounts over 200 trades; shows spread of outcomes, worst drawdown, share of accounts down more than 50% | Seeded; same inputs give same picture; risk 5% visibly ruins accounts that risk 1% does not |
| GapSim | s3-l10 | Holds a position over an event; price gaps through the stop | Shows planned loss vs actual loss |

## Stage 4–6 widgets

| Widget | Lesson | The learner does |
|---|---|---|
| StatementExplorer | s4-m1-l2 | Taps lines of a simplified fictional company's income statement, balance sheet, cash flow; each explains itself |
| MultipleCalc | s4-m1-l3 | Price and earnings per share → P/E; compares two fictional companies |
| EarningsReaction | s4-m1-l4 | Sets expectation and result; sees why "good" can still drop |
| RateSeesaw | s1-m1-l4, s4-m2-l1 | Moves the interest rate; sees the typical direction of bond prices, currency, growth stocks, with "typical, not guaranteed" |
| CalendarSim | s4-m2-l3 | Reads a mock calendar entry (forecast, previous, actual); predicts whether the surprise is positive |
| SentimentBoard | s4-m2-l5 | Classifies mock market days as risk-on or risk-off from a dashboard |
| StyleFitQuiz | s5-l2 | Answers about time, capital, temperament; gets a scored fit for four styles with reasons. With under 5 hours a week, day trading and scalping score low and the result says why |
| BaselineCompare | s5-l3 | Compares a trade log's curve with buy-and-hold of an index over the same period |
| StrategyCard | s5-l4 | Fills the five parts of a strategy; cannot save with a part missing |
| ChartReplay | s5-l5..l8 | See below |
| BiasGame | s6-l1 | A sequence of take-profit / hold-loser choices that reveals the learner's own disposition effect, then shows their numbers |
| PlanBuilder, ChecklistBuilder, LimitsSetter, WeeklyReview, Journal, BrokerChecklist | s6 | Product features (see PRD), each embeddable in its lesson |

### ChartReplay

- Loads a series, hides everything after a start bar.
- Controls: next bar, play/pause, speed, jump to random start.
- Paper order ticket: side, entry (next open or limit), stop (mandatory), target (optional), quantity from PositionSizeCalc.
- Each bar: check stop and target against the bar's range. If both are inside one bar, assume the stop was hit first (conservative) and say so.
- On close: R multiple, save to `trades` with `mode = 'backtest'`, prompt for the journal fields.
- Never reveals future bars before a trade is closed.

## `lib/finance/` test vectors

Implement as unit tests before building any widget. Money in minor units or decimals; compare with exact equality unless a tolerance is given.

| # | Function | Input | Expected |
|---|---|---|---|
| V1 | `positionSize` (stock) | account 20,000; risk 1%; entry 50; stop 48 | risk amount 200; risk per share 2; quantity 100; position value 5,000 (25% of account) |
| V2 | `positionSize` capped, no leverage | account 20,000; risk 1%; entry 50; stop 49.80 | uncapped quantity 1,000 (value 50,000) → capped to 400 (value 20,000); actual risk 80 |
| V3 | `fxPositionSize` | account USD 5,000; risk 1%; EUR/USD; stop 25 pips; pip value USD 10 per standard lot | risk 50; 0.20 lots |
| V4 | `pipValue` | USD/JPY at 150.00; 1 standard lot (100,000); account USD | 1,000 JPY = USD 6.67 (tolerance 0.01) |
| V5 | `spreadCost` | bid 10.00; ask 10.05; quantity 100 | 5.00 |
| V6 | `leveragedMove` | account 1,000; leverage 10; adverse move 1% | position 10,000; loss 100; 10% of account |
| V7 | `rMultiple` long | entry 100; stop 95; exit 110 | +2.0R |
| V8 | `rMultiple` short | entry 100; stop 103; exit 104 | −1.33R (tolerance 0.01) — worse than −1R because of slippage past the stop |
| V8b | `breakEvenWinRate` | reward:risk 2:1 | 33.33% |
| V9 | `afterLosingStreak` | 10 losses in a row at 1%, 2%, 5% of current equity | down 9.56%, 18.29%, 40.13% |
| V10 | `expectancy` | win rate 40%; avg win 2R; avg loss 1R | +0.20R per trade |
| V11 | `recoveryGain` | loss 10%, 20%, 50% | 11.11%, 25%, 100% |
| V12 | `illustrativeTax` | realised gains 3,000; realised losses 2,000; rate 25% | net 1,000; tax 250 |

Indicators (`sma`, `ema`, `rsi` with Wilder smoothing, `macd`, `atr`): write tests against values computed by hand on a 20-bar fixture committed to the repo. State the formula variant in a comment, because platforms differ.
