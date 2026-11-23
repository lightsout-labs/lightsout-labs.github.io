import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { expect, test } from "vitest";
import SeriesNav from "../../src/components/SeriesNav.astro";

/** The rendered navigation's links, as rel, href, and text. */
async function links(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  const html = await container.renderToString(SeriesNav, { props });
  return [...html.matchAll(/<a ([^>]*)>(.*?)<\/a>/gs)].map(([, attrs, inner]) => ({
    rel: /rel="([^"]*)"/.exec(attrs)?.[1],
    href: /href="([^"]*)"/.exec(attrs)?.[1],
    text: inner
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  }));
}

test("links the previous and next part and the index", async () => {
  expect(
    await links({
      lang: "en",
      previous: { slug: "one", title: "Part one" },
      next: { slug: "three", title: "Part three" },
    }),
  ).toEqual([
    { rel: "prev", href: "/en/one/", text: "Previous Part one" },
    { rel: "next", href: "/en/three/", text: "Next Part three" },
    { rel: undefined, href: "/en/", text: "All parts" },
  ]);
});

test("leaves out a neighbour that does not exist", async () => {
  expect(await links({ lang: "zh", next: { slug: "two", title: "第二篇" } })).toEqual([
    { rel: "next", href: "/zh/two/", text: "下一篇 第二篇" },
    { rel: undefined, href: "/zh/", text: "全部文章" },
  ]);
});
