# Figure renderer

Decisions inside `tools/figures` that the code does not make obvious. What
the module is for is in [the architecture](../architecture.md); why figures
are images rendered at build time is in
[ADR 0002](../adr/0002-figures-rendered-to-images-at-build.md).

## Output

- Every run deletes `public/figures/` and renders everything again. With
  one diagram and one screenshot it takes a few seconds, most of it starting
  Chromium, so skipping fresh outputs would add a staleness check for no
  gain.
- Next to the images it writes `figures.json`, keyed by `<name>.<lang>` for
  a diagram and `<name>` for a screenshot, with the CSS width and height and
  the files for each theme. The remark plugin reads only this file, so the
  two modules share no naming rules.
- A figure is written as WebP at its CSS width and at twice that. The
  browser picks one from `sizes`, so a phone with a high-density screen
  gets the sharp one and a desktop does not download more than it shows.
- Each figure is also written as one PNG, `<key>.png`, at twice its CSS
  width, in the light theme only, for social posts. WeChat and X recompress
  what is uploaded and show it on a light background in most clients, so
  one sharp light PNG is enough. The PNGs are not in the manifest, since no
  page uses them; the name follows the rule in the architecture.

## Diagrams

- Mermaid draws at its natural size (`useMaxWidth: false`), at a device
  scale factor of 2. The page shows it at that CSS size or smaller, never
  larger, so a diagram meant for 360 px screens is drawn narrow: top to
  bottom, with short labels and `<br>` breaks.
- The light and dark renders use the `base` theme with the colors of
  `src/styles/global.css`. A diagram whose source names its own colors
  would break one theme, so sources set shapes and text only.
- The font comes from the `@fontsource/noto-sans-sc` package, which splits
  Noto Sans SC by Unicode range. Before each render the page asks
  `document.fonts.load` for the diagram's text, so the needed ranges are
  loaded before Mermaid measures labels. Without that, Mermaid measures
  with a fallback font and Chinese labels clip.
- The page is served from a made-up origin through Playwright's request
  routing, not from `file://`, so fonts and scripts load as they would from
  a web server.

## Screenshots

- A screenshot is taken by hand at a device scale factor of 2 and a CSS
  width of about 400 px, so it is shown at full size on a desktop and
  shrinks by at most a fifth on a 360 px phone. Its record says how it was
  taken.
- Screenshots have no dark version (R12 shares them as they are).
