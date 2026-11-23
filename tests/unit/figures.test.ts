import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { expect, test } from "vitest";
import { renderFigures } from "../../tools/figures/index.ts";

interface Entry {
  width: number;
  height: number;
  light: { src: string; width: number }[];
  dark?: { src: string; width: number }[];
}

async function fixture(): Promise<string> {
  const root = mkdtempSync(join(tmpdir(), "figures-"));
  mkdirSync(join(root, "figures/diagrams"), { recursive: true });
  mkdirSync(join(root, "figures/screenshots"), { recursive: true });
  writeFileSync(
    join(root, "figures/diagrams/flow.en.mmd"),
    "flowchart TD\n  a[Write] --> b[Check]\n",
  );
  writeFileSync(
    join(root, "figures/diagrams/flow.zh.mmd"),
    "flowchart TD\n  a[编写] --> b[检查]\n",
  );
  // Screenshots are taken at a device scale factor of 2.
  await sharp({ create: { width: 400, height: 300, channels: 3, background: "#808080" } })
    .png()
    .toFile(join(root, "figures/screenshots/shot.png"));
  return root;
}

async function brightness(root: string, src: string): Promise<number> {
  const { channels } = await sharp(join(root, "public", src)).stats();
  return channels[0].mean;
}

test("renders diagrams per language and theme, and screenshots, at two widths", async () => {
  const root = await fixture();
  await renderFigures(root);
  const manifest: Record<string, Entry> = JSON.parse(
    readFileSync(join(root, "public/figures/figures.json"), "utf8"),
  );
  expect(Object.keys(manifest).sort()).toEqual(["flow.en", "flow.zh", "shot"]);

  for (const entry of Object.values(manifest)) {
    for (const images of [entry.light, entry.dark ?? []]) {
      expect(images.map((i) => i.width)).toEqual(
        images.length ? [entry.width, entry.width * 2] : [],
      );
      for (const image of images) {
        const meta = await sharp(join(root, "public", image.src)).metadata();
        expect([meta.format, meta.width]).toEqual(["webp", image.width]);
      }
    }
  }

  const flow = manifest["flow.en"];
  expect(await brightness(root, flow.light[0].src)).toBeGreaterThan(200);
  expect(await brightness(root, flow.dark?.[0].src ?? "")).toBeLessThan(60);

  // One light PNG per figure at full resolution, for social posts (R15, R16).
  for (const key of ["flow.en", "flow.zh", "shot"]) {
    const meta = await sharp(join(root, `public/figures/${key}.png`)).metadata();
    expect([meta.format, meta.width]).toEqual(["png", manifest[key].width * 2]);
  }
  expect(await brightness(root, "/figures/flow.en.png")).toBeGreaterThan(200);

  expect(manifest.shot).toMatchObject({ width: 200, height: 150 });
  expect(manifest.shot.dark).toBeUndefined();
}, 60_000);

function article(root: string, lang: string, slug: string, title: string) {
  mkdirSync(join(root, "src/content/articles", lang), { recursive: true });
  writeFileSync(
    join(root, "src/content/articles", lang, `${slug}.md`),
    `---\ntitle: ${JSON.stringify(title)}\ndescription: "A summary"\ndate: 2026-11-20\npart: 1\n---\n\nBody.\n`,
  );
}

test("draws a share card for each article in its language and one for the blog (R28)", async () => {
  const root = mkdtempSync(join(tmpdir(), "share-"));
  article(root, "en", "first", "Nobody Reviewed These Pull Requests");
  article(root, "zh", "first", "代码和测试都是智能体写的");
  await renderFigures(root);

  const cards = ["share/en/first.png", "share/zh/first.png", "share/blog.png"];
  for (const card of cards) {
    const meta = await sharp(join(root, "public/figures", card)).metadata();
    expect([card, meta.format, meta.width, meta.height]).toEqual([card, "png", 1200, 630]);
  }
  const before = readFileSync(join(root, "public/figures/share/en/first.png"));
  expect(before.equals(readFileSync(join(root, "public/figures/share/zh/first.png")))).toBe(false);

  // A changed title gives a changed card on the next run.
  article(root, "en", "first", "Somebody Reviewed These Pull Requests");
  await renderFigures(root);
  expect(before.equals(readFileSync(join(root, "public/figures/share/en/first.png")))).toBe(false);
}, 60_000);

test("refuses a title too long to read on a share card", async () => {
  const root = mkdtempSync(join(tmpdir(), "share-"));
  article(root, "en", "long", "A title that goes on and on ".repeat(12));
  await expect(renderFigures(root)).rejects.toThrow(/en\/long/);
}, 60_000);
