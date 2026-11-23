// A remark plugin that turns `![alt](fig:name "caption")` into a <figure>
// with the images `make figures` rendered: the article's language, light and
// dark, at two widths, lazy-loaded (R10-R14, R29).
import { readFileSync } from "node:fs";

interface Image {
  src: string;
  width: number;
}

/** One rendered figure, as `make figures` writes it to its manifest. */
export interface Rendered {
  width: number;
  height: number;
  light: Image[];
  dark?: Image[];
}

interface Node {
  type: string;
  url?: string;
  alt?: string | null;
  title?: string | null;
  value?: string;
  children?: Node[];
}

interface File {
  path?: string;
}

/** The page's side padding, which a figure on a narrow screen loses. */
const GUTTER = 40;

export default function remarkFigure({ manifest }: { manifest: string }) {
  return (tree: Node, file: File) => {
    let figures: Record<string, Rendered> | undefined;
    const lang = file.path?.match(/[/\\]articles[/\\](en|zh)[/\\]/)?.[1] ?? "en";
    const children = tree.children ?? [];
    for (const [index, node] of children.entries()) {
      const image = node.type === "paragraph" && node.children?.length === 1 && node.children[0];
      if (!image || image.type !== "image" || !image.url?.startsWith("fig:")) continue;
      const name = image.url.slice("fig:".length);
      figures ??= JSON.parse(readFileSync(manifest, "utf8")) as Record<string, Rendered>;
      const rendered = figures[`${name}.${lang}`] ?? figures[name];
      if (!rendered)
        throw new Error(`figure "${name}" is not rendered for ${lang}; run make figures`);
      children[index] = {
        type: "html",
        value: figure(rendered, image.alt ?? "", image.title ?? ""),
      };
    }
  };
}

function figure({ width, height, light, dark }: Rendered, alt: string, caption: string): string {
  const srcset = (images: Image[]) => images.map((i) => `${i.src} ${i.width}w`).join(", ");
  const sizes = `(max-width: ${width + GUTTER}px) calc(100vw - ${GUTTER}px), ${width}px`;
  const source = dark
    ? `<source media="(prefers-color-scheme: dark)" srcset="${srcset(dark)}" sizes="${sizes}">`
    : "";
  return (
    `<figure><picture>${source}` +
    `<img src="${light[0].src}" srcset="${srcset(light)}" sizes="${sizes}" ` +
    `alt="${escape(alt)}" width="${width}" height="${height}" loading="lazy" decoding="async">` +
    `</picture><figcaption>${escape(caption)}</figcaption></figure>`
  );
}

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
