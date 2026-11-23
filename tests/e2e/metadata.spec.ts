import { readdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { parse } from "yaml";

const SITE = "https://lightsout-labs.github.io";
/** The root page, both indexes, and every article. */
const paths = [
  "/",
  ...["en", "zh"].flatMap((lang) => [
    `/${lang}/`,
    ...readdirSync(`src/content/articles/${lang}`).map(
      (f) => `/${lang}/${f.replace(/\.md$/, "")}/`,
    ),
  ]),
];

/** The search metadata in a page's head. */
async function metadata(page: Page) {
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "",
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
    alternates: Object.fromEntries(
      [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => [
        l.getAttribute("hreflang"),
        l.getAttribute("href"),
      ]),
    ),
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) =>
      JSON.parse(s.textContent ?? ""),
    ),
  }));
}

test.describe("without JavaScript", () => {
  // The root page would otherwise redirect before it can be read.
  test.use({ javaScriptEnabled: false });

  test("every page has its own title and description, a canonical URL, and hreflang links", async ({
    page,
  }) => {
    const seen = [];
    for (const path of paths) {
      await page.goto(path);
      const meta = await metadata(page);
      expect(meta.title, path).not.toBe("");
      expect(meta.description, path).not.toBe("");
      expect(meta.canonical, path).toBe(`${SITE}${path}`);
      const counterpart = path === "/" ? "/{lang}/" : path.replace(/^\/(en|zh)\//, "/{lang}/");
      expect(meta.alternates, path).toMatchObject({
        en: `${SITE}${counterpart.replace("{lang}", "en")}`,
        "zh-CN": `${SITE}${counterpart.replace("{lang}", "zh")}`,
      });
      seen.push(meta);
    }
    expect(new Set(seen.map((m) => m.title)).size).toBe(paths.length);
    expect(new Set(seen.map((m) => m.description)).size).toBe(paths.length);
  });

  for (const lang of ["en", "zh"] as const) {
    test(`the ${lang} article carries BlogPosting data`, async ({ page }) => {
      const source = readFileSync(`src/content/articles/${lang}/lights-out-factory.md`, "utf8");
      const { title, description } = parse(source.split(/^---$/m)[1]);
      await page.goto(`/${lang}/lights-out-factory/`);
      const { jsonLd } = await metadata(page);
      expect(jsonLd).toEqual([
        expect.objectContaining({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: title,
          description,
          datePublished: "2026-11-20",
          author: { "@type": "Organization", name: "Lightsout Labs" },
          inLanguage: lang === "en" ? "en" : "zh-CN",
        }),
      ]);
    });
  }
});

// Without JavaScript, so the root page does not redirect before its tags are read.
test.describe("share tags", () => {
  test.use({ javaScriptEnabled: false });

  test("every page carries Open Graph and X card tags whose image is served (R28)", async ({
    page,
    request,
  }) => {
    for (const path of paths) {
      await page.goto(path);
      const tag = (key: string) =>
        page.locator(`meta[property="${key}"], meta[name="${key}"]`).getAttribute("content");
      const image = (await tag("og:image")) ?? "";
      // An article has its own card; the root page and the indexes share the blog's.
      const article = path.match(/^\/(en|zh)\/(.+)\/$/);
      const card = article ? `${article[1]}/${article[2]}` : "blog";
      expect(image, path).toBe(`${SITE}/figures/share/${card}.png`);
      expect(await tag("twitter:image"), path).toBe(image);
      expect(await tag("twitter:card"), path).toBe("summary_large_image");
      expect(await tag("og:title"), path).toMatch(/\S/);
      const response = await request.get(image.slice(SITE.length));
      expect([path, response.status(), response.headers()["content-type"]]).toEqual([
        path,
        200,
        "image/png",
      ]);
    }
  });
});

test("sitemap.xml lists every page with its language alternates", async ({ page, request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const sitemap = await page.evaluate((text) => {
    const doc = new DOMParser().parseFromString(text, "application/xml");
    return {
      error: doc.querySelector("parsererror") !== null,
      urls: [...doc.getElementsByTagName("url")].map((url) => ({
        loc: url.getElementsByTagName("loc")[0]?.textContent,
        alternates: url.getElementsByTagName("xhtml:link").length,
      })),
    };
  }, xml);
  expect(sitemap.error).toBe(false);
  expect(sitemap.urls.map((u) => u.loc).sort()).toEqual(paths.map((p) => `${SITE}${p}`).sort());
  for (const url of sitemap.urls) expect(url.alternates, url.loc ?? "").toBeGreaterThanOrEqual(2);
});

test("robots.txt allows crawling and names the sitemap", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.status()).toBe(200);
  const text = await response.text();
  expect(text).toMatch(/^User-agent: \*$/m);
  expect(text).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});
