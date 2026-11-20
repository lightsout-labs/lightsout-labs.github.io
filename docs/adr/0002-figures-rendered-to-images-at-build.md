# 0002: Render diagrams and share cards to raster images at build time

## Context

Articles need diagrams generated from source in both languages, readable in
light and dark themes and on a 360 px phone (R11, R12, R14). Social posts
need the same figures as files that WeChat and X accept, which excludes SVG
(R15, R16). Each article needs a share card with its title, in Chinese or
English (R28).

Options considered:

- **Inline SVG from Mermaid or Graphviz.** Sharp at every size, and colors
  can follow the theme through CSS. But the text is measured with one font
  at render time and drawn with whatever font the reader's system has, so
  CJK labels clip or overflow; Graphviz in WebAssembly also guesses CJK
  widths. Social posts would still need a PNG.
- **Mermaid rendered in a browser to raster images.** The browser measures
  and draws with the same bundled font, so labels always fit. Light and dark
  are two renders with two palettes. The same output serves social posts.
- **Satori and resvg for share cards.** A second rendering stack with its
  own font handling, only for cards.
- **Committing the generated images.** Fast builds, but binary churn and a
  stale-check to keep outputs in step with sources.

## Decision

A figure renderer of our own drives Playwright's Chromium: it renders each
Mermaid source with the site's light and dark palettes and the bundled Noto
Sans SC font, and each share card from an HTML template, then `sharp`
writes WebP at two widths for pages and PNG for social posts. Screenshots go
through the same resizing. Outputs go to `public/figures/`, are not
committed, and are rebuilt by `make figures` before every build.

## Consequences

- Labels fit in both languages, and one source produces page and social
  images.
- Every build, locally and in CI, needs Chromium. The e2e and deploy jobs
  run in the Playwright container image, which has it.
- Diagrams are raster, so they are not selectable text; alt text and
  captions carry their meaning (R13).
- If diagram count grows large, render time grows with it; the renderer
  skips outputs newer than their sources.
