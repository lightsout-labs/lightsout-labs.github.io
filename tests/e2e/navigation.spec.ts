import { expect, test } from "@playwright/test";

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

  test(`Part 1 in ${lang} shows its position and no link before it`, async ({ page }) => {
    await page.goto(`/${lang}/lights-out-factory/`);
    const nav = page.getByRole("navigation", { name: /series|系列/i });
    await expect(nav).toBeVisible();
    // Part 1 is first; a next link appears only once Part 2 is published.
    await expect(nav.locator('a[rel="prev"]')).toHaveCount(0);
    await expect(page.locator(".meta")).toContainText(lang === "en" ? "Part 1 of 12" : "第 1 篇");
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
    expect(feed.items).toHaveLength(1);
    const [item] = feed.items;
    expect(item.link).toBe(`${SITE}/${lang}/lights-out-factory/`);
    expect(item.title).not.toBe("");
    expect(item.description).not.toBe("");
    expect(new Date(item.pubDate).toISOString().slice(0, 10)).toBe("2026-11-20");
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
