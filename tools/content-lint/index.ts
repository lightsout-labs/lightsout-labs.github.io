// The content linter: checks every article against the style guide's rule
// blocks, the length limits, and the pairing of languages (R3, R19-R21).
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type Lang = "en" | "zh";

export interface Problem {
  file: string;
  line: number;
  message: string;
}

const GUIDE = "docs/style-guide.md";
const ARTICLES = "src/content/articles";
const LANGS: Lang[] = ["en", "zh"];
const NAME = { en: "English", zh: "Chinese" };

/** Article length in words (English) or characters (Chinese), and the unit's name. */
const LENGTH = {
  en: { min: 1500, max: 3000, unit: "words", article: "an English article" },
  zh: { min: 3000, max: 6000, unit: "characters", article: "a Chinese article" },
};

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
      problems.push(...lintArticle(file, text, lang, rules[lang]));
      const counterpart = `${ARTICLES}/${other}/${name}`;
      if (!existsSync(join(repo, counterpart))) {
        problems.push({ file, line: 1, message: `no ${NAME[other]} counterpart ${counterpart}` });
      }
    }
  }
  return problems.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

/** The length of a Markdown article, as R3 counts it: English words or Chinese characters. */
export function articleLength(markdown: string, lang: Lang): number {
  return count(prose(body(markdown)), lang);
}

function markdownFiles(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(".md")) : [];
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

function lintArticle(file: string, markdown: string, lang: Lang, rules: Rules): Problem[] {
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
  const { min, max, unit, article } = LENGTH[lang];
  if (size < min || size > max) {
    problems.push({
      file,
      line: 1,
      message: `${n(size)} ${unit}; ${article} has ${n(min)} to ${n(max)}`,
    });
  }

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

/**
 * The text a reader reads: code, link targets and figures are blanked out,
 * keeping every newline so that offsets still give the right line.
 */
function prose(markdown: string): string {
  const blank = (s: string) => s.replace(/[^\n]/g, " ");
  return markdown
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/`[^`\n]+`/g, blank)
    .replace(/!\[[^\]]*\]\([^)]*\)/g, blank)
    .replace(
      /(\[[^\]]*\])(\([^)]*\))/g,
      (_, label: string, target: string) => label + blank(target),
    );
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
