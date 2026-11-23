import { expect, test, type Locator } from "@playwright/test";

const HAN = /\p{Script=Han}/u;
const langs = ["en", "zh"] as const;

/** Each figure's image sources, alt text, caption, dark source, and loading. */
async function figures(figure: Locator) {
  return figure.evaluateAll((nodes) =>
    nodes.map((node) => {
      const img = node.querySelector("img") as HTMLImageElement;
      return {
        src: img.getAttribute("src") ?? "",
        currentSrc: img.currentSrc,
        alt: img.alt,
        caption: node.querySelector("figcaption")?.textContent ?? "",
        dark: node.querySelector('source[media="(prefers-color-scheme: dark)"]') !== null,
        loading: img.loading,
        srcset: img.srcset,
      };
    }),
  );
}

for (const lang of langs) {
  const path = `/${lang}/lights-out-factory/`;

  test.describe(`${path} figures`, () => {
    test("shows a diagram in the page's language and a screenshot, with alt text and captions", async ({
      page,
    }) => {
      await page.goto(path);
      const all = await figures(page.locator("article figure"));
      const diagrams = all.filter((f) => f.dark);
      const screenshots = all.filter((f) => !f.dark);
      expect(diagrams.length).toBeGreaterThan(0);
      expect(screenshots.length).toBeGreaterThan(0);
      for (const d of diagrams)
        expect(d.src).toMatch(new RegExp(`\\.${lang}\\.light\\.\\d+\\.webp$`));
      for (const f of all) {
        expect(f.alt.trim()).not.toBe("");
        expect(f.caption.trim()).not.toBe("");
        // Chinese pages write alt text and captions in Chinese, English pages in English.
        expect(HAN.test(f.alt + f.caption)).toBe(lang === "zh");
        expect(f.loading).toBe("lazy");
        expect(f.srcset.split(",")).toHaveLength(2);
      }
    });

    test("loads every figure and follows the theme", async ({ page }) => {
      for (const scheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.goto(path);
        const images = page.locator("article figure img");
        for (const img of await images.all()) {
          await img.scrollIntoViewIfNeeded();
          await expect(img).toHaveJSProperty("complete", true);
          expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
        }
        for (const d of (await figures(page.locator("article figure"))).filter((f) => f.dark)) {
          expect(d.currentSrc).toContain(`.${scheme}.`);
        }
      }
    });

    test("keeps figures readable at 360 px", async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      for (const img of await page.locator("article figure img").all()) {
        // Shrunk by at most a quarter, so 16 px labels stay at 12 px or more.
        const [shown, natural] = await img.evaluate((i: HTMLImageElement) => [
          i.getBoundingClientRect().width,
          Number(i.getAttribute("width")),
        ]);
        expect(shown / natural).toBeGreaterThanOrEqual(0.75);
      }
    });
  });
}

test("shares screenshots between the languages", async ({ page }) => {
  const shots = async (lang: string) => {
    await page.goto(`/${lang}/lights-out-factory/`);
    return (await figures(page.locator("article figure"))).filter((f) => !f.dark).map((f) => f.src);
  };
  expect(await shots("zh")).toEqual(await shots("en"));
});
