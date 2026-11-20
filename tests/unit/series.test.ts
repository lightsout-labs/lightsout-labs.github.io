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

const series = seriesOf([
  entry("en/second", 2, "word ".repeat(231)),
  entry("zh/first", 1, "字".repeat(400)),
  entry("en/first", 1, "word ".repeat(230) + "\n```\n" + "code ".repeat(500) + "\n```\n"),
  entry("zh/second", 2, "字".repeat(401)),
]);

describe("seriesOf", () => {
  test("lists the articles of one language in series order", () => {
    expect(series.articles("en").map((a) => [a.part, a.slug])).toEqual([
      [1, "first"],
      [2, "second"],
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
    expect(minutes("en")).toEqual([1, 2]);
    expect(minutes("zh")).toEqual([1, 2]);
  });
});
