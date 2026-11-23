// robots.txt: crawl everything, and find the pages in the sitemap (R31).
export function GET() {
  const sitemap = new URL("/sitemap.xml", import.meta.env.SITE).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
