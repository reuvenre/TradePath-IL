# Sources and verified facts

Collected by web research on **2026-10-04**. Two kinds of entries:

- **Verified facts** that lessons will state. Many come from news and secondary sites. Before a lesson publishes one, `fact-checker` must confirm it against the primary source named in the last column and store that URL in the lesson frontmatter.
- **Learning sources** to consult for structure and coverage. Never copy their text; write original Hebrew lessons.

Trading education online goes stale fast. Three items below changed in 2026 alone, and most videos still teach the old rules.

## Verified facts

### Israel

| Fact | Used in | Found at | Confirm against |
|---|---|---|---|
| Since 5 January 2026 the Tel Aviv Stock Exchange trades Monday to Friday; Sunday is no longer a trading day | s1-m2-l7 | https://www.calcalist.co.il/market/article/hy04upad1g · https://www.funder.co.il/article/185395 | tase.co.il trading hours page |
| Continuous trading ends 17:25 Monday–Thursday and 13:50 on Friday (derivatives until 14:00) | s1-m2-l7 | https://www.calcalist.co.il/market/article/syw11ioquzg | tase.co.il |
| Individuals pay 25% tax on real capital gains from securities; a 5% surtax applies above a high-income threshold | s1-m3-l3 | https://www.bizportal.co.il/capitalmarket/news/article/20035330 | Israel Tax Authority (gov.il) |
| Capital losses offset capital gains in the same tax year, Israeli and foreign securities alike; carrying losses forward requires filing an annual return | s1-m3-l3 | same | Israel Tax Authority |
| Israeli banks and brokers withhold the tax at source; with a foreign broker the investor must report and pay, and the capital-gains detail goes on form 1322 | s1-m3-l3, s6-l8 | https://www.meitav.co.il/trade/financial_info/stock-exchange-tax-return/ · https://financa.co.il/מילוי-דוח-שנתי-ומיסוי-עם-ברוקר-זר/ | Israel Tax Authority |
| Running a "trading arena" (זירת סוחר: CFD and forex platforms dealing against clients) requires a licence from the Israel Securities Authority | s0-l5, s1-m2-l1, s1-m3-l2 | https://protocol.co.il/trading-floor/ | isa.gov.il list of licensed arenas |
| Binary options: ISA barred licensed arenas from offering them to Israeli clients (2016); Securities Law Amendment 66 (passed 23 Oct 2017) bars any Israeli-run arena from offering them to anyone, in Israel or abroad | s0-l5 | https://protocol.co.il/יאסר-זירות-סוחר-אופציות-בינאריות-חול/ · law PDF (not yet opened): https://fs.knesset.gov.il/20/law/20_ls2_390922.pdf | isa.gov.il, the law text |
| Fraud red flags checklist (SEC) | s0-l5 | https://www.investor.gov/protect-your-investments/fraud/how-avoid-fraud/red-flags-investment-fraud-checklist (not yet opened from the cloud session) | Investor.gov |

Not yet verified, needed for lessons: current ISA leverage caps for retail clients of trading arenas; TASE opening phases and exact pre-open times; current surtax threshold; typical Israeli bank vs broker commission ranges. `fact-checker` must find primary sources before s1-m3-l1, s1-m2-l6 and s1-m2-l7 are written.

### United States

| Fact | Used in | Found at | Confirm against |
|---|---|---|---|
| The Pattern Day Trader rule (4+ day trades in 5 business days → USD 25,000 minimum equity) has been eliminated. The SEC approved FINRA's amendment to Rule 4210 on 14 April 2026; the new intraday margin framework took effect 4 June 2026 | s5-l10 | https://www.quantinsti.com/articles/finra-pdt-rule-removal-2026/ · https://public-inspection.federalregister.gov/2026-07485.pdf | FINRA Regulatory Notice 26-10 on finra.org |
| Firms that need more time may transition until 20 October 2027, so some brokers may still apply the old controls | s5-l10 | https://daytrading.com/rules | FINRA notice |
| Under the new framework, intraday buying power on margin needs equity above USD 2,000, with limits set by the broker; margin obligations are computed on intraday exposure | s5-l10 | https://www.tradestation.com/insights/?p=66888 | FINRA notice |

### Outcomes for retail traders

| Fact | Used in | Found at | Confirm against |
|---|---|---|---|
| Brazil, mini-Ibovespa index futures, 2013–2015: 19,646 started; 1,551 persisted beyond 300 trading days; of those 97% lost money and 1.1% earned more than minimum wage (Chague, De-Losso, Giovannetti, "Day Trading for a Living?") | s0-l3 | https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101 (abstract read via search extract 2026-10-04; direct fetch blocked in the cloud session) | The paper itself (SSRN) |
| EU: national regulators' studies cited by ESMA in 2018 found 74–89% of retail CFD accounts lose money; CFD providers must display their own percentage | s0-l3, s1-m3-l2 | https://www.esma.europa.eu/node/84933 · https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32018X0601(02) | esma.europa.eu, March 2018 notice |
| US households, Barber and Odean (2000): 66,465 households 1991–1996; the most active fifth earned 11.4% a year vs 17.9% for the market, 6.5 points less | s0-l3, s5-l3 | https://faculty.haas.berkeley.edu/odean/Papers%20current%20versions/Individual_Investor_Performance_Final.pdf | The paper ("Trading Is Hazardous to Your Wealth") |
| Taiwan (a), Barber, Lee, Liu, Odean, "Do Individual Day Traders Make Money?" (2004, TSE 1995–1999): fewer than 20% of day traders profit net of costs in a typical six months | s0-l3 | https://faculty.haas.berkeley.edu/odean/papers/Day%20Traders/Day%20Trade%20040330.pdf | The paper |
| Taiwan (b), Barber, Lee, Liu, Odean, "The Cross-Section of Speculator Skill" (J. Financial Markets 2014, TSE 1992–2006): less than 1% of day traders predictably profitable after fees | s0-l3 | https://www.escholarship.org/content/qt7k75v0qx/qt7k75v0qx.pdf | The paper |

### Tools for the build

| Fact | Found at | Confirm against |
|---|---|---|
| `lightweight-charts` is Apache-2.0 and requires attributing TradingView (keep the built-in logo, or add the NOTICE text and a link to tradingview.com); version 5.x is current | https://github.com/tradingview/lightweightchartsios | The library's own repo and NOTICE file at install time |
| Free market-data plans: Twelve Data about 8 credits per minute and 800 per day; Alpha Vantage 25 requests per day; Finnhub about 60 calls per minute. Limits change often and free plans may be delayed or non-commercial | https://qveris.ai/guides/market-data-api-for-ai-agents/?lang=en · https://blog.apilayer.com/analyzing-the-top-free-apis-for-stock-data/ | Each provider's pricing page |
| Claude Code subagents are Markdown files with YAML frontmatter in `.claude/agents/` (`name`, `description`, optional `tools`, `model`); since v2.1.198 the `/agents` command no longer opens a creation wizard | https://code.claude.com/docs/en/sub-agents.md | Same |

## Learning sources to consult

| Source | Good for | Notes |
|---|---|---|
| Babypips, School of Pipsology — https://www.babypips.com/learn/forex | Lesson sequencing for forex beginners; 11 courses from "Preschool" up | Reports conflict on how much is still free in 2026; check before recommending it to the learner |
| Investor.gov (US SEC investor education) | Plain-language definitions; fraud red flags | Primary, public |
| FINRA investor pages (finra.org) | Order types, margin, day-trading rules | Primary |
| Israel Securities Authority (isa.gov.il) | Licensing, warnings to the public, trading-arena rules | Primary, Hebrew |
| Tel Aviv Stock Exchange (tase.co.il) | Trading hours, indices, order types on TASE | Primary, Hebrew |
| Bank of Israel (boi.org.il) | Interest rate decisions, USD/ILS representative rate | Primary, Hebrew |
| Investopedia | Term definitions, worked examples | Secondary; cross-check numbers |
| CME Group education | Futures and macro concepts | For the orientation lesson only |
| Central bank sites (Federal Reserve, ECB) | Meeting calendars and statements for stage 4 | Primary |

Books worth mining for structure (do not reproduce): Van Tharp on position sizing and R-multiples; Mark Douglas on trading psychology; John Murphy on technical analysis; Burton Malkiel for the passive-investing baseline.

## Rules for the fact-checker

1. A primary source beats any number of secondary ones.
2. Record `url` and `accessed` date in the lesson frontmatter and update `verified_on`.
3. If sources disagree, do not pick one silently; report the disagreement.
4. If a fact cannot be confirmed, the lesson says so plainly or omits it.
5. Re-verify every `volatile: true` lesson older than 90 days.
