# 0001: Build the site with Astro as fully static pages

## Context

The blog needs Markdown content, two language trees with paired pages, RSS
per language, a sitemap with `hreflang`, per-page metadata and JSON-LD,
pages that work without JavaScript, and Lighthouse scores of 95 or higher on
mobile (R22–R33). It is hosted on GitHub Pages, so the output must be static.

Options considered:

- **Jekyll**, native to GitHub Pages: Ruby, weak i18n, and the tools and
  tests would be in a second language.
- **Hugo**: fast and has i18n, but templates are Go templates and the
  linter and figure tools would still be TypeScript or Python.
- **Eleventy**: flexible, but i18n, feeds, and sitemaps are assembled by
  hand.
- **Astro**: Markdown content collections with schemas, file-based routes
  with parameters for language, official RSS and sitemap integrations, remark
  plugins, and no JavaScript shipped unless a page asks for it.
- **A generator of our own**: least dependency, most code to own.

## Decision

Astro, with static output, no client-side framework, and TypeScript for the
site, the tools, and the tests.

## Consequences

- One language and one toolchain for site, tools, and tests.
- Pages ship no JavaScript except the root page's language choice, which
  keeps Lighthouse scores high.
- Astro's major versions change config and APIs; upgrades are a slice of
  their own.
- Moving to another generator would mean rewriting layouts and routes; the
  content, figures, linter, and social posts would stay as they are.
