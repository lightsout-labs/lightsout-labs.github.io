// One RSS feed per language, listing its articles in series order (R27).
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { seriesOf, type Lang } from "../../lib/series/index.ts";

export function getStaticPaths() {
  return [{ params: { lang: "en" } }, { params: { lang: "zh" } }];
}

export async function GET({ params }: APIContext) {
  const lang = params.lang as Lang;
  const series = seriesOf(await getCollection("articles"), import.meta.env.SITE);
  const index = series.pageMeta({ lang });
  return rss({
    title: index.title,
    description: index.description,
    site: index.canonical,
    customData: `<language>${index.lang}</language>`,
    items: series.articles(lang).map((a) => ({
      title: a.title,
      description: a.description,
      pubDate: a.date,
      link: series.pageMeta({ lang, slug: a.slug }).canonical,
    })),
  });
}
