import { expect, test } from "@playwright/test";

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, locale: "zh-CN" });

  test("the root page stays and links to both languages", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.locator('a[href="/en/"]')).toBeVisible();
    await expect(page.locator('a[href="/zh/"]')).toBeVisible();
  });
});

for (const [locale, lang] of [
  ["zh-CN", "zh"],
  ["zh-TW", "zh"],
  ["en-US", "en"],
  ["fr-FR", "en"],
] as const) {
  test.describe(`a browser preferring ${locale}`, () => {
    test.use({ locale });

    test(`lands on /${lang}/`, async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(`/${lang}/`);
    });
  });
}
