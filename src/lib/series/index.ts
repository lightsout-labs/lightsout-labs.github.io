// The series model: which articles exist in a language, in what order, how
// long each takes to read, and what each page tells search engines and feed
// readers (R24-R27, R31).
import { articleLength, type Lang } from "../../../tools/content-lint/index.ts";

export type { Lang };

/** An article entry as Astro's content collection gives it. */
export interface Entry {
  id: string;
  body?: string;
  data: { title: string; description: string; date: Date; part: number };
}

export interface Article<E extends Entry = Entry> {
  lang: Lang;
  slug: string;
  part: number;
  title: string;
  description: string;
  date: Date;
  /** Reading time in whole minutes, rounded up. */
  minutes: number;
  /** The collection entry, for rendering the body. */
  entry: E;
}

/** Planned length of the series (R1); the position reads "Part 1 of 12". */
export const SERIES_SIZE = 12;

/** A page of the site: the root page, a language's index, or an article. */
export type Page = { lang?: undefined } | { lang: Lang; slug?: string };

/** A link to a page in one language, with its `hreflang` and visible text. */
export interface Link {
  hreflang: string;
  href: string;
  label: string;
}

export interface PageMeta {
  /** The `lang` attribute of the page's `<html>`. */
  lang: string;
  title: string;
  description: string;
  canonical: string;
  /** The page in every language it exists in, with `x-default` where there is a root. */
  alternates: { hreflang: string; href: string }[];
  /** The same page in the other language, or that language's index. None on the root. */
  switchTo?: Link;
  feeds: Link[];
  /** schema.org `BlogPosting` data, on articles only. */
  jsonLd?: Record<string, unknown>;
}

const NAME = "Lightsout Labs";

const LANGS = ["en", "zh"] as const satisfies Lang[];

/** Per language: its `hreflang`, its name in itself, the index's title and summary, and the feed link. */
const WORDS = {
  en: {
    hreflang: "en",
    name: "English",
    title: `The lights-out software factory | ${NAME}`,
    description:
      "Notes on the lights-out software factory, where an AI agent builds the software and people decide at a few gates.",
    feed: "RSS feed",
  },
  zh: {
    hreflang: "zh-CN",
    name: "中文",
    title: `熄灯软件工厂 | ${NAME}`,
    description: "关于“熄灯软件工厂”的系列文章：AI 智能体负责开发软件，人只在几个关口做决定。",
    feed: "RSS 订阅",
  },
};

const ROOT_DESCRIPTION = `The ${NAME} blog on the lights-out software factory, in English and Chinese.`;

/** Words (English) or characters (Chinese) read in a minute. */
const READING_RATE = { en: 230, zh: 400 };

/**
 * The series built from every article entry, `<lang>/<slug>` by id, for the
 * site at `site` (an origin such as `https://lightsout-labs.github.io`).
 */
export function seriesOf<E extends Entry>(entries: E[], site: string) {
  const all = entries
    .map((entry): Article<E> => {
      const [lang, slug] = entry.id.split("/") as [Lang, string];
      const length = articleLength(entry.body ?? "", lang);
      return {
        lang,
        slug,
        ...entry.data,
        minutes: Math.max(1, Math.ceil(length / READING_RATE[lang])),
        entry,
      };
    })
    .sort((a, b) => a.part - b.part);

  const articles = (lang: Lang) => all.filter((a) => a.lang === lang);
  const find = (lang: Lang, slug: string) => all.find((a) => a.lang === lang && a.slug === slug);
  const absolute = (path: string) => new URL(path, site).href;
  const feeds = (langs: readonly Lang[]) =>
    langs.map((lang) => ({
      hreflang: WORDS[lang].hreflang,
      href: `/${lang}/rss.xml`,
      label: WORDS[lang].feed,
    }));

  function articleMeta(article: Article<E>): PageMeta {
    const { lang, slug } = article;
    const other = lang === "en" ? "zh" : "en";
    const path = (l: Lang) => `/${l}/${slug}/`;
    const canonical = absolute(path(lang));
    const translated = find(other, slug) !== undefined;
    return {
      lang: WORDS[lang].hreflang,
      title: `${article.title} | ${NAME}`,
      description: article.description,
      canonical,
      alternates: LANGS.filter((l) => l === lang || translated).map((l) => ({
        hreflang: WORDS[l].hreflang,
        href: absolute(path(l)),
      })),
      switchTo: {
        hreflang: WORDS[other].hreflang,
        href: translated ? path(other) : `/${other}/`,
        label: WORDS[other].name,
      },
      feeds: feeds([lang]),
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description: article.description,
        datePublished: article.date.toISOString().slice(0, 10),
        author: { "@type": "Organization", name: NAME },
        inLanguage: WORDS[lang].hreflang,
        url: canonical,
        mainEntityOfPage: canonical,
      },
    };
  }

  /** The root page and the indexes exist in both languages, with the root as the default. */
  const indexAlternates = [
    ...LANGS.map((l) => ({ hreflang: WORDS[l].hreflang, href: absolute(`/${l}/`) })),
    { hreflang: "x-default", href: absolute("/") },
  ];

  return {
    /** The articles of one language, in series order. */
    articles,

    /** The articles before and after one, in its language, where they exist. */
    neighbours(lang: Lang, slug: string) {
      const list = articles(lang);
      const i = list.findIndex((a) => a.slug === slug);
      return { previous: list[i - 1], next: i < 0 ? undefined : list[i + 1] };
    },

    /** Title, description, links, and structured data for a page (R25, R27, R31). */
    pageMeta(page: Page): PageMeta {
      if (page.lang === undefined) {
        return {
          lang: "en",
          title: NAME,
          description: ROOT_DESCRIPTION,
          canonical: absolute("/"),
          alternates: indexAlternates,
          feeds: feeds(LANGS),
        };
      }
      const { lang, slug } = page;
      if (slug !== undefined) {
        const article = find(lang, slug);
        if (!article) throw new Error(`No article ${lang}/${slug}`);
        return articleMeta(article);
      }
      const other = lang === "en" ? "zh" : "en";
      return {
        lang: WORDS[lang].hreflang,
        title: WORDS[lang].title,
        description: WORDS[lang].description,
        canonical: absolute(`/${lang}/`),
        alternates: indexAlternates,
        switchTo: {
          hreflang: WORDS[other].hreflang,
          href: `/${other}/`,
          label: WORDS[other].name,
        },
        feeds: feeds([lang]),
      };
    },
  };
}
