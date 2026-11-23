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
