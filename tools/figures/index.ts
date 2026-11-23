// The figure renderer: draws every Mermaid diagram in Chromium with the
// site's light and dark palettes and the bundled Noto Sans SC, resizes every
// screenshot, and writes WebP at two widths plus a manifest to
// public/figures/ (R11, R12, R14, ADR 0002).
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";
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

  const diagrams = join(repo, "figures/diagrams");
  const sources = list(diagrams, ".mmd");
  if (sources.length > 0) {
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage({ deviceScaleFactor: SCALE });
      await page.route(`${ORIGIN}/**`, (route) => {
        const path = new URL(route.request().url()).pathname;
        if (path === "/") return route.fulfill({ contentType: "text/html", body: PAGE });
        const prefix = Object.keys(FILES).find((p) => path.startsWith(p));
        if (!prefix) return route.fulfill({ status: 404 });
        return route.fulfill({ path: FILES[prefix] + path.slice(prefix.length) });
      });
      await page.goto(`${ORIGIN}/`);
      for (const file of sources) {
        const key = file.slice(0, -".mmd".length);
        const source = readFileSync(join(diagrams, file), "utf8");
        const light = await write(await drawDiagram(page, source, "light"), out, `${key}.light`);
        const dark = await write(await drawDiagram(page, source, "dark"), out, `${key}.dark`);
        const { width, height } = light;
        manifest[key] = { width, height, light: light.images, dark: dark.images };
      }
    } finally {
      await browser.close();
    }
  }

  const screenshots = join(repo, "figures/screenshots");
  for (const file of list(screenshots, ".png")) {
    const key = file.slice(0, -".png".length);
    const { width, height, images } = await write(readFileSync(join(screenshots, file)), out, key);
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
        sequence: { useMaxWidth: false },
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
