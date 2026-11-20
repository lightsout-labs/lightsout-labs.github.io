import { expect, test } from "@playwright/test";

const pages = [
  { lang: "en", heading: "The series", empty: "No articles yet." },
  { lang: "zh", heading: "系列文章", empty: "暂无文章。" },
] as const;

for (const { lang, heading, empty } of pages) {
  test.describe(`/${lang}/`, () => {
    test("shows the blog's name and an empty series in its language", async ({ page }) => {
      await page.goto(`/${lang}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", lang === "zh" ? "zh-CN" : "en");
      await expect(page.getByRole("banner")).toContainText("Lightsout Labs");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.getByRole("main")).toContainText(empty);
    });

    test("has no horizontal scroll at 360 px", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(`/${lang}/`);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });

    test("follows the system's light or dark theme", async ({ page }) => {
      const background = async (scheme: "light" | "dark") => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(`/${lang}/`);
        return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      };
      const light = await background("light");
      const dark = await background("dark");
      expect(luminance(light)).toBeGreaterThan(0.8);
      expect(luminance(dark)).toBeLessThan(0.2);
    });
  });
}

function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/\d+/g) ?? []).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
