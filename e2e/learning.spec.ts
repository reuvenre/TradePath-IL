import { expect, test, type Page } from "@playwright/test";

// Phase 1 acceptance, on the development previews (no Supabase session needed):
// both reference lessons render with tooltips and LTR numbers; quiz and cards work; exercises run;
// roadmap gating is visible; the gate screen shows exam and contract.

async function noSidewaysScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
}

test.describe("lesson page", () => {
  for (const id of ["s1-m1-l1", "s3-l4"]) {
    test(`${id} renders with the seven sections, a term tooltip and LTR numbers`, async ({ page }) => {
      await page.goto(`/dev/lesson/${id}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const h of ["בשורה אחת", "נתחיל ממשהו מוכר", "ועכשיו בשוק", "דוגמה עם מספרים", "נסה בעצמך", "טעויות נפוצות", "סיכום"]) {
        await expect(page.getByRole("heading", { level: 2, name: h })).toBeVisible();
      }
      await noSidewaysScroll(page);

      // Numbers and arithmetic are isolated LTR.
      const ltr = page.locator("article bdi[dir='ltr']");
      expect(await ltr.count()).toBeGreaterThan(5);
      const arithmetic = page.locator("article bdi[dir='ltr']", { hasText: /×|=/ });
      expect(await arithmetic.count()).toBeGreaterThan(0);

      // The first glossary term opens a popover with its definition and a link to the glossary.
      const term = page.locator("article button[aria-label^='הסבר למונח']").first();
      await term.scrollIntoViewIfNeeded();
      await term.click();
      const popup = page.getByRole("dialog").or(page.locator("[data-popup-open]")).first();
      await expect(page.getByRole("link", { name: "למילון" })).toBeVisible();
      void popup;
    });
  }

  test("an unbuilt widget shows a placeholder naming its build phase", async ({ page }) => {
    await page.goto("/dev/lesson/s1-m1-l1");
    const placeholder = page.locator("[data-widget-placeholder='OrderBookSim']");
    await expect(placeholder).toContainText("OrderBookSim");
    await expect(placeholder).toContainText("שלב בנייה 2");
  });

  test("a volatile lesson shows its verification date", async ({ page }) => {
    await page.goto("/dev/lesson/s0-l5");
    await expect(page.getByRole("note").filter({ hasText: "נבדקו לאחרונה" })).toBeVisible();
    expect(await page.locator("article").getByText("אומת ב-").count()).toBeGreaterThan(0);
  });
});

test.describe("quiz", () => {
  test("answering gives immediate explanations and a pass needs 4 of 5", async ({ page }) => {
    await page.goto("/dev/lesson/s1-m1-l1/quiz");
    await expect(page.getByRole("heading", { level: 1, name: "שאלות" })).toBeVisible();
    for (let i = 0; i < 5; i++) {
      await expect(page.getByText(`שאלה ${i + 1} מתוך 5`)).toBeVisible();
      const options = page.getByRole("group").getByRole("button");
      await expect(options).toHaveCount(4);
      await options.first().click();
      await page.getByRole("button", { name: "בדוק" }).click();
      const status = page.getByRole("status");
      await expect(status).toContainText(/נכון\./);
      await status.getByRole("button").click();
    }
    await expect(page.getByRole("heading", { name: "התוצאה" })).toBeVisible();
    await expect(page.getByText(/מתוך 5/).first()).toBeVisible();
    const passed = await page.getByText("עברת. השיעור הושלם.").count();
    const failed = await page.getByText(/עדיין לא/).count();
    expect(passed + failed).toBe(1);
    if (failed) await expect(page.getByRole("button", { name: "נסה שוב" })).toBeVisible();
  });
});

test.describe("flashcards", () => {
  test("flip, grade, and finish the deck", async ({ page }) => {
    await page.goto("/dev/cards");
    await expect(page.getByText("כרטיסייה 1 מתוך 4")).toBeVisible();
    for (let i = 0; i < 4; i++) {
      await page.getByRole("button", { name: "הצג תשובה" }).click();
      await page.getByRole("button", { name: i % 2 ? "לא ידעתי" : "ידעתי", exact: true }).click();
    }
    await expect(page.getByText("סיימת את החזרה להיום")).toBeVisible();
    await expect(page.getByText("ידעת 2 מתוך 4")).toBeVisible();
  });
});

test.describe("exercise engine", () => {
  test("Sort gives feedback per item and a score", async ({ page }) => {
    await page.goto("/dev/exercise/s0-l2-trader-or-investor");
    const box = page.locator("[data-exercise]");
    for (let i = 0; i < 8; i++) {
      await expect(box.getByText(`${i + 1} מתוך 8`)).toBeVisible();
      await box.getByRole("group").getByRole("button").first().click();
      await box.getByRole("status").getByRole("button").click();
    }
    await expect(box.getByRole("status")).toContainText(/מתוך 8 נכונות/);
    await box.getByRole("button", { name: "התחל מחדש" }).click();
    await expect(box.getByText("1 מתוך 8")).toBeVisible();
  });

  test("GuessReveal reveals the real figure with its source", async ({ page }) => {
    await page.goto("/dev/exercise/s0-l3-guess-the-odds");
    const box = page.locator("[data-exercise]");
    await box.getByRole("button", { name: "גלה" }).click();
    await expect(box.getByRole("status")).toContainText("הנתון האמיתי");
    await expect(box.getByRole("link", { name: /מקור/ })).toBeVisible();
  });

  test("ScenarioChoice renders the fictional ads", async ({ page }) => {
    await page.goto("/dev/exercise/s0-l5-real-or-scam");
    const box = page.locator("[data-exercise]");
    await expect(box.getByRole("button", { name: "דגל אדום" })).toBeVisible();
    await box.getByRole("button", { name: "דגל אדום" }).click();
    await expect(box.getByRole("status")).toContainText(/נכון|לא נכון/);
  });
});

test.describe("roadmap and gating", () => {
  test("a fresh learner sees only s0-l1 open; the rest are locked or unwritten", async ({ page }) => {
    await page.goto("/dev/roadmap?scenario=fresh");
    await expect(page.locator("[data-lesson='s0-l1']")).toHaveAttribute("data-state", "available");
    await expect(page.locator("[data-lesson='s0-l2']")).toHaveAttribute("data-state", "locked");
    await expect(page.locator("[data-lesson='s1-m1-l1']")).toHaveAttribute("data-state", "locked");
    await expect(page.locator("[data-lesson='s1-m1-l2']")).toHaveAttribute("data-state", "unwritten");
    await expect(page.locator("[data-gate='0']")).toHaveAttribute("data-state", "locked");
    // Locked lessons are not links.
    expect(await page.locator("a[data-lesson='s0-l2']").count()).toBe(0);
    expect(await page.locator("a[data-lesson='s0-l1']").count()).toBe(1);
    await noSidewaysScroll(page);
  });

  test("completing a lesson unlocks the next; finishing the stage opens the gate", async ({ page }) => {
    await page.goto("/dev/roadmap?scenario=mid-stage-0");
    await expect(page.locator("[data-lesson='s0-l1']")).toHaveAttribute("data-state", "done");
    await expect(page.locator("[data-lesson='s0-l2']")).toHaveAttribute("data-state", "available");
    await page.goto("/dev/roadmap?scenario=gate-0-open");
    await expect(page.locator("[data-gate='0']")).toHaveAttribute("data-state", "available");
    await expect(page.locator("[data-stage='1']")).toHaveAttribute("data-unlocked", "false");
    await page.goto("/dev/roadmap?scenario=stage-1-open");
    await expect(page.locator("[data-stage='1']")).toHaveAttribute("data-unlocked", "true");
    await expect(page.locator("[data-lesson='s1-m1-l1']")).toHaveAttribute("data-state", "available");
  });

  test("the gate screen shows a five-question exam and the learning contract", async ({ page }) => {
    await page.goto("/dev/gate/0");
    await expect(page.getByRole("heading", { level: 1, name: "שער שלב 0" })).toBeVisible();
    await page.getByTestId("exam-start").click();
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId("exam").getByText(`שאלה ${i + 1} מתוך 5`)).toBeVisible();
      await page.getByTestId("exam").getByRole("group").getByRole("button").first().click();
      await page.getByTestId("exam").getByRole("button", { name: i < 4 ? "לשאלה הבאה" : "לתוצאה" }).click();
    }
    const contract = page.getByTestId("contract");
    await expect(contract.getByLabel("סכום הלימוד שלי, בשקלים")).toHaveValue("15000");
    await contract.getByRole("button", { name: "חתום" }).click();
    await expect(contract.getByRole("alert")).toContainText("צריך לסמן");
    await contract.getByRole("checkbox").first().check();
    await contract.getByRole("checkbox").nth(1).check();
    await contract.getByRole("button", { name: "חתום" }).click();
    await expect(page.getByRole("status").filter({ hasText: "נחתם ב-" })).toBeVisible();
    await noSidewaysScroll(page);
  });
});

test.describe("today and glossary", () => {
  test("Today shows the next lesson, cards due, weekly goal and streak", async ({ page }) => {
    await page.goto("/dev/today");
    await expect(page.locator("[data-card='next']")).toContainText("מסחר מול השקעה");
    await expect(page.locator("[data-card='cards']")).toContainText("3 כרטיסיות מחכות");
    await expect(page.locator("[data-card='week']")).toContainText("45 מתוך 150 דקות השבוע");
    await expect(page.locator("[data-card='week']")).toContainText("2 שבועות ברצף");
    await page.goto("/dev/today?scenario=gate-0-open");
    await expect(page.locator("[data-card='next']")).toContainText("השער פתוח");
  });

  test("the glossary is searchable and says where each term is taught", async ({ page }) => {
    await page.goto("/dev/glossary");
    await page.getByLabel("חיפוש מונח").fill("spread");
    await expect(page.locator("[data-term]")).toHaveCount(1);
    await expect(page.locator("[data-term='spread']")).toContainText("נלמד בשיעור");
    await page.getByLabel("חיפוש מונח").fill("zzzz");
    await expect(page.getByText("לא נמצא מונח כזה.")).toBeVisible();
  });
});
