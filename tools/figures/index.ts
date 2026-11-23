// The figure renderer: draws every Mermaid diagram in Chromium with the
// site's light and dark palettes and the bundled Noto Sans SC, resizes every
// screenshot, and writes WebP at two widths plus a manifest to
// public/figures/, one light PNG per figure for social posts, and a share
// card for each article and for the blog (R11, R12, R14-R16, R28, ADR 0002).
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Browser, type Page } from "@playwright/test";
import sharp from "sharp";
import { parse } from "yaml";
import { SHARE_CARD, shareCard, type Lang } from "../../src/lib/series/index.ts";
import type { Rendered } from "../remark-figure/index.ts";

const OUT = "public/figures";
const ORIGIN = "http://figures.local";
/** Diagrams are drawn, and screenshots taken, at twice their CSS size. */
const SCALE = 2;

const modules = fileURLToPath(new URL("../../node_modules/", import.meta.url));
const FILES: Record<string, string> = {
  "/mermaid.js": join(modules, "mermaid/dist/mermaid.min.js"),
  "/font/": join(modules, "@fontsource/noto-sans-sc/"),
};

const FONT = '"Noto Sans SC", sans-serif';
/** The site's colors from src/styles/global.css, with a node fill between page and rule. */
const THEMES = {
  light: { bg: "#fdfdfc", text: "#1f2328", line: "#59636e", fill: "#eef1f4" },
  dark: { bg: "#16181c", text: "#e6e8eb", line: "#a3acb6", fill: "#24292f" },
};
type Theme = keyof typeof THEMES;

/** Renders every figure under `repo`/figures into `repo`/public/figures, replacing what is there. */
export async function renderFigures(repo: string): Promise<void> {
  const out = join(repo, OUT);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const manifest: Record<string, Rendered> = {};

  const browser = await chromium.launch();
  try {
    const diagrams = join(repo, "figures/diagrams");
    const sources = list(diagrams, ".mmd");
    if (sources.length > 0) {
      const page = await open(browser, PAGE, { deviceScaleFactor: SCALE });
      for (const file of sources) {
        const key = file.slice(0, -".mmd".length);
        const source = readFileSync(join(diagrams, file), "utf8");
        const png = await drawDiagram(page, source, "light");
        await writePng(png, out, key);
        const light = await write(png, out, `${key}.light`);
        const dark = await write(await drawDiagram(page, source, "dark"), out, `${key}.dark`);
        const { width, height } = light;
        manifest[key] = { width, height, light: light.images, dark: dark.images };
      }
    }

    const card = await open(browser, CARD, { viewport: SHARE_CARD });
    await drawCard(card, BLOG, "en", join(out, "..", shareCard()));
    for (const { lang, slug, title } of articles(repo)) {
      await drawCard(card, title, lang, join(out, "..", shareCard({ lang, slug }))).catch(
        (error: Error) => {
          throw new Error(`${lang}/${slug}: ${error.message}`);
        },
      );
    }
  } finally {
    await browser.close();
  }

  const screenshots = join(repo, "figures/screenshots");
  for (const file of list(screenshots, ".png")) {
    const key = file.slice(0, -".png".length);
    const png = readFileSync(join(screenshots, file));
    await writePng(png, out, key);
    const { width, height, images } = await write(png, out, key);
    manifest[key] = { width, height, light: images };
  }

  writeFileSync(join(out, "figures.json"), JSON.stringify(manifest, null, 2) + "\n");
}

function list(dir: string, extension: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => extname(n) === extension)
        .sort()
    : [];
}

/** A page of `html` served from a made-up origin, with Mermaid and the font from node_modules. */
async function open(
  browser: Browser,
  html: string,
  options: Parameters<Browser["newPage"]>[0],
): Promise<Page> {
  const page = await browser.newPage(options);
  await page.route(`${ORIGIN}/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/") return route.fulfill({ contentType: "text/html", body: html });
    const prefix = Object.keys(FILES).find((p) => path.startsWith(p));
    if (!prefix) return route.fulfill({ status: 404 });
    return route.fulfill({ path: FILES[prefix] + path.slice(prefix.length) });
  });
  await page.goto(`${ORIGIN}/`);
  return page;
}

/** Every article's language, slug, and title, from the front matter. */
function articles(repo: string): { lang: Lang; slug: string; title: string }[] {
  return (["en", "zh"] as const).flatMap((lang) => {
    const dir = join(repo, "src/content/articles", lang);
    return list(dir, ".md").map((file) => {
      const text = readFileSync(join(dir, file), "utf8");
      const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
      const { title } = (parse(front) ?? {}) as { title?: string };
      return { lang, slug: file.slice(0, -".md".length), title: String(title ?? "") };
    });
  });
}

/** The blog's own card, for the root page and the indexes: the series name in both languages. */
const BLOG = "The lights-out software factory\n熄灯软件工厂";

/** Title sizes in CSS pixels, largest first; at 48 px a card shown 400 px wide still has 16 px text. */
const TITLE_SIZES = [76, 72, 68, 64, 60, 56, 52, 48];

/**
 * The share card: the title on the site's dark colors, and the Lightsout Labs
 * name beside the favicon's mark, at the size Open Graph and X show.
 */
const CARD = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="/font/400.css">
<link rel="stylesheet" href="/font/700.css">
<style>
  body { margin: 0; width: ${SHARE_CARD.width}px; height: ${SHARE_CARD.height}px;
    background: #16181c; color: #e6e8eb; font-family: ${FONT};
    display: flex; flex-direction: column; padding: 72px 80px; box-sizing: border-box; }
  #title { flex: 1; margin: 0; overflow: hidden; font-weight: 700; line-height: 1.25;
    white-space: pre-line; overflow-wrap: anywhere; }
  footer { display: flex; align-items: center; gap: 20px; font-size: 40px; font-weight: 700; }
  .mark { width: 40px; height: 40px; border-radius: 50%; background: #8ab4f8; }
</style>
</head><body><h1 id="title"></h1><footer><span class="mark"></span>Lightsout Labs</footer></body></html>`;

/** Draws `title` in the largest size that fits and writes the card to `file` as PNG. */
async function drawCard(page: Page, title: string, lang: Lang, file: string): Promise<void> {
  const fits = await page.evaluate(
    async ({ title, lang, sizes, font }) => {
      document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
      const heading = document.getElementById("title") as HTMLElement;
      heading.textContent = title;
      await document.fonts.load(`700 16px ${font}`, title + "Lightsout Labs");
      return sizes.some((size) => {
        heading.style.fontSize = `${size}px`;
        return heading.scrollHeight <= heading.clientHeight;
      });
    },
    { title, lang, sizes: TITLE_SIZES, font: FONT },
  );
  if (!fits) {
    throw new Error(`the title does not fit a share card at ${TITLE_SIZES.at(-1)} px`);
  }
  mkdirSync(join(file, ".."), { recursive: true });
  await sharp(await page.screenshot())
    .png({ compressionLevel: 9 })
    .toFile(file);
}

/** The page diagrams are drawn in: Mermaid and the font, served from node_modules. */
const PAGE = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="/font/400.css">
<script src="/mermaid.js"></script>
<style>body { margin: 0; } #figure { display: inline-block; padding: 8px; }</style>
</head><body><div id="figure"></div></body></html>`;

async function drawDiagram(page: Page, source: string, theme: Theme): Promise<Buffer> {
  const { bg, text, line, fill } = THEMES[theme];
  await page.evaluate(
    async ({ source, bg, text, line, fill, font }) => {
      // Load the font's glyphs for this text first, so Mermaid measures with it.
      await document.fonts.load(`16px ${font}`, source);
      const mermaid = (window as unknown as { mermaid: MermaidApi }).mermaid;
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        fontFamily: font,
        // Draw at natural size; the page scales the image, not Mermaid.
        flowchart: { useMaxWidth: false, nodeSpacing: 24 },
        themeVariables: {
          fontFamily: font,
          fontSize: "16px",
          background: bg,
          primaryColor: fill,
          primaryTextColor: text,
          primaryBorderColor: line,
          lineColor: line,
          textColor: text,
          edgeLabelBackground: bg,
        },
      });
      const { svg } = await mermaid.render("diagram", source);
      document.body.style.background = bg;
      (document.getElementById("figure") as HTMLElement).innerHTML = svg;
    },
    { source, bg, text, line, fill, font: FONT },
  );
  return page.locator("#figure").screenshot();
}

interface MermaidApi {
  initialize(config: object): void;
  render(id: string, source: string): Promise<{ svg: string }>;
}

/** Writes `png`, drawn at SCALE, as WebP at its CSS width and at SCALE times it. */
async function write(png: Buffer, out: string, key: string) {
  const meta = await sharp(png).metadata();
  const width = Math.round(meta.width / SCALE);
  const height = Math.round(meta.height / SCALE);
  const images = [];
  for (const w of [width, width * SCALE]) {
    const name = `${key}.${w}.webp`;
    await sharp(png).resize({ width: w }).webp({ quality: 82 }).toFile(join(out, name));
    images.push({ src: `/figures/${name}`, width: w });
  }
  return { width, height, images };
}

/** Writes `png` at full resolution as `<key>.png`, the file a social post uploads. */
async function writePng(png: Buffer, out: string, key: string): Promise<void> {
  await sharp(png)
    .png({ compressionLevel: 9 })
    .toFile(join(out, `${key}.png`));
}
