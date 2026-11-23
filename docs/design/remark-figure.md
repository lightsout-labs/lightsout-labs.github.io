# Markdown figure plugin

Decisions inside `tools/remark-figure` that the code does not make obvious.
What the module is for is in [the architecture](../architecture.md).

- Only an image alone in its paragraph becomes a figure; that is how an
  article writes one. An image inside a sentence or a list is left as it is.
- The article's language comes from its path, `articles/<lang>/`. A diagram
  is looked up as `<name>.<lang>` first and a screenshot as `<name>`, so a
  diagram drawn for only one language is never shown in the other.
- A figure missing from `public/figures/figures.json` fails the build with
  a message naming `make figures`. The content linter already reports a
  missing source, so the only cause left is a stale or absent render.
- `sizes` says the image takes its own width, or the screen width less the
  page's side padding when the screen is narrower. That matches the CSS,
  which never enlarges an image, so the browser downloads the smaller file
  whenever it would be shown at that size.
- The image carries `width` and `height`, so the page does not shift when
  it loads, and `loading="lazy"` with `decoding="async"`, so figures below
  the fold cost nothing on first paint (R32).
