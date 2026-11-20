import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parse } from "yaml";

const pages = [
  { lang: "en", heading: "The series", date: "November 20, 2026", minutes: /\d+ min read/ },
  { lang: "zh", heading: "系列文章", date: "2026年11月20日", minutes: /阅读约 \d+ 分钟/ },
] as const;

for (const { lang, heading, date, minutes } of pages) {
  test.describe(`/${lang}/`, () => {
    test("lists Part 1 with title, summary, date and reading time", async ({ page }) => {
      const source = readFileSync(`src/content/articles/${lang}/lights-out-factory.md`, "utf8");
      const { title, description } = parse(source.split(/^---$/m)[1]);
      await page.goto(`/${lang}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", lang === "zh" ? "zh-CN" : "en");
      await expect(page.getByRole("banner")).toContainText("Lightsout Labs");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      const item = page.getByRole("main").getByRole("listitem").first();
      await expect(item.getByRole("link", { name: title })).toHaveAttribute(
        "href",
        `/${lang}/lights-out-factory/`,
      );
      await expect(item).toContainText(description);
      await expect(item.locator("time")).toHaveText(date);
      await expect(item).toContainText(minutes);
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
