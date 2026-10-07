// Registry of every widget name a lesson may reference with <Widget name="…" />.
// `built` widgets render a component; `planned` ones render a placeholder that names the build phase.
// Engine exercises (Sort, Match, …) take `preset` = the id of a file in content/exercises/.

export type WidgetStatus = "built" | "planned";

export interface WidgetInfo {
  name: string;
  status: WidgetStatus;
  /** Build phase from docs/06-BUILD-PLAN.md. */
  phase: number;
  /** Engine exercises read their items from content/exercises/<preset>.json. */
  exercise?: boolean;
  /** Short Hebrew description for the Lab index and the placeholder. */
  he: string;
}

const EXERCISES: WidgetInfo[] = [
  { name: "Sort", status: "built", phase: 1, exercise: true, he: "מיון פריטים לקבוצות" },
  { name: "Match", status: "built", phase: 1, exercise: true, he: "התאמה בין זוגות" },
  { name: "TrueFalse", status: "built", phase: 1, exercise: true, he: "נכון או לא נכון" },
  { name: "GuessReveal", status: "built", phase: 1, exercise: true, he: "נחש, ואז גלה את הנתון האמיתי" },
  { name: "ScenarioChoice", status: "built", phase: 1, exercise: true, he: "תרחיש ובחירה" },
];

const STAGE0: WidgetInfo[] = [
  { name: "SystemTour", status: "built", phase: 1, he: "סיור מודרך במערכת" },
  { name: "LearningBudget", status: "built", phase: 1, he: "מחשבון סכום לימוד" },
];

const PLANNED: [name: string, phase: number, he: string][] = [
  ["OrderBookSim", 2, "ספר פקודות חי"],
  ["PairExplorer", 2, "זוגות מטבעות"],
  ["SpreadCalc", 2, "מחשבון מרווח"],
  ["OrderTypeLab", 2, "מעבדת סוגי פקודות"],
  ["LongShortSim", 2, "לונג ושורט"],
  ["CostCalc", 2, "מחשבון עלות עסקה"],
  ["SessionClock", 2, "שעון שעות מסחר"],
  ["LeverageSim", 2, "סימולטור מינוף"],
  ["TaxCalc", 2, "מחשבון מס להדגמה"],
  ["RateSeesaw", 2, "נדנדת ריבית"],
  ["TimeframeSwitcher", 2, "טווחי זמן"],
  ["CandleBuilder", 2, "בניית נר"],
  ["VolumeReader", 2, "קריאת נפח"],
  ["TrendMarker", 2, "סימון מגמה"],
  ["ChartDrill", 2, "תרגול רמות על גרף"],
  ["BreakoutOrFake", 2, "פריצה או פריצת שווא"],
  ["PatternSpotter", 2, "זיהוי תבניות"],
  ["IndicatorPlayground", 2, "מגרש אינדיקטורים"],
  ["MultiTimeframe", 2, "ריבוי טווחי זמן"],
  ["RiskPerTrade", 3, "סיכון לעסקה"],
  ["StopPlacer", 3, "מיקום סטופ"],
  ["PositionSizeCalc", 3, "מחשבון גודל פוזיציה"],
  ["PipCalc", 3, "מחשבון פיפ ולוט"],
  ["RRVisualizer", 3, "יחס סיכוי–סיכון"],
  ["ExpectancySim", 3, "תוחלת"],
  ["DrawdownRecovery", 3, "ירידת הון והדרך חזרה"],
  ["MonteCarlo", 3, "סימולציית מונטה קרלו"],
  ["GapSim", 3, "פער מחיר"],
  ["StatementExplorer", 4, "דוח כספי"],
  ["MultipleCalc", 4, "מכפילים"],
  ["EarningsReaction", 4, "תגובה לדוח"],
  ["CalendarSim", 4, "לוח שנה כלכלי"],
  ["SentimentBoard", 4, "לוח סנטימנט"],
  ["StyleFitQuiz", 4, "איזה סגנון מתאים לך"],
  ["BaselineCompare", 7, "השוואה לקו הבסיס"],
  ["StrategyCard", 4, "כרטיס אסטרטגיה"],
  ["ChartReplay", 7, "שחזור גרף"],
  ["BiasGame", 4, "משחק הטיות"],
  ["PlanBuilder", 4, "בניית תוכנית מסחר"],
  ["ChecklistBuilder", 4, "רשימת בדיקה"],
  ["LimitsSetter", 4, "כללי עצירה"],
  ["WeeklyReview", 4, "סקירה שבועית"],
  ["Journal", 4, "יומן"],
  ["BrokerChecklist", 4, "בחירת ברוקר"],
];

export const WIDGETS: WidgetInfo[] = [
  ...EXERCISES,
  ...STAGE0,
  ...PLANNED.map(([name, phase, he]) => ({ name, status: "planned" as const, phase, he })),
];

const BY_NAME = new Map(WIDGETS.map((w) => [w.name, w]));

export function widgetInfo(name: string): WidgetInfo | undefined {
  return BY_NAME.get(name);
}

export const EXERCISE_WIDGETS = EXERCISES.map((w) => w.name) as readonly string[];
