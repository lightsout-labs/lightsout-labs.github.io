// The content linter: checks every article and social post against the style
// guide's rule blocks and the length limits, the pairing of languages, the
// articles' figures, and the images of social posts (R3, R11, R13, R15-R21).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import twitter from "twitter-text";
import { parse } from "yaml";

export type Lang = "en" | "zh";

export interface Problem {
  file: string;
  line: number;
  message: string;
}

const GUIDE = "docs/style-guide.md";
const ARTICLES = "src/content/articles";
const SOCIAL = "social";
const DIAGRAMS = "figures/diagrams";
const SCREENSHOTS = "figures/screenshots";
const RECORD_FIELDS = ["shows", "source", "taken"];
const LANGS: Lang[] = ["en", "zh"];
const NAME = { en: "English", zh: "Chinese" };

/** Article length in words (English) or characters (Chinese), and the unit's name. */
const LENGTH = {
  en: { min: 1500, max: 3000, unit: "words", article: "an English article" },
  zh: { min: 3000, max: 6000, unit: "characters", article: "a Chinese article" },
};

const WECHAT = { headline: 30, summary: 54, min: 1500, max: 3000, images: 2 };
const THREAD = { min: 5, max: 10, post: 280 };

/** A social post's text and what it is checked against. */
interface Post {
  file: string;
  text: string;
  slug: string;
  /** The PNG paths of the article's figures, the only images a post may use. */
  figures: Set<string>;
}

/** The social posts of an article: the file in social/<slug>/, its language, and its own checks. */
const POSTS: { name: string; lang: Lang; check: (post: Post) => Problem[] }[] = [
  { name: "wechat.md", lang: "zh", check: lintWechat },
  { name: "x.md", lang: "en", check: lintThread },
];

const LIMITS = {
  "em-dash": "em-dashes",
  bold: "bold phrases",
  "bullet-lists": "bullet lists",
} as const;
type Limit = keyof typeof LIMITS;

interface Rules {
  bans: { label: string; regex: RegExp }[];
  limits: Partial<Record<Limit, number>>;
}

/** Every problem in the repository at `repo`, ordered by file and line. */
export function lint(repo: string): Problem[] {
  const { rules, problems } = readGuide(readFileSync(join(repo, GUIDE), "utf8"));
  for (const lang of LANGS) {
    const other = LANGS.find((l) => l !== lang) as Lang;
    for (const name of markdownFiles(join(repo, ARTICLES, lang))) {
      const file = `${ARTICLES}/${lang}/${name}`;
      const text = readFileSync(join(repo, file), "utf8");
      problems.push(...lintStyle(file, text, lang, rules[lang]));
      problems.push(...lintLength(file, text, lang));
      problems.push(...lintFigures(repo, file, text, lang));
      const counterpart = `${ARTICLES}/${other}/${name}`;
      if (!existsSync(join(repo, counterpart))) {
        problems.push({ file, line: 1, message: `no ${NAME[other]} counterpart ${counterpart}` });
      }
    }
  }
  problems.push(...lintScreenshots(repo));
  for (const slug of existsSync(join(repo, SOCIAL)) ? readdirSync(join(repo, SOCIAL)) : []) {
    for (const { name, lang, check } of POSTS) {
      const file = `${SOCIAL}/${slug}/${name}`;
      if (!existsSync(join(repo, file))) continue;
      const article = `${ARTICLES}/${lang}/${slug}.md`;
      if (!existsSync(join(repo, article))) {
        problems.push({ file, line: 1, message: `no article ${article}` });
        continue;
      }
      const text = readFileSync(join(repo, file), "utf8");
      const figures = figurePngs(repo, readFileSync(join(repo, article), "utf8"), lang);
      problems.push(...lintStyle(file, text, lang, rules[lang]));
      problems.push(...lintImages(file, text, figures, article));
      problems.push(...check({ file, text, slug, figures }));
    }
  }
  return problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

/** The length of a Markdown article, as R3 counts it: English words or Chinese characters. */
export function articleLength(markdown: string, lang: Lang): number {
  return count(prose(body(markdown)), lang);
}

function markdownFiles(dir: string): string[] {
  return filesEndingWith(dir, ".md");
}

function filesEndingWith(dir: string, extension: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(extension)) : [];
}

/** Figures as `![alt](fig:name "caption")` on a line of their own, with alt text, caption, and source. */
function lintFigures(repo: string, file: string, markdown: string, lang: Lang): Problem[] {
  const problems: Problem[] = [];
  const figure = /^!\[([^\]]*)\]\(fig:([^\s)]+)(?:\s+(?:"([^"]*)"|'([^']*)'))?\)$/;
  for (const [index, text] of withoutCode(markdown).split("\n").entries()) {
    for (const [, name] of text.matchAll(/\]\(fig:([^\s)]+)/g)) {
      const report = (message: string) =>
        problems.push({ file, line: index + 1, message: `figure "${name}" ${message}` });
      const [, alt, , double, single] = text.trim().match(figure) ?? [];
      if (alt === undefined) {
        report(`must be ![alt](fig:${name} "caption") on a line of its own`);
        continue;
      }
      if (alt.trim() === "") report("has no alt text");
      if ((double ?? single ?? "").trim() === "") report("has no caption");
      const diagram = `${DIAGRAMS}/${name}.${lang}.mmd`;
      const screenshot = `${SCREENSHOTS}/${name}.png`;
      if (!existsSync(join(repo, diagram)) && !existsSync(join(repo, screenshot))) {
        report(`has no source ${diagram} or ${screenshot}`);
      }
    }
  }
  return problems;
}

/** The PNG that `make figures` renders for each figure the article uses, by repository path. */
function figurePngs(repo: string, markdown: string, lang: Lang): Set<string> {
  const pngs = new Set<string>();
  for (const [, name] of withoutCode(markdown).matchAll(/\]\(fig:([^\s)]+)/g)) {
    const diagram = existsSync(join(repo, `${DIAGRAMS}/${name}.${lang}.mmd`));
    pngs.add(`public/figures/${diagram ? `${name}.${lang}` : name}.png`);
  }
  return pngs;
}

/** Images in a social post, as `![alt](path)` lines: their line and path. */
function images(markdown: string): { line: number; path: string }[] {
  return withoutCode(markdown)
    .split("\n")
    .flatMap((text, index) => {
      const [, path] = text.trim().match(/^!\[[^\]]*\]\(([^)\s]+)\)$/) ?? [];
      return path === undefined ? [] : [{ line: index + 1, path }];
    });
}

/** A social post may only show the PNG of a figure its article uses (R15, R16). */
function lintImages(file: string, text: string, figures: Set<string>, article: string): Problem[] {
  return images(text)
    .filter(({ path }) => !figures.has(path))
    .map(({ line, path }) => ({
      file,
      line,
      message: `image ${path} is not a figure of ${article}`,
    }));
}

/** A WeChat post: headline, summary, body length, images, and the closing link (R15). */
function lintWechat({ file, text, slug, figures }: Post): Problem[] {
  const problems: Problem[] = [];
  const front = text.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? "";
  const fields = (parse(front) ?? {}) as Record<string, unknown>;
  for (const field of ["headline", "summary"] as const) {
    const value = String(fields[field] ?? "");
    const line = front.split("\n").findIndex((l) => l.startsWith(`${field}:`)) + 2;
    const size = [...value].length;
    if (value.trim() === "") problems.push({ file, line: 1, message: `no ${field}` });
    else if (size > WECHAT[field]) {
      problems.push({
        file,
        line,
        message: `${field} has ${size} characters; at most ${WECHAT[field]}`,
      });
    }
  }
  const size = articleLength(text, "zh");
  if (size < WECHAT.min || size > WECHAT.max) {
    problems.push({
      file,
      line: 1,
      message: `${n(size)} characters; a WeChat post has ${n(WECHAT.min)} to ${n(WECHAT.max)}`,
    });
  }
  // Distinct figures: the same image twice still shows one.
  const shown = new Set(
    images(text)
      .map(({ path }) => path)
      .filter((path) => figures.has(path)),
  ).size;
  if (shown < WECHAT.images) {
    problems.push({
      file,
      line: 1,
      message: `${shown} image${shown === 1 ? "" : "s"} from the article; a WeChat post has at least ${WECHAT.images}`,
    });
  }
  const last = text.trimEnd().split("\n").at(-1) ?? "";
  if (!links(last, `/zh/${slug}/`)) {
    problems.push({ file, line: 1, message: `does not end with a link to /zh/${slug}/` });
  }
  return problems;
}

/** An X thread: posts separated by `---` lines, their number, lengths, images and link (R16). */
function lintThread({ file, text, slug }: Post): Problem[] {
  const problems: Problem[] = [];
  const posts: { line: number; text: string; images: number }[] = [];
  let start = 0;
  const lines = text.split("\n");
  for (let i = 0; i <= lines.length; i++) {
    if (i < lines.length && lines[i].trim() !== "---") continue;
    const chunk = lines.slice(start, i).join("\n");
    const offset = lines.slice(start, i).findIndex((l) => l.trim() !== "");
    if (offset >= 0) {
      const shown = images(chunk);
      const words = chunk
        .split("\n")
        .filter((_, index) => !shown.some((image) => image.line === index + 1))
        .join("\n")
        .trim();
      posts.push({ line: start + offset + 1, text: words, images: shown.length });
    }
    start = i + 1;
  }

  if (posts.length < THREAD.min || posts.length > THREAD.max) {
    problems.push({
      file,
      line: 1,
      message: `${posts.length} posts; an X thread has ${THREAD.min} to ${THREAD.max}`,
    });
  }
  for (const [index, post] of posts.entries()) {
    const { weightedLength } = twitter.parseTweet(post.text);
    if (weightedLength > THREAD.post) {
      problems.push({
        file,
        line: post.line,
        message: `post ${index + 1} has ${weightedLength} characters as X counts them; at most ${THREAD.post}`,
      });
    }
  }
  const [first, ...rest] = posts;
  if (first && first.images === 0) {
    problems.push({ file, line: first.line, message: "the first post has no image" });
  }
  if (!rest.some((post) => post.images > 0)) {
    problems.push({ file, line: 1, message: "no post after the first has an image" });
  }
  const last = posts.at(-1);
  if (last && !links(last.text, `/en/${slug}/`)) {
    problems.push({
      file,
      line: last.line,
      message: `the last post does not link to /en/${slug}/`,
    });
  }
  return problems;
}

/** Whether `text` holds a web address that ends in `path`. */
function links(text: string, path: string): boolean {
  return [...text.matchAll(/https?:\/\/[^\s)]+/g)].some(([url]) => url.endsWith(path));
}

/** Every screenshot needs a record of what it shows, where it was taken, and when. */
function lintScreenshots(repo: string): Problem[] {
  const problems: Problem[] = [];
  for (const name of filesEndingWith(join(repo, SCREENSHOTS), ".png")) {
    const record = `${SCREENSHOTS}/${name.replace(/\.png$/, ".yml")}`;
    const path = join(repo, record);
    const fields = existsSync(path) ? readRecord(path) : {};
    if (!RECORD_FIELDS.every((f) => String(fields[f] ?? "").trim() !== "")) {
      problems.push({
        file: `${SCREENSHOTS}/${name}`,
        line: 1,
        message: `no record ${record} with ${RECORD_FIELDS.slice(0, -1).join(", ")} and ${RECORD_FIELDS.at(-1)}`,
      });
    }
  }
  return problems;
}

function readGuide(text: string): { rules: Record<Lang, Rules>; problems: Problem[] } {
  const problems: Problem[] = [];
  const rules = {} as Record<Lang, Rules>;
  const lines = text.split("\n");
  for (const lang of LANGS) {
    const start = lines.findIndex((l) => l.trim() === "```style-rules-" + lang);
    rules[lang] = { bans: [], limits: {} };
    if (start < 0) {
      problems.push({ file: GUIDE, line: 1, message: `no style-rules-${lang} block` });
      continue;
    }
    for (let i = start + 1; i < lines.length && !lines[i].startsWith("```"); i++) {
      const line = lines[i].trim();
      if (line === "" || line.startsWith("#")) continue;
      if (!addRule(rules[lang], line)) {
        problems.push({ file: GUIDE, line: i + 1, message: `malformed rule "${line}"` });
      }
    }
  }
  return { rules, problems };
}

/** Adds one rule line to `rules`; false if the line is not a valid rule. */
function addRule(rules: Rules, line: string): boolean {
  const [, kind, value] = line.match(/^(ban|pattern|limit):\s*(.+)$/) ?? [];
  if (kind === "ban") {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Whole words only: no letter or digit may touch an end that is one.
    const before =
      /^[\p{L}\p{N}]/u.test(value) && !/^\p{Script=Han}/u.test(value) ? "(?<![\\p{L}\\p{N}])" : "";
    const after =
      /[\p{L}\p{N}]$/u.test(value) && !/\p{Script=Han}$/u.test(value) ? "(?![\\p{L}\\p{N}])" : "";
    rules.bans.push({
      label: `banned phrase "${value}"`,
      regex: new RegExp(before + escaped.replace(/ /g, "\\s+") + after, "giu"),
    });
    return true;
  }
  if (kind === "pattern") {
    try {
      rules.bans.push({ label: `banned pattern "${value}"`, regex: new RegExp(value, "giu") });
      return true;
    } catch {
      return false;
    }
  }
  const [, name, limit] = value?.match(/^(\S+)\s+(\d+(?:\.\d+)?)$/) ?? [];
  if (kind === "limit" && Object.hasOwn(LIMITS, name)) {
    rules.limits[name as Limit] = Number(limit);
    return true;
  }
  return false;
}

/** An article's length (R3). */
function lintLength(file: string, markdown: string, lang: Lang): Problem[] {
  const size = articleLength(markdown, lang);
  const { min, max, unit, article } = LENGTH[lang];
  if (size >= min && size <= max) return [];
  return [{ file, line: 1, message: `${n(size)} ${unit}; ${article} has ${n(min)} to ${n(max)}` }];
}

/** The style guide's bans and density limits, for an article or a social post (R20). */
function lintStyle(file: string, markdown: string, lang: Lang, rules: Rules): Problem[] {
  const problems: Problem[] = [];
  const at = (index: number) => markdown.slice(0, index).split("\n").length;
  const text = prose(markdown);
  // Typographic apostrophes match the plain ones the guide is written with.
  const searchable = text.replace(/[‘’]/g, "'");
  for (const { label, regex } of rules.bans) {
    for (const match of searchable.matchAll(regex)) {
      problems.push({ file, line: at(match.index), message: label });
    }
  }

  const content = body(markdown);
  const offset = markdown.length - content.length;
  const size = count(prose(content), lang);
  const { unit } = LENGTH[lang];

  const found: Record<Limit, number[]> = {
    "em-dash": indexes(prose(content), lang === "zh" ? /——|—/g : /—/g),
    bold: indexes(prose(content), /(\*\*|__)(?=\S)[\s\S]+?\1/g),
    // A list is a run of item lines and indented lines; a blank line ends it.
    "bullet-lists": indexes(
      prose(content),
      /^(?:[-*+]|\d+[.)])\s.*(?:\n(?:[-*+]\s|\d+[.)]\s|[ \t]+\S).*)*/gm,
    ),
  };
  for (const name of Object.keys(LIMITS) as Limit[]) {
    const limit = rules.limits[name];
    if (limit === undefined) continue;
    const allowed = Math.floor((limit * size) / 1000);
    if (found[name].length > allowed) {
      problems.push({
        file,
        line: at(offset + found[name][allowed]),
        message: `more than ${limit} ${LIMITS[name]} per 1,000 ${unit} (${found[name].length} in ${n(size)} ${unit})`,
      });
    }
  }
  return problems;
}

/** The Markdown after its front matter. */
function body(markdown: string): string {
  return markdown.replace(/^---\n[\s\S]*?\n---\n/, "");
}

/** A screenshot record's fields; none if it is not valid YAML. */
function readRecord(path: string): Record<string, unknown> {
  try {
    return parse(readFileSync(path, "utf8")) ?? {};
  } catch {
    return {};
  }
}

/**
 * The text a reader reads: code, link targets, bare web addresses and images
 * are blanked out, keeping every newline so that offsets still give the right line.
 */
function prose(markdown: string): string {
  return withoutCode(markdown)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, blank)
    .replace(
      /(\[[^\]]*\])(\([^)]*\))/g,
      (_, label: string, target: string) => label + blank(target),
    )
    .replace(/https?:\/\/\S+/g, blank);
}

/** The Markdown with code blocks and inline code blanked out, keeping every newline. */
function withoutCode(markdown: string): string {
  return markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/`[^`\n]+`/g, blank);
}

function blank(text: string): string {
  return text.replace(/[^\n]/g, " ");
}

function count(text: string, lang: Lang): number {
  const unit = lang === "en" ? /[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu : /[^\s\p{P}\p{S}]/gu;
  return text.match(unit)?.length ?? 0;
}

function indexes(text: string, regex: RegExp): number[] {
  return [...text.matchAll(regex)].map((m) => m.index);
}

function n(value: number): string {
  return value.toLocaleString("en-US");
}
