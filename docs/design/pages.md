# Pages and layouts

Decisions inside `src/` pages and layouts that the code does not make
obvious. What the module is for is in [the architecture](../architecture.md).

## Root page language choice

- The inline script looks only at the browser's first preferred language:
  `zh` or any `zh-*` tag goes to `/zh/`, everything else to `/en/`. A
  visitor who prefers French and reads Chinese second still lands on
  English, the stated default (R23).
- It uses `location.replace`, so the root page does not stay in history and
  the back button does not bounce the visitor into the redirect again.
- The script sits in `<head>`, before anything renders, so a JavaScript
  visitor never sees the root page flash. Without JavaScript the page is a
  plain list of the two links.
- Lighthouse runs with an English locale, so its run on `/` follows the
  redirect and scores the page a visitor ends up on, including the redirect
  cost. That is the experience R32 is about.

## Style and theme

- One global stylesheet with colors as custom properties, swapped under
  `prefers-color-scheme: dark`. There is no manual theme toggle; R29 asks
  only to follow the system.
- Stylesheets are inlined into each page (`build.inlineStylesheets:
  always`). The stylesheet is small, and inlining removes the only
  render-blocking request.
- Chinese pages use `lang="zh-CN"` and a taller line height (1.85 against
  1.7), since CJK text without word spaces needs more air between lines.
- `trailingSlash: "always"` matches how GitHub Pages serves directory
  pages, so `/en` and `/en/` do not become two URLs.

## Local preview

`astro preview` detaches into a background server when it detects an AI
agent. The Playwright web server runs it with `--ignore-lock`, which keeps
it in the foreground so Playwright can start and stop it.
