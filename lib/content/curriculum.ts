// The fixed learning sequence from docs/02-CURRICULUM.md: 8 stages, 74 lessons, a gate after each stage.
// Lesson files may not exist yet for every entry; the Roadmap shows those as "not written yet".
// Curriculum order (the order of `LESSONS`) is the prerequisite order used by content:validate.

export type GateRequirement =
  | { kind: "exam"; questions: number; passPercent: number }
  | { kind: "contract" }
  | { kind: "evidence"; description: string }
  | { kind: "later"; phase: number; description: string };

export interface StageSpec {
  stage: number;
  title: string;
  goal: string;
  weeks: number;
  gate: { requirement: string; spec: GateRequirement }[];
}

export interface LessonSpec {
  id: string;
  title: string;
  stage: number;
  module?: number;
  order: number;
  /** Marked ⏱ in the curriculum: states facts that change. */
  volatile: boolean;
  /** The practice named in the curriculum (widget or exercise). */
  practice: string;
}

export interface ModuleSpec {
  stage: number;
  module: number;
  title: string;
}

export const STAGES: StageSpec[] = [
  {
    stage: 0,
    title: "לפני שמתחילים",
    goal: "לצאת עם ציפיות נכונות, סכום לימוד מוגדר, ויכולת לזהות מי מנסה למכור לך חלום.",
    weeks: 3,
    gate: [
      { requirement: "exam", spec: { kind: "exam", questions: 5, passPercent: 80 } },
      { requirement: "contract", spec: { kind: "contract" } },
    ],
  },
  {
    stage: 1,
    title: "יסודות השוק",
    goal: "להבין מה קונים, ממי, דרך מי, כמה זה עולה, ומה קורה לכסף.",
    weeks: 8,
    gate: [
      { requirement: "exam", spec: { kind: "exam", questions: 30, passPercent: 80 } },
      {
        requirement: "task",
        spec: {
          kind: "evidence",
          description:
            "בחשבון הדמו של המערכת, בצע פקודה אחת מכל סוג שנלמד. אם הסימולטור עדיין לא נבנה, בצע את המשימה בחשבון דמו חיצוני וצרף צילום מסך.",
        },
      },
    ],
  },
  {
    stage: 2,
    title: "קריאת גרף",
    goal: "להסתכל על גרף ולתאר מה קורה בו בשפה מדויקת, בלי לנבא.",
    weeks: 8,
    gate: [
      {
        requirement: "drill",
        spec: { kind: "later", phase: 2, description: "תרגיל זיהוי על 30 גרפים, 75% לפחות." },
      },
      {
        requirement: "task",
        spec: {
          kind: "evidence",
          description: "ניתוח כתוב של 3 גרפים: מה המגמה, איפה הרמות, ומה היית מחכה לראות לפני פעולה.",
        },
      },
    ],
  },
  {
    stage: 3,
    title: "ניהול סיכונים",
    goal: "לדעת לפני כל עסקה כמה בדיוק אתה עלול להפסיד, ולוודא שהסכום הזה קטן מספיק כדי לשרוד רצף הפסדים.",
    weeks: 5,
    gate: [
      {
        requirement: "sizing",
        spec: { kind: "later", phase: 3, description: "10 תרגילי גודל פוזיציה ביד, 10 מתוך 10." },
      },
      {
        requirement: "task",
        spec: { kind: "evidence", description: "הרצת MonteCarlo וכתיבת 3 מסקנות." },
      },
    ],
  },
  {
    stage: 4,
    title: "מה מזיז מחירים",
    goal: "להבין למה שוק זז היום, ולדעת מתי מסוכן להחזיק פוזיציה.",
    weeks: 5,
    gate: [
      { requirement: "exam", spec: { kind: "exam", questions: 20, passPercent: 80 } },
      {
        requirement: "task",
        spec: {
          kind: "evidence",
          description:
            "שני ניתוחים כתובים קצרים: דוח רבעוני אחד והחלטת ריבית אחת (מה ציפו, מה קרה, איך השוק הגיב).",
        },
      },
    ],
  },
  {
    stage: 5,
    title: "סגנונות ואסטרטגיות",
    goal: "לבחור סגנון שמתאים לזמן, להון ולאופי שלך, ולבדוק רעיון אחד בצורה מסודרת.",
    weeks: 7,
    gate: [
      { requirement: "style", spec: { kind: "evidence", description: "בחירת סגנון מנומקת בכתב." } },
      { requirement: "strategy", spec: { kind: "later", phase: 4, description: "כרטיס אסטרטגיה אחד מלא." } },
      {
        requirement: "backtest",
        spec: { kind: "later", phase: 7, description: "בדיקה לאחור של 50 עסקאות מתועדות ביומן." },
      },
    ],
  },
  {
    stage: 6,
    title: "פסיכולוגיה ותוכנית מסחר",
    goal: "לצאת עם מסמך אחד שאומר מה אתה עושה, מתי, בכמה, ומתי אתה עוצר.",
    weeks: 4,
    gate: [
      { requirement: "plan", spec: { kind: "later", phase: 4, description: "תוכנית מסחר מלאה, כל הסעיפים." } },
      { requirement: "checklist", spec: { kind: "later", phase: 4, description: "רשימת בדיקה אישית." } },
      { requirement: "limits", spec: { kind: "later", phase: 4, description: "כללי עצירה: יומי, שבועי וחודשי." } },
    ],
  },
  {
    stage: 7,
    title: "מסחר דמו",
    goal: "להוכיח לעצמך, על נייר, שאתה מסוגל לעבוד לפי התוכנית לאורך זמן.",
    weeks: 12,
    gate: [
      {
        requirement: "demo",
        spec: {
          kind: "later",
          phase: 7,
          description:
            "60 עסקאות לפחות, 12 שבועות לפחות, עמידה בכללים 90% ומעלה, תוחלת חיובית ב-R, ירידת הון מרבית עד 10R, אפס חריגות מכללי העצירה.",
        },
      },
    ],
  },
];

export const MODULES: ModuleSpec[] = [
  { stage: 1, module: 1, title: "מה זה שוק" },
  { stage: 1, module: 2, title: "איך סוחרים בפועל" },
  { stage: 1, module: 3, title: "הכסף שלך" },
  { stage: 2, module: 1, title: "הגרף" },
  { stage: 2, module: 2, title: "רמות" },
  { stage: 2, module: 3, title: "תבניות" },
  { stage: 2, module: 4, title: "אינדיקטורים" },
  { stage: 2, module: 5, title: "חיבור" },
  { stage: 4, module: 1, title: "מניות" },
  { stage: 4, module: 2, title: "מטבעות ומאקרו" },
];

type Row = [id: string, title: string, practice: string, volatile?: true];

function stageLessons(stage: number, rows: Row[], module?: number): LessonSpec[] {
  return rows.map(([id, title, practice, volatile], i) => ({
    id,
    title,
    stage,
    ...(module === undefined ? {} : { module }),
    order: i + 1,
    volatile: volatile === true,
    practice,
  }));
}

export const LESSONS: LessonSpec[] = [
  ...stageLessons(0, [
    ["s0-l1", "איך לומדים כאן", "סיור מודרך במערכת"],
    ["s0-l2", "מסחר מול השקעה", "מיון 8 תרחישים"],
    ["s0-l3", "מה הסיכויים באמת", "נחש ואז גלה על נתוני המחקרים"],
    ["s0-l4", "כסף שמותר לסכן", "מחשבון סכום לימוד"],
    ["s0-l5", "הונאות, גורואים וקבוצות איתותים", "אמיתי או הונאה: 10 מודעות", true],
  ]),
  ...stageLessons(
    1,
    [
      ["s1-m1-l1", "מה זה שוק ומי קובע את המחיר", "OrderBookSim"],
      ["s1-m1-l2", "מניה: חתיכה מחברה", "חלוקת חברה למניות"],
      ["s1-m1-l3", "מדדים וקרנות סל (ETF)", "בניית מדד מ-5 מניות"],
      ["s1-m1-l4", "אג\"ח וריבית בקצרה", "RateSeesaw"],
      ["s1-m1-l5", "מט\"ח: זוגות מטבעות", "PairExplorer"],
      ["s1-m1-l6", "סחורות, קריפטו ונגזרים: מפת היכרות", "מפת מכשירים"],
    ],
    1,
  ),
  ...stageLessons(
    1,
    [
      ["s1-m2-l1", "מי מבצע את הפקודה שלך", "התאמת גוף לתיאור", true],
      ["s1-m2-l2", "Bid, Ask ומרווח", "SpreadCalc"],
      ["s1-m2-l3", "פקודות א׳: Market ו-Limit", "OrderTypeLab"],
      ["s1-m2-l4", "פקודות ב׳: Stop, Stop-Limit ו-OCO", "OrderTypeLab"],
      ["s1-m2-l5", "לונג ושורט", "LongShortSim"],
      ["s1-m2-l6", "כמה באמת עולה עסקה", "CostCalc", true],
      ["s1-m2-l7", "שעות מסחר", "SessionClock", true],
    ],
    2,
  ),
  ...stageLessons(
    1,
    [
      ["s1-m3-l1", "מינוף ומרג'ין", "LeverageSim"],
      ["s1-m3-l2", "CFD מול נכס אמיתי", "השוואה צד לצד", true],
      ["s1-m3-l3", "מס בישראל", "TaxCalc", true],
    ],
    3,
  ),
  ...stageLessons(
    2,
    [
      ["s2-m1-l1", "גרף מחיר: צירים וטווחי זמן", "TimeframeSwitcher"],
      ["s2-m1-l2", "נר יפני", "CandleBuilder"],
      ["s2-m1-l3", "נפח מסחר", "VolumeReader"],
      ["s2-m1-l4", "מגמה: שיאים ושפלים", "TrendMarker"],
    ],
    1,
  ),
  ...stageLessons(
    2,
    [
      ["s2-m2-l1", "תמיכה והתנגדות", "ChartDrill"],
      ["s2-m2-l2", "קווי מגמה ותעלות", "ChartDrill"],
      ["s2-m2-l3", "פריצה ופריצת שווא", "BreakoutOrFake"],
    ],
    2,
  ),
  ...stageLessons(
    2,
    [
      ["s2-m3-l1", "תבניות נרות", "PatternSpotter"],
      ["s2-m3-l2", "תבניות המשך", "PatternSpotter"],
      ["s2-m3-l3", "תבניות היפוך", "PatternSpotter"],
    ],
    3,
  ),
  ...stageLessons(
    2,
    [
      ["s2-m4-l1", "ממוצעים נעים", "IndicatorPlayground"],
      ["s2-m4-l2", "RSI", "IndicatorPlayground"],
      ["s2-m4-l3", "MACD", "IndicatorPlayground"],
      ["s2-m4-l4", "ATR ותנודתיות", "IndicatorPlayground"],
      ["s2-m4-l5", "מה אינדיקטורים לא יודעים", "גרף אחד, שלושה אינדיקטורים סותרים"],
    ],
    4,
  ),
  ...stageLessons(2, [["s2-m5-l1", "ריבוי טווחי זמן", "MultiTimeframe"]], 5),
  ...stageLessons(3, [
    ["s3-l1", "למה ניהול סיכונים קודם לכול", "שני סוחרים, אותן עסקאות, גודל שונה"],
    ["s3-l2", "כלל ה-1%", "RiskPerTrade"],
    ["s3-l3", "סטופ לוס: איפה ולמה", "StopPlacer"],
    ["s3-l4", "גודל פוזיציה במניות", "PositionSizeCalc"],
    ["s3-l5", "פיפ, לוט וגודל פוזיציה במט\"ח", "PipCalc"],
    ["s3-l6", "יחס סיכוי–סיכון ו-R", "RRVisualizer"],
    ["s3-l7", "תוחלת", "ExpectancySim"],
    ["s3-l8", "ירידת הון והדרך חזרה", "DrawdownRecovery"],
    ["s3-l9", "רצפי הפסדים וסיכון הרס", "MonteCarlo"],
    ["s3-l10", "פערים, החלקה, חדשות וקורלציה", "GapSim"],
  ]),
  ...stageLessons(
    4,
    [
      ["s4-m1-l1", "מה מזיז מניה", "מיון כותרות"],
      ["s4-m1-l2", "דוחות כספיים ב-20 דקות", "StatementExplorer"],
      ["s4-m1-l3", "מכפילים", "MultipleCalc"],
      ["s4-m1-l4", "עונת הדוחות", "EarningsReaction"],
    ],
    1,
  ),
  ...stageLessons(
    4,
    [
      ["s4-m2-l1", "ריבית ואינפלציה", "RateSeesaw"],
      ["s4-m2-l2", "בנקים מרכזיים", "התאמה"],
      ["s4-m2-l3", "לוח שנה כלכלי", "CalendarSim"],
      ["s4-m2-l4", "דולר–שקל", "תרחישי USD/ILS"],
      ["s4-m2-l5", "סנטימנט", "SentimentBoard"],
    ],
    2,
  ),
  ...stageLessons(5, [
    ["s5-l1", "ארבעה סגנונות", "טבלת השוואה"],
    ["s5-l2", "איזה סגנון מתאים לך", "StyleFitQuiz"],
    ["s5-l3", "קו הבסיס: מדד וסבלנות", "BaselineCompare"],
    ["s5-l4", "מהי אסטרטגיה", "StrategyCard"],
    ["s5-l5", "דוגמה: מעקב מגמה", "ChartReplay"],
    ["s5-l6", "דוגמה: פריצה", "ChartReplay"],
    ["s5-l7", "דוגמה: טווח", "ChartReplay"],
    ["s5-l8", "בדיקה לאחור ידנית (Backtest)", "ChartReplay + Journal"],
    ["s5-l9", "מלכודות בבדיקה לאחור", "מצא את הטעות"],
    ["s5-l10", "כללי מסחר יומי בארה\"ב אחרי 2026", "נכון / לא נכון", true],
  ]),
  ...stageLessons(6, [
    ["s6-l1", "שנאת הפסד", "BiasGame"],
    ["s6-l2", "FOMO, נקמה וביטחון יתר", "תרחישים"],
    ["s6-l3", "יומן מסחר", "Journal"],
    ["s6-l4", "תוכנית מסחר", "PlanBuilder"],
    ["s6-l5", "שגרה: לפני, בזמן ואחרי", "ChecklistBuilder"],
    ["s6-l6", "כללי עצירה", "LimitsSetter"],
    ["s6-l7", "סקירה שבועית", "WeeklyReview"],
    ["s6-l8", "בחירת ברוקר: רשימת בדיקה", "BrokerChecklist", true],
  ]),
];

const LESSON_INDEX = new Map(LESSONS.map((l, i) => [l.id, i]));

export function lessonSpec(id: string): LessonSpec | undefined {
  const i = LESSON_INDEX.get(id);
  return i === undefined ? undefined : LESSONS[i];
}

/** Position in curriculum order, or -1 when the id is not in the curriculum. */
export function lessonIndex(id: string): number {
  return LESSON_INDEX.get(id) ?? -1;
}

export function lessonsOfStage(stage: number): LessonSpec[] {
  return LESSONS.filter((l) => l.stage === stage);
}

export function stageSpec(stage: number): StageSpec | undefined {
  return STAGES.find((s) => s.stage === stage);
}

export function moduleTitle(stage: number, module: number): string | undefined {
  return MODULES.find((m) => m.stage === stage && m.module === module)?.title;
}
