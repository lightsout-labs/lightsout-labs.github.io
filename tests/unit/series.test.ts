import { describe, expect, test } from "vitest";
import { seriesOf } from "../../src/lib/series/index.ts";

function entry(id: string, part: number, body: string) {
  return {
    id,
    body,
    data: {
      title: `Title of ${id}`,
      description: `Summary of ${id}`,
      date: new Date("2026-11-20"),
      part,
    },
  };
}

const SITE = "https://example.org";

const series = seriesOf(
  [
    entry("en/second", 2, "word ".repeat(231)),
    entry("zh/first", 1, "字".repeat(400)),
    entry("en/first", 1, "word ".repeat(230) + "\n```\n" + "code ".repeat(500) + "\n```\n"),
    entry("zh/second", 2, "字".repeat(401)),
    entry("en/third", 3, "word"),
  ],
  SITE,
);

describe("seriesOf", () => {
  test("lists the articles of one language in series order", () => {
    expect(series.articles("en").map((a) => [a.part, a.slug])).toEqual([
      [1, "first"],
      [2, "second"],
      [3, "third"],
    ]);
    expect(series.articles("zh").map((a) => a.slug)).toEqual(["first", "second"]);
  });

  test("gives each article its metadata and the entry to render", () => {
    const [first] = series.articles("en");
    expect(first).toMatchObject({
      lang: "en",
      slug: "first",
      part: 1,
      title: "Title of en/first",
      description: "Summary of en/first",
      date: new Date("2026-11-20"),
    });
    expect(first.entry.id).toBe("en/first");
  });

  test("reads English at 230 words and Chinese at 400 characters a minute, rounding up", () => {
    const minutes = (lang: "en" | "zh") => series.articles(lang).map((a) => a.minutes);
    expect(minutes("en")).toEqual([1, 2, 1]);
    expect(minutes("zh")).toEqual([1, 2]);
  });
});

describe("neighbours", () => {
  const slugs = (lang: "en" | "zh", slug: string) => {
    const { previous, next } = series.neighbours(lang, slug);
    return [previous?.slug, next?.slug];
  };

  test("links the previous and next article in the same language", () => {
    expect(slugs("en", "second")).toEqual(["first", "third"]);
  });

  test("has no previous article for the first part and no next for the last", () => {
    expect(slugs("en", "first")).toEqual([undefined, "second"]);
    expect(slugs("zh", "second")).toEqual(["first", undefined]);
  });
});

describe("pageMeta", () => {
  test("gives an article its title, summary, canonical URL, and both languages", () => {
    expect(series.pageMeta({ lang: "zh", slug: "first" })).toMatchObject({
      lang: "zh-CN",
      title: "Title of zh/first | Lightsout Labs",
      description: "Summary of zh/first",
      canonical: `${SITE}/zh/first/`,
      alternates: [
        { hreflang: "en", href: `${SITE}/en/first/` },
        { hreflang: "zh-CN", href: `${SITE}/zh/first/` },
      ],
      switchTo: { hreflang: "en", href: "/en/first/", label: "English" },
      feeds: [{ hreflang: "zh-CN", href: "/zh/rss.xml", label: "RSS 订阅" }],
    });
  });

  test("lists only the article's own language when it has no counterpart", () => {
    const meta = series.pageMeta({ lang: "en", slug: "third" });
    expect(meta.alternates).toEqual([{ hreflang: "en", href: `${SITE}/en/third/` }]);
    expect(meta.switchTo).toEqual({ hreflang: "zh-CN", href: "/zh/", label: "中文" });
  });

  test("describes an article as a BlogPosting by Lightsout Labs", () => {
    expect(JSON.parse(series.pageMeta({ lang: "en", slug: "first" }).jsonLd ?? "")).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Title of en/first",
      description: "Summary of en/first",
      datePublished: "2026-11-20",
      author: { "@type": "Organization", name: "Lightsout Labs" },
      inLanguage: "en",
      url: `${SITE}/en/first/`,
      mainEntityOfPage: `${SITE}/en/first/`,
    });
  });

  test("keeps a title from closing the script element that holds the JSON-LD", () => {
    const risky = seriesOf(
      [
        {
          ...entry("en/risky", 1, "word"),
          data: { ...entry("en/risky", 1, "").data, title: "a </script> b" },
        },
      ],
      SITE,
    );
    const json = risky.pageMeta({ lang: "en", slug: "risky" }).jsonLd ?? "";
    expect(json).not.toContain("</");
    expect(JSON.parse(json).headline).toBe("a </script> b");
  });

  test("gives the indexes and the root page both languages and the root as the default", () => {
    const alternates = [
      { hreflang: "en", href: `${SITE}/en/` },
      { hreflang: "zh-CN", href: `${SITE}/zh/` },
      { hreflang: "x-default", href: `${SITE}/` },
    ];
    const en = series.pageMeta({ lang: "en" });
    expect(en).toMatchObject({
      lang: "en",
      canonical: `${SITE}/en/`,
      alternates,
      switchTo: { hreflang: "zh-CN", href: "/zh/", label: "中文" },
      feeds: [{ hreflang: "en", href: "/en/rss.xml", label: "RSS feed" }],
    });
    expect(en.jsonLd).toBeUndefined();
    const root = series.pageMeta({});
    expect(root).toMatchObject({ lang: "en", canonical: `${SITE}/`, alternates });
    expect(root.switchTo).toBeUndefined();
    expect(root.feeds.map((f) => f.href)).toEqual(["/en/rss.xml", "/zh/rss.xml"]);
  });

  test("gives every page a different title and description", () => {
    const metas = [
      series.pageMeta({}),
      series.pageMeta({ lang: "en" }),
      series.pageMeta({ lang: "zh" }),
      series.pageMeta({ lang: "en", slug: "first" }),
      series.pageMeta({ lang: "zh", slug: "first" }),
    ];
    expect(new Set(metas.map((m) => m.title)).size).toBe(metas.length);
    expect(new Set(metas.map((m) => m.description)).size).toBe(metas.length);
  });
});
