import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
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

  describe("figures", () => {
    const DIAGRAM = "figures/diagrams/flow";
    const SHOT = "figures/screenshots/pulls";
    const RECORD =
      "shows: Merged pull requests\nsource: https://example.com/pulls\ntaken: 2026-11-21\n";
    const figures = (en: string, zh: string, extra: Record<string, string> = {}) => ({
      ...pair(en, zh),
      [`${DIAGRAM}.en.mmd`]: "flowchart TD\n  a --> b\n",
      [`${DIAGRAM}.zh.mmd`]: "flowchart TD\n  甲 --> 乙\n",
      [`${SHOT}.png`]: "png",
      [`${SHOT}.yml`]: RECORD,
      ...extra,
    });

    test("passes diagrams in the article's language and shared screenshots", () => {
      const en = '\n![A flow](fig:flow "The flow")\n\n![Pulls](fig:pulls "The pulls")\n';
      const zh = '\n![流程](fig:flow "流程图")\n\n![拉取请求](fig:pulls "拉取请求")\n';
      expect(lint(repo(figures(en, zh)))).toEqual([]);
    });

    test("reports a figure without alt text or caption", () => {
      const en = '\n![](fig:flow "The flow")\n![A flow](fig:flow)\n';
      expect(lint(repo(figures(en, "")))).toEqual([
        { file: `${EN}/one.md`, line: LINE_AFTER_FRONT, message: `figure "flow" has no alt text` },
        {
          file: `${EN}/one.md`,
          line: LINE_AFTER_FRONT + 1,
          message: `figure "flow" has no caption`,
        },
      ]);
    });

    test("reports a figure with no source in the article's language", () => {
      const zh = '\n![流程](fig:flow "流程图")\n![无](fig:none "无")\n';
      const files = Object.fromEntries(
        Object.entries(figures("", zh)).filter(([path]) => path !== `${DIAGRAM}.zh.mmd`),
      );
      expect(lint(repo(files))).toEqual([
        {
          file: `${ZH}/one.md`,
          line: LINE_AFTER_FRONT,
          message: `figure "flow" has no source figures/diagrams/flow.zh.mmd or figures/screenshots/flow.png`,
        },
        {
          file: `${ZH}/one.md`,
          line: LINE_AFTER_FRONT + 1,
          message: `figure "none" has no source figures/diagrams/none.zh.mmd or figures/screenshots/none.png`,
        },
      ]);
    });

    test("reports a figure that is not alone on its line in the figure syntax", () => {
      const en = '\nSee ![A flow](fig:flow "The flow") here.\n![A [flow]](fig:flow (The flow))\n';
      expect(lint(repo(figures(en, ""))).map((p) => [p.line, p.message])).toEqual([
        [LINE_AFTER_FRONT, `figure "flow" must be ![alt](fig:flow "caption") on a line of its own`],
        [
          LINE_AFTER_FRONT + 1,
          `figure "flow" must be ![alt](fig:flow "caption") on a line of its own`,
        ],
      ]);
    });

    test("reports a screenshot without a complete record", () => {
      const files = figures("", "", {
        "figures/screenshots/bare.png": "png",
        "figures/screenshots/partial.png": "png",
        "figures/screenshots/partial.yml": "shows: Something\n",
        "figures/screenshots/broken.png": "png",
        "figures/screenshots/broken.yml": "shows: [unclosed\n",
      });
      expect(lint(repo(files))).toEqual([
        {
          file: "figures/screenshots/bare.png",
          line: 1,
          message: "no record figures/screenshots/bare.yml with shows, source and taken",
        },
        {
          file: "figures/screenshots/broken.png",
          line: 1,
          message: "no record figures/screenshots/broken.yml with shows, source and taken",
        },
        {
          file: "figures/screenshots/partial.png",
          line: 1,
          message: "no record figures/screenshots/partial.yml with shows, source and taken",
        },
      ]);
    });
  });

  describe("social posts", () => {
    const WECHAT = "social/one/wechat.md";
    const X = "social/one/x.md";
    const ZH_LINK = "https://lightsout-labs.github.io/zh/one/";
    const EN_LINK = "https://lightsout-labs.github.io/en/one/";
    const FLOW_ZH = "![流程](public/figures/flow.zh.png)";
    const FLOW_EN = "![A flow](public/figures/flow.en.png)";
    const PULLS = "![Pulls](public/figures/pulls.png)";

    /** A WeChat post: front matter, then `body`; by default a valid one. */
    const wechat = (
      body = `${hanzi(1000)}\n${FLOW_ZH}\n\n${hanzi(1000)}\n${PULLS}\n\n全文：${ZH_LINK}\n`,
      headline = "标题",
      summary = "摘要。",
    ) => `---\nheadline: "${headline}"\nsummary: "${summary}"\n---\n\n${body}`;

    /** An X thread of `posts`; by default a valid one of five. */
    const thread = (
      posts = [
        `A hook.\n\n${FLOW_EN}`,
        "Two.",
        `Three.\n\n${PULLS}`,
        "Four.",
        `Read it: ${EN_LINK}`,
      ],
    ) => posts.join("\n\n---\n\n") + "\n";

    const files = (extra: Record<string, string>) => ({
      ...pair(
        '\n![A flow](fig:flow "The flow")\n\n![Pulls](fig:pulls "The pulls")\n',
        '\n![流程](fig:flow "流程图")\n\n![拉取请求](fig:pulls "拉取请求")\n',
      ),
      "figures/diagrams/flow.en.mmd": "flowchart TD\n  a --> b\n",
      "figures/diagrams/flow.zh.mmd": "flowchart TD\n  甲 --> 乙\n",
      "figures/screenshots/pulls.png": "png",
      "figures/screenshots/pulls.yml":
        "shows: Merged pull requests\nsource: https://example.com/pulls\ntaken: 2026-11-21\n",
      [WECHAT]: wechat(),
      [X]: thread(),
      ...extra,
    });
    const lintPosts = (extra: Record<string, string>) =>
      lint(repo(files(extra))).filter((p) => p.file.startsWith("social/"));

    test("passes a WeChat post and an X thread that keep every rule", () => {
      expect(lint(repo(files({})))).toEqual([]);
    });

    test("limits the WeChat headline to 30 characters and the summary to 54", () => {
      expect(lintPosts({ [WECHAT]: wechat(undefined, "标".repeat(31), "摘".repeat(55)) })).toEqual([
        { file: WECHAT, line: 2, message: "headline has 31 characters; at most 30" },
        { file: WECHAT, line: 3, message: "summary has 55 characters; at most 54" },
      ]);
    });

    test("keeps the WeChat body between 1,500 and 3,000 characters", () => {
      const short = `${hanzi(700)}\n${FLOW_ZH}\n\n${hanzi(700)}\n${PULLS}\n\n${ZH_LINK}\n`;
      expect(lintPosts({ [WECHAT]: wechat(short) })).toEqual([
        { file: WECHAT, line: 1, message: "1,400 characters; a WeChat post has 1,500 to 3,000" },
      ]);
    });

    test("needs two different images from the article in a WeChat post and a closing link", () => {
      const body = `${hanzi(1000)}\n${FLOW_ZH}\n\n${hanzi(1000)}\n${FLOW_ZH}\n\n${ZH_LINK}\n\n最后一段。\n`;
      expect(lintPosts({ [WECHAT]: wechat(body) })).toEqual([
        {
          file: WECHAT,
          line: 1,
          message: "1 image from the article; a WeChat post has at least 2",
        },
        { file: WECHAT, line: 1, message: "does not end with a link to /zh/one/" },
      ]);
    });

    test("reports an image that is not a figure of the post's article", () => {
      const body = `${hanzi(1000)}\n${FLOW_EN}\n\n${hanzi(1000)}\n${PULLS}\n![x](fig:flow)\n\n${ZH_LINK}\n`;
      expect(lintPosts({ [WECHAT]: wechat(body) })).toEqual([
        {
          file: WECHAT,
          line: 1,
          message: "1 image from the article; a WeChat post has at least 2",
        },
        {
          file: WECHAT,
          line: 24,
          message: `image public/figures/flow.en.png is not a figure of src/content/articles/zh/one.md`,
        },
        {
          file: WECHAT,
          line: 45,
          message: `image fig:flow is not a figure of src/content/articles/zh/one.md`,
        },
      ]);
    });

    test("keeps a thread to 5 to 10 posts", () => {
      const posts = [`Hook.\n\n${FLOW_EN}`, `Two.\n\n${PULLS}`, `End: ${EN_LINK}`];
      expect(lintPosts({ [X]: thread(posts) })).toEqual([
        { file: X, line: 1, message: "3 posts; an X thread has 5 to 10" },
      ]);
    });

    test("limits each post to 280 characters as X counts them, a link as 23", () => {
      const long = "word ".repeat(51) + "end."; // 259 characters
      const posts = [
        `A hook.\n\n${FLOW_EN}`,
        long,
        long + " x".repeat(11),
        `Three.\n\n${PULLS}`,
        `${long} ${EN_LINK}`,
      ];
      expect(lintPosts({ [X]: thread(posts) })).toEqual([
        { file: X, line: 11, message: "post 3 has 281 characters as X counts them; at most 280" },
        { file: X, line: 21, message: "post 5 has 283 characters as X counts them; at most 280" },
      ]);
    });

    test("needs an image in the first post and a later one, and a link in the last", () => {
      const posts = ["A hook.", "Two.", "Three.", "Four.", "Five."];
      expect(lintPosts({ [X]: thread(posts) })).toEqual([
        { file: X, line: 1, message: "the first post has no image" },
        { file: X, line: 1, message: "no post after the first has an image" },
        { file: X, line: 17, message: "the last post does not link to /en/one/" },
      ]);
    });

    test("applies the style guide's bans and limits to social posts", () => {
      const posts = thread().replace("Two.", "Two, in conclusion.");
      const body = wechat().replace("全文", "赋能全文");
      expect(lintPosts({ [X]: posts, [WECHAT]: body }).map((p) => [p.file, p.line])).toEqual([
        [WECHAT, 46],
        [X, 7],
      ]);
    });

    test("reports a post for an article that does not exist", () => {
      expect(lintPosts({ "social/gone/x.md": thread() })).toEqual([
        {
          file: "social/gone/x.md",
          line: 1,
          message: "no article src/content/articles/en/gone.md",
        },
      ]);
    });
  });

  test("reports a malformed rule in the style guide", () => {
    const guide = GUIDE.replace("limit: bold 1\n", "limit: bold many\nlimit: toString 1\n").replace(
      "pattern: 不仅",
      "pattern: (不仅",
    );
    expect(lint(repo(pair(), guide))).toEqual([
      { file: "docs/style-guide.md", line: 11, message: `malformed rule "limit: bold many"` },
      { file: "docs/style-guide.md", line: 12, message: `malformed rule "limit: toString 1"` },
      {
        file: "docs/style-guide.md",
        line: 18,
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

describe("the CLI", () => {
  const cli = resolve("tools/content-lint/cli.ts");
  const run = (root: string) => spawnSync("node", [cli], { cwd: root, encoding: "utf8" });

  test("prints each problem as file:line: message and exits 1", () => {
    const result = run(repo(pair("\nIn conclusion, done.\n")));
    expect(result.stdout).toBe(
      `${EN}/one.md:${LINE_AFTER_FRONT}: banned pattern "\\bin conclusion\\b"\n`,
    );
    expect(result.status).toBe(1);
  });

  test("prints nothing and exits 0 for clean content", () => {
    const result = run(repo(pair()));
    expect([result.stdout, result.status]).toEqual(["", 0]);
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
  test("bans the owner in the third person, count-list slogans, and origin-story openers", () => {
    const en = [
      "",
      "The owner approved it.",
      "One person, one week, forty slices.",
      "It all started with a list of notes.",
      "",
    ].join("\n");
    const zh = [
      "",
      "负责人批准了需求。",
      "一个人、一周、四十个切片。",
      "一切从十七条笔记开始。",
      "",
    ].join("\n");
    const lines = lint(repo(pair(en, zh), guide)).map((p) => `${p.file}:${p.line}`);
    expect(lines).toEqual(
      [EN, EN, EN, ZH, ZH, ZH].map((dir, i) => `${dir}/one.md:${LINE_AFTER_FRONT + (i % 3)}`),
    );
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
