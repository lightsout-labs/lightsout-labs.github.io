import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { parse } from "yaml";

/** The published articles of a language, in series order, from their sources. */
function articles(lang: string) {
  const dir = `src/content/articles/${lang}`;
  return readdirSync(dir)
    .map((file) => {
      const { part, date } = parse(readFileSync(`${dir}/${file}`, "utf8").split(/^---$/m)[1]);
      return { slug: file.replace(/\.md$/, ""), part: part as number, date: String(date) };
    })
    .sort((a, b) => a.part - b.part);
}

const SITE = "https://lightsout-labs.github.io";
const other = { en: "zh", zh: "en" } as const;

for (const lang of ["en", "zh"] as const) {
  const pages = [`/${lang}/`, `/${lang}/lights-out-factory/`];

  test.describe(`/${lang}/ pages`, () => {
    test("switch to the same page in the other language", async ({ page }) => {
      for (const path of pages) {
        await page.goto(path);
        await page
          .getByRole("navigation", { name: /language|语言/i })
          .getByRole("link")
          .click();
        await expect(page).toHaveURL(path.replace(`/${lang}/`, `/${other[lang]}/`));
      }
    });

    test("link the feed of their language", async ({ page }) => {
      for (const path of pages) {
        await page.goto(path);
        await expect(
          page.locator('link[rel="alternate"][type="application/rss+xml"]'),
        ).toHaveAttribute("href", `/${lang}/rss.xml`);
        await expect(page.locator(`footer a[href="/${lang}/rss.xml"]`)).toBeVisible();
      }
    });
  });

  test(`${lang} articles link the parts before and after them`, async ({ page }) => {
    const parts = articles(lang);
    for (const [i, { slug }] of parts.entries()) {
      await page.goto(`/${lang}/${slug}/`);
      const nav = page.getByRole("navigation", { name: /series|系列/i });
      await expect(
        nav.getByRole("link", { name: lang === "en" ? "All parts" : "全部文章" }),
      ).toBeVisible();
      for (const [rel, neighbour] of [
        ["prev", parts[i - 1]],
        ["next", parts[i + 1]],
      ] as const) {
        const link = nav.locator(`a[rel="${rel}"]`);
        if (neighbour) await expect(link).toHaveAttribute("href", `/${lang}/${neighbour.slug}/`);
        else await expect(link).toHaveCount(0);
      }
    }
  });

  test(`/${lang}/rss.xml is valid RSS listing the ${lang} articles`, async ({ page, request }) => {
    const response = await request.get(`/${lang}/rss.xml`);
    expect(response.status()).toBe(200);
    const xml = await response.text();
    const feed = await page.evaluate((text) => {
      const doc = new DOMParser().parseFromString(text, "application/xml");
      const pick = (el: Element, name: string) => el.querySelector(name)?.textContent ?? "";
      const channel = doc.querySelector("rss > channel");
      return {
        error: doc.querySelector("parsererror") !== null,
        version: doc.documentElement.getAttribute("version"),
        channel: channel && {
          title: pick(channel, "title"),
          link: pick(channel, "link"),
          description: pick(channel, "description"),
        },
        items: [...doc.querySelectorAll("item")].map((item) => ({
          title: pick(item, "title"),
          link: pick(item, "link"),
          pubDate: pick(item, "pubDate"),
          description: pick(item, "description"),
        })),
      };
    }, xml);
    expect(feed.error).toBe(false);
    expect(feed.version).toBe("2.0");
    expect(feed.channel?.title).toContain("Lightsout Labs");
    expect(feed.channel?.link).toBe(`${SITE}/${lang}/`);
    expect(feed.channel?.description).not.toBe("");
    expect(feed.items.map((i) => i.link)).toEqual(
      articles(lang).map((a) => `${SITE}/${lang}/${a.slug}/`),
    );
    const item = feed.items[feed.items.length - 1];
    expect(item.title).not.toBe("");
    expect(item.description).not.toBe("");
    expect(new Date(item.pubDate).toISOString().slice(0, 10)).toBe(articles(lang).at(-1)?.date);
  });
}

test.describe("the root page without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("links both feeds", async ({ page }) => {
    await page.goto("/");
    const feeds = page.locator('link[rel="alternate"][type="application/rss+xml"]');
    await expect(feeds).toHaveCount(2);
  });
});
