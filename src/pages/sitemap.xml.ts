// sitemap.xml: every page, with the `hreflang` alternates of its head (R31).
import { getCollection } from "astro:content";
import { seriesOf, type Page } from "../lib/series/index.ts";

export async function GET() {
  const series = seriesOf(await getCollection("articles"), import.meta.env.SITE);
  const pages: Page[] = [
    {},
    ...(["en", "zh"] as const).flatMap((lang) => [
      { lang },
      ...series.articles(lang).map((a) => ({ lang, slug: a.slug })),
    ]),
  ];
  const urls = pages.map((page) => {
    const { canonical, alternates } = series.pageMeta(page);
    const links = alternates.map(
      (a) => `<xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}"/>`,
    );
    return `<url><loc>${canonical}</loc>${links.join("")}</url>`;
  });
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join("\n") +
    "\n</urlset>\n";
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}
