import { expect, test } from "@playwright/test";

test("a signed-out visitor is redirected to sign-in", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/sign-in$/);
  await expect(page.getByRole("heading", { level: 1, name: "כניסה" })).toBeVisible();
});

test("protected pages cannot be opened by URL", async ({ page }) => {
  for (const path of ["/roadmap", "/lab", "/journal"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/sign-in$/);
  }
});

test("the page is Hebrew, RTL, and carries the disclaimer", async ({ page }) => {
  await page.goto("/sign-in");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("lang", "he");
  await expect(html).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("contentinfo")).toContainText("לימודי בלבד");
});

test("the sign-in page does not scroll sideways", async ({ page }) => {
  await page.goto("/sign-in");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test("an invalid e-mail gets a Hebrew error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("כתובת מייל").fill("not-an-email");
  await page.getByRole("button", { name: "שלח לי קישור" }).click();
  await expect(page.getByRole("status")).toHaveText("כתובת המייל לא תקינה.");
});

test("the typed e-mail survives an error", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("כתובת מייל").fill("not-an-email");
  await page.getByRole("button", { name: "שלח לי קישור" }).click();
  await expect(page.getByRole("status")).not.toBeEmpty();
  await expect(page.getByLabel("כתובת מייל")).toHaveValue("not-an-email");
});
