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
npx playwright install chromium   # for the end-to-end tests and Lighthouse
make dev                          # http://localhost:4321
```

## Test

- `make check`: format check, lint, type check, unit tests with coverage,
  and the document check.
- `make e2e`: builds the site, runs the Playwright tests against
  `astro preview`, and checks Lighthouse scores of 95 or higher.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages at
<https://lightsout-labs.github.io>. The deploy workflow fails unless `/`,
`/en/`, and `/zh/` answer 200 after publishing.

## Revise content

Open an issue with the "Content revision" template, naming the article or
post, the language, and the change.

## License

Content is licensed [CC BY 4.0](LICENSE-CONTENT); code is licensed
[MIT](LICENSE).
