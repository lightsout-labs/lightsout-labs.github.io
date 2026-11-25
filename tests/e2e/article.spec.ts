import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parse } from "yaml";

/** The Markdown source of Part 1, as the owner wrote it. */
function source(lang: string): string {
  return readFileSync(`src/content/articles/${lang}/lights-out-factory.md`, "utf8");
}

const pages = [
  {
    lang: "en",
    htmlLang: "en",
    date: "November 20, 2026",
    minutes: /\d+ min read/,
    position: "Part 1 of 12",
  },
  {
    lang: "zh",
    htmlLang: "zh-CN",
    date: "2026年11月20日",
    minutes: /阅读约 \d+ 分钟/,
    position: "第 1 篇，共 12 篇",
  },
] as const;

for (const { lang, htmlLang, date, minutes, position } of pages) {
  const path = `/${lang}/lights-out-factory/`;

  test.describe(path, () => {
    test("shows title, byline, date, reading time, series position and body", async ({ page }) => {
      const { title } = parse(source(lang).split(/^---$/m)[1]);
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", htmlLang);
      await expect(page).toHaveTitle(`${title} | Lightsout Labs`);
      const article = page.getByRole("article");
      await expect(article.getByRole("heading", { level: 1 })).toHaveText(title);
      const meta = article.locator(".meta");
      await expect(meta).toContainText("Lightsout Labs");
      await expect(meta.locator("time")).toHaveText(date);
      await expect(meta).toContainText(minutes);
      await expect(meta).toContainText(position);
      expect(await article.getByRole("heading", { level: 2 }).count()).toBeGreaterThan(2);
      expect(await article.locator("p").count()).toBeGreaterThan(15);
    });

    test("names the 58 unread pull requests in its title and has no table of conclusions", async ({
      page,
    }) => {
      await page.goto(path);
      const article = page.getByRole("article");
      await expect(article.getByRole("heading", { level: 1 })).toContainText("58");
      await expect(article.locator(".body table")).toHaveCount(0);
    });

    test("has no horizontal scroll at 360 px", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBe(0);
    });

    test("follows the system's light or dark theme", async ({ page }) => {
      const colors = async (scheme: "light" | "dark") => {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        return page.evaluate(() => {
          const body = getComputedStyle(document.body);
          return [body.backgroundColor, body.color];
        });
      };
      const [lightBg, lightText] = await colors("light");
      const [darkBg, darkText] = await colors("dark");
      expect(luminance(lightBg)).toBeGreaterThan(0.8);
      expect(luminance(lightText)).toBeLessThan(0.2);
      expect(luminance(darkBg)).toBeLessThan(0.2);
      expect(luminance(darkText)).toBeGreaterThan(0.8);
    });
  });

  test.describe(`${path} without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });

    test("shows the whole article", async ({ page }) => {
      // Every block of the body after the front matter: headings, paragraphs, lists, tables, figures.
      const blocks = source(lang)
        .split(/^---$/m)
        .slice(2)
        .join("---")
        .trim()
        .split(/\n\s*\n/);
      const headings = blocks.filter((b) => b.startsWith("## ")).length;
      const paragraphs = blocks.filter((b) => !/^(#|\d+\. |- |\||!\[)/.test(b)).length;
      const tables = blocks.filter((b) => b.startsWith("|")).length;
      const figures = blocks.filter((b) => b.startsWith("![")).length;
      const last = (blocks.at(-1) ?? "")
        .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/[`*_]/g, "")
        .replace(/\s+/g, " ");
      await page.goto(path);
      const body = page.getByRole("article").locator(".body");
      await expect(body.locator("h2")).toHaveCount(headings);
      await expect(body.locator(":scope > p")).toHaveCount(paragraphs);
      await expect(body.locator("table")).toHaveCount(tables);
      await expect(body.locator(":scope > figure")).toHaveCount(figures);
      await expect(body.locator(":scope > p").last()).toHaveText(last);
    });
  });
}

function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/\d+/g) ?? []).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
