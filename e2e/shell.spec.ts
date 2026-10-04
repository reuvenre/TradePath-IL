import { expect, test } from "@playwright/test";

// Uses the development-only shell preview; the real pages need a Supabase session.
test.beforeEach(async ({ page }) => {
  await page.goto("/dev/today");
});

test("exactly one main navigation is visible, with the four destinations", async ({ page }) => {
  const navs = page.getByRole("navigation", { name: "ניווט ראשי" });
  await expect(navs.filter({ visible: true })).toHaveCount(1);
  const visible = navs.filter({ visible: true });
  for (const name of ["היום", "מפת דרך", "מעבדה", "יומן"]) {
    await expect(visible.getByRole("link", { name })).toBeVisible();
  }
});

test("mobile uses the bottom nav, desktop the top bar", async ({ page }, testInfo) => {
  const nav = page.getByRole("navigation", { name: "ניווט ראשי" }).filter({ visible: true });
  const box = await nav.boundingBox();
  const height = page.viewportSize()!.height;
  if (testInfo.project.name === "mobile") expect(box!.y + box!.height).toBeCloseTo(height, 0);
  else expect(box!.y).toBeLessThan(60);
});

test("the shell is RTL: the app name sits on the right", async ({ page }) => {
  const box = await page.getByRole("link", { name: "TradePath IL" }).boundingBox();
  expect(box!.x + box!.width / 2).toBeGreaterThan(page.viewportSize()!.width / 2);
});

test("no sideways scroll, footer disclaimer present and not hidden by the nav", async ({ page }) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);

  const footer = page.getByRole("contentinfo");
  await expect(footer).toContainText("רוב הסוחרים הפרטיים מפסידים כסף");
  await footer.scrollIntoViewIfNeeded();
  const nav = page.getByRole("navigation", { name: "ניווט ראשי" }).filter({ visible: true });
  const f = (await footer.boundingBox())!;
  const n = (await nav.boundingBox())!;
  const overlaps = f.y < n.y + n.height && n.y < f.y + f.height;
  expect(overlaps).toBe(false);
});

test("touch targets are at least 44px", async ({ page }) => {
  const targets = page.locator("header a, header button, nav a").filter({ visible: true });
  for (const el of await targets.all()) {
    const box = (await el.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
});

test("the theme toggle switches to dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  await page.getByRole("button", { name: "החלף בין מצב בהיר למצב כהה" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
