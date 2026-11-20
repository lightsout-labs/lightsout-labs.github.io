// The series model: which articles exist in a language, in what order, and
// how long each takes to read (R24, R26).
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

/** Words (English) or characters (Chinese) read in a minute. */
const READING_RATE = { en: 230, zh: 400 };

/** The series built from every article entry, `<lang>/<slug>` by id. */
export function seriesOf<E extends Entry>(entries: E[]) {
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

  return {
    /** The articles of one language, in series order. */
    articles: (lang: Lang) => all.filter((a) => a.lang === lang),
    /** One article, or undefined if there is none at that slug. */
    article: (lang: Lang, slug: string) => all.find((a) => a.lang === lang && a.slug === slug),
  };
}
