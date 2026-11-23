import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { remark } from "remark";
import { VFile } from "vfile";
import { describe, expect, test } from "vitest";
import remarkFigure from "../../tools/remark-figure/index.ts";

const MANIFEST = {
  "flow.en": {
    width: 300,
    height: 200,
    light: [
      { src: "/figures/flow.en.light.300.webp", width: 300 },
      { src: "/figures/flow.en.light.600.webp", width: 600 },
    ],
    dark: [
      { src: "/figures/flow.en.dark.300.webp", width: 300 },
      { src: "/figures/flow.en.dark.600.webp", width: 600 },
    ],
  },
  "flow.zh": {
    width: 280,
    height: 210,
    light: [{ src: "/figures/flow.zh.light.280.webp", width: 280 }],
    dark: [{ src: "/figures/flow.zh.dark.280.webp", width: 280 }],
  },
  pulls: {
    width: 400,
    height: 700,
    light: [
      { src: "/figures/pulls.400.webp", width: 400 },
      { src: "/figures/pulls.800.webp", width: 800 },
    ],
  },
};

function render(
  markdown: string,
  lang: string,
  path = `/site/src/content/articles/${lang}/one.md`,
): string {
  const manifest = join(mkdtempSync(join(tmpdir(), "remark-figure-")), "figures.json");
  writeFileSync(manifest, JSON.stringify(MANIFEST));
  const file = new VFile({ path, value: markdown });
  return String(remark().use(remarkFigure, { manifest }).processSync(file));
}

describe("remarkFigure", () => {
  test("turns a diagram into a figure in the article's language, with a dark source", () => {
    const html = render(`Before.\n\n![A <flow>](fig:flow 'How it "flows"')\n\nAfter.\n`, "en");
    const sizes = 'sizes="(max-width: 340px) calc(100vw - 40px), 300px"';
    expect(html).toBe(
      "Before.\n\n" +
        "<figure><picture>" +
        '<source media="(prefers-color-scheme: dark)" ' +
        'srcset="/figures/flow.en.dark.300.webp 300w, /figures/flow.en.dark.600.webp 600w" ' +
        `${sizes}>` +
        '<img src="/figures/flow.en.light.300.webp" ' +
        'srcset="/figures/flow.en.light.300.webp 300w, /figures/flow.en.light.600.webp 600w" ' +
        `${sizes} ` +
        'alt="A &lt;flow&gt;" width="300" height="200" loading="lazy" decoding="async">' +
        "</picture><figcaption>How it &quot;flows&quot;</figcaption></figure>\n\n" +
        "After.\n",
    );
    expect(render('![流程](fig:flow "流程图")\n', "zh")).toContain(
      'src="/figures/flow.zh.light.280.webp"',
    );
  });

  test("shares a screenshot between languages, with no dark source", () => {
    const html = render('![合并请求](fig:pulls "合并请求列表")\n', "zh");
    expect(html).not.toContain("<source");
    expect(html).toContain('src="/figures/pulls.400.webp"');
    expect(html).toContain("<figcaption>合并请求列表</figcaption>");
  });

  test("leaves other images alone", () => {
    expect(render("![x](/a.png)\n", "en")).toBe("![x](/a.png)\n");
  });

  test("fails on a figure outside an article, whose language is unknown", () => {
    expect(() => render('![x](fig:flow "x")\n', "", "/site/README.md")).toThrow(
      `figure "flow" in /site/README.md, which is not an article`,
    );
  });

  test("fails on a figure that has not been rendered", () => {
    expect(() => render('![x](fig:missing "x")\n', "en")).toThrow(
      `figure "missing" is not rendered for en; run make figures`,
    );
  });
});
