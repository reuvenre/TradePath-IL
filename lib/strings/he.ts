// All user-facing text lives here so another language or a feminine variant can be added later.
export const he = {
  appName: "TradePath IL",
  nav: {
    label: "ניווט ראשי",
    today: "היום",
    roadmap: "מפת דרך",
    lab: "מעבדה",
    journal: "יומן",
  },
  theme: { toggle: "החלף בין מצב בהיר למצב כהה" },
  signOut: "יציאה",
  skipToContent: "דלג לתוכן",
  notFound: {
    title: "העמוד לא נמצא",
    body: "הכתובת שגויה, או שהעמוד הועבר.",
    home: "חזרה לעמוד הראשי",
  },
  error: {
    title: "משהו השתבש",
    body: "לא הצלחנו לטעון את העמוד. ההתקדמות שלך שמורה.",
    retry: "נסה שוב",
  },
  disclaimer:
    "התוכן כאן לימודי בלבד ואינו ייעוץ השקעות או שיווק השקעות. מסחר כרוך בסיכון, ורוב הסוחרים הפרטיים מפסידים כסף.",
  today: {
    title: "היום",
    emptyTitle: "עוד אין כאן שיעורים",
    emptyBody: "כשהשיעורים ייטענו, תראה כאן מה הצעד הבא שלך.",
  },
  roadmap: { title: "מפת דרך", empty: "מפת השלבים והשיעורים תופיע כאן." },
  lab: { title: "מעבדה", empty: "כלי התרגול יופיעו כאן." },
  journal: { title: "יומן", empty: "יומן העסקאות יופיע כאן." },
  signIn: {
    title: "כניסה",
    intro: "הקלד את כתובת המייל שלך. נשלח אליה קישור כניסה, בלי סיסמה.",
    emailLabel: "כתובת מייל",
    submit: "שלח לי קישור",
    sending: "שולח...",
    sent: "שלחנו קישור כניסה. פתח את המייל ולחץ עליו.",
    invalidEmail: "כתובת המייל לא תקינה.",
    failed: "לא הצלחנו לשלוח את הקישור. נסה שוב בעוד דקה.",
    linkFailed: "קישור הכניסה לא תקף או שפג תוקפו. בקש קישור חדש.",
    notConfigured: "המערכת עדיין לא מחוברת לבסיס הנתונים. חסרים משתני סביבה של Supabase.",
  },
} as const;
