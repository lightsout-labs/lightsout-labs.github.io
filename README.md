# lightsout-labs.github.io

The Lightsout Labs blog: a bilingual (English and Chinese) series on the
lights-out software factory, where an AI agent builds the software and the
human decides at a few gates, and on what that changes for the process and
for every role on a team.

Requirements: [docs/requirements.md](docs/requirements.md)

## Develop

You need Node.js 24 (see `.nvmrc`), npm, `make`, and Python 3.

```sh
npm ci
npx playwright install chromium   # for figures, end-to-end tests and Lighthouse
make dev                          # renders figures, then http://localhost:4321
```

## Test

- `make check`: format check, lint, type check, unit tests with coverage,
  the content check, and the document check. The content check prints each
  article problem as `file:line: message`: a banned word or pattern from
  [the style guide](docs/style-guide.md), too many em-dashes, bold phrases,
  or lists, a length outside the limits, a missing counterpart, or a
  figure without alt text, caption, source, or screenshot record.
- `make e2e`: renders the figures, builds the site, runs the Playwright tests against
  `astro preview`, and checks Lighthouse scores of 95 or higher.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages at
<https://lightsout-labs.github.io>. The deploy workflow fails unless `/`,
`/en/`, and `/zh/` answer 200 after publishing.

## Write and revise content

Articles are `src/content/articles/<lang>/<slug>.md`, with the same slug in
both languages. Read [the style guide](docs/style-guide.md) and
[the example ledger](docs/examples.md) before writing.

A figure is `![alt text](fig:<name> "caption")` on a line of its own, alt
text and caption in the article's language. A diagram is Mermaid source in
`figures/diagrams/<name>.en.mmd` and `<name>.zh.mmd`; a screenshot is
`figures/screenshots/<name>.png`, taken at a device scale factor of 2 and
about 400 px wide, with a record `<name>.yml` giving `shows`, `source`,
and `taken`. `make figures` renders them all into `public/figures/`; run it
again after changing one while `make dev` runs.

Open an issue with the "Content revision" template, naming the article or
post, the language, and the change.

## License

Content is licensed [CC BY 4.0](LICENSE-CONTENT); code is licensed
[MIT](LICENSE).
