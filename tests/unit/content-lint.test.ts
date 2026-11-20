import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vitest";
import { articleLength, lint } from "../../tools/content-lint/index.ts";

const GUIDE = `# Style guide

Prose around the blocks is ignored.

\`\`\`style-rules-en
# Banned words and phrases
ban: synergy
ban: it's worth noting
pattern: \\bin conclusion\\b
limit: em-dash 2
limit: bold 1
limit: bullet-lists 1
\`\`\`

\`\`\`style-rules-zh
ban: 赋能
pattern: 不仅.{0,20}更是
limit: em-dash 1
limit: bold 1
limit: bullet-lists 1
\`\`\`
`;

const EN = "src/content/articles/en";
const ZH = "src/content/articles/zh";

function repo(files: Record<string, string>, guide = GUIDE): string {
  const root = mkdtempSync(join(tmpdir(), "content-lint-"));
  for (const [path, text] of Object.entries({ "docs/style-guide.md": guide, ...files })) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  return root;
}

const FRONT = `---
title: "A title"
description: "A summary."
date: 2026-11-20
part: 1
---
`;

/** English prose of `count` words, twelve to a line. */
function words(count: number): string {
  const lines: string[] = [];
  for (let i = 0; i < count; i += 12) {
    lines.push(Array.from({ length: Math.min(12, count - i) }, () => "plain").join(" "));
  }
  return lines.join("\n") + "\n";
}

/** Chinese prose of `count` characters, sixty to a line. */
function hanzi(count: number): string {
  const lines: string[] = [];
  for (let i = 0; i < count; i += 60) lines.push("文".repeat(Math.min(60, count - i)));
  return lines.join("\n") + "\n";
}

/** A pair of articles of valid length, with `en` and `zh` inserted after the front matter. */
function pair(en = "", zh = ""): Record<string, string> {
  return {
    [`${EN}/one.md`]: FRONT + en + words(2000),
    [`${ZH}/one.md`]: FRONT + zh + hanzi(4000),
  };
}

const LINE_AFTER_FRONT = 8;

describe("lint", () => {
  test("passes a pair of clean articles", () => {
    expect(lint(repo(pair()))).toEqual([]);
  });

  test("names file and line of a banned phrase, ignoring case and line breaks", () => {
    const problems = lint(repo(pair("\nSo, It's worth\nnoting that we tried.\n")));
    expect(problems).toEqual([
      {
        file: `${EN}/one.md`,
        line: LINE_AFTER_FRONT,
        message: `banned phrase "it's worth noting"`,
      },
    ]);
  });

  test("matches typographic apostrophes and whole words only", () => {
    const problems = lint(repo(pair("\nIt’s worth noting. Synergyless synergy.\n")));
    expect(problems.map((p) => p.message).sort()).toEqual([
      `banned phrase "it's worth noting"`,
      `banned phrase "synergy"`,
    ]);
  });

  test("reports banned patterns", () => {
    const problems = lint(repo(pair("\nIn conclusion, we are done.\n")));
    expect(problems).toEqual([
      {
        file: `${EN}/one.md`,
        line: LINE_AFTER_FRONT,
        message: String.raw`banned pattern "\bin conclusion\b"`,
      },
    ]);
  });

  test("reports banned Chinese words and patterns", () => {
    const problems = lint(repo(pair("", "\n这次改动赋能团队。\n它不仅快，而且更是稳。\n")));
    expect(problems).toEqual([
      { file: `${ZH}/one.md`, line: LINE_AFTER_FRONT, message: `banned phrase "赋能"` },
      {
        file: `${ZH}/one.md`,
        line: LINE_AFTER_FRONT + 1,
        message: `banned pattern "不仅.{0,20}更是"`,
      },
    ]);
  });

  test("ignores code and link targets", () => {
    const en = [
      "",
      "```",
      "synergy in a code block",
      "```",
      "",
      "Run `synergy` and read [the docs](https://example.com/synergy).",
      "",
    ].join("\n");
    expect(lint(repo(pair(en)))).toEqual([]);
  });

  test("reports the em-dash that takes a piece over its density limit", () => {
    // 2,000 words allow 4 em-dashes at 2 per 1,000.
    const en = "\nOne — two — three.\nFour — five — six — seven.\n";
    expect(lint(repo(pair(en)))).toEqual([
      {
        file: `${EN}/one.md`,
        line: LINE_AFTER_FRONT + 1,
        message: "more than 2 em-dashes per 1,000 words (5 in 2,007 words)",
      },
    ]);
  });

  test("counts a Chinese double dash as one em-dash, per 1,000 characters", () => {
    // 4,000 characters allow 4 em-dashes at 1 per 1,000.
    const zh = "\n甲——乙——丙——丁——\n戊——己\n";
    expect(lint(repo(pair("", zh)))).toEqual([
      {
        file: `${ZH}/one.md`,
        line: LINE_AFTER_FRONT + 1,
        message: "more than 1 em-dashes per 1,000 characters (5 in 4,006 characters)",
      },
    ]);
  });

  test("limits bold phrases and bullet lists", () => {
    const en = [
      "",
      "**One** and **two** and __three__.",
      "",
      "- a",
      "- b",
      "",
      "1. c",
      "",
      "* d",
      "",
    ].join("\n");
    expect(lint(repo(pair(en))).map((p) => [p.line, p.message])).toEqual([
      [LINE_AFTER_FRONT, "more than 1 bold phrases per 1,000 words (3 in 2,010 words)"],
      [LINE_AFTER_FRONT + 7, "more than 1 bullet lists per 1,000 words (3 in 2,010 words)"],
    ]);
  });

  test("enforces the English length of 1,500 to 3,000 words", () => {
    const files = pair();
    files[`${EN}/one.md`] = FRONT + words(1499);
    expect(lint(repo(files))).toEqual([
      {
        file: `${EN}/one.md`,
        line: 1,
        message: "1,499 words; an English article has 1,500 to 3,000",
      },
    ]);
    files[`${EN}/one.md`] = FRONT + words(3001);
    expect(lint(repo(files))[0].message).toBe("3,001 words; an English article has 1,500 to 3,000");
    files[`${EN}/one.md`] = FRONT + words(1500) + "```\n" + words(2000) + "```\n";
    expect(lint(repo(files))).toEqual([]);
  });

  test("enforces the Chinese length of 3,000 to 6,000 characters", () => {
    const files = pair();
    files[`${ZH}/one.md`] = FRONT + hanzi(2990) + "，。！？“”" + "\n".repeat(20);
    expect(lint(repo(files))).toEqual([
      {
        file: `${ZH}/one.md`,
        line: 1,
        message: "2,990 characters; a Chinese article has 3,000 to 6,000",
      },
    ]);
    files[`${ZH}/one.md`] = FRONT + hanzi(6001);
    expect(lint(repo(files))[0].message).toBe(
      "6,001 characters; a Chinese article has 3,000 to 6,000",
    );
  });

  test("reports an article without its counterpart in the other language", () => {
    const files = pair();
    files[`${EN}/two.md`] = files[`${EN}/one.md`];
    files[`${ZH}/three.md`] = files[`${ZH}/one.md`];
    expect(lint(repo(files))).toEqual([
      { file: `${EN}/two.md`, line: 1, message: `no Chinese counterpart ${ZH}/two.md` },
      { file: `${ZH}/three.md`, line: 1, message: `no English counterpart ${EN}/three.md` },
    ]);
  });

  test("reports a malformed rule in the style guide", () => {
    const guide = GUIDE.replace("limit: bold 1\n", "limit: bold many\n").replace(
      "pattern: 不仅",
      "pattern: (不仅",
    );
    expect(lint(repo(pair(), guide))).toEqual([
      { file: "docs/style-guide.md", line: 11, message: `malformed rule "limit: bold many"` },
      {
        file: "docs/style-guide.md",
        line: 17,
        message: `malformed rule "pattern: (不仅.{0,20}更是"`,
      },
    ]);
  });

  test("reports a style guide without both rule blocks", () => {
    expect(lint(repo(pair(), "# Style guide\n"))).toEqual([
      { file: "docs/style-guide.md", line: 1, message: "no style-rules-en block" },
      { file: "docs/style-guide.md", line: 1, message: "no style-rules-zh block" },
    ]);
  });
});

describe("the project's style guide", () => {
  const guide = readFileSync("docs/style-guide.md", "utf8");

  test("bans every example that R19 names", () => {
    const en = [
      "",
      "Let us delve into it.",
      "In today's fast-paced world, things move.",
      "It's important to note that this is a game-changer.",
      "",
    ].join("\n");
    const zh = [
      "",
      "它不仅是工具，更是方法。",
      "AI 赋能开发。",
      "在当今人工智能飞速发展的时代，一切都在变。",
      "让我们一起看看。",
      "",
    ].join("\n");
    const lines = lint(repo(pair(en, zh), guide)).map((p) => `${p.file}:${p.line}`);
    for (let i = 0; i < 3; i++) expect(lines).toContain(`${EN}/one.md:${LINE_AFTER_FRONT + i}`);
    expect(lines.filter((l) => l === `${EN}/one.md:${LINE_AFTER_FRONT + 2}`)).toHaveLength(2);
    for (let i = 0; i < 4; i++) expect(lines).toContain(`${ZH}/one.md:${LINE_AFTER_FRONT + i}`);
  });

  test("bans formulaic endings that summarize what was just said", () => {
    const problems = lint(
      repo(pair("\nIn summary, the factory works.\n", "\n综上所述，工厂可行。\n"), guide),
    );
    expect(problems.map((p) => p.file)).toEqual([`${EN}/one.md`, `${ZH}/one.md`]);
  });
});

describe("articleLength", () => {
  test("counts English words, without code, links or figure syntax", () => {
    const text = "It's a well-known [rule](https://x.y/z) `code`.\n\n![alt text](fig:a)\n";
    expect(articleLength(text, "en")).toBe(4);
  });

  test("counts Chinese characters that are not whitespace or punctuation", () => {
    expect(articleLength("熄灯工厂，AI 写代码。\n\n“人”做决定！", "zh")).toBe(13);
  });
});
