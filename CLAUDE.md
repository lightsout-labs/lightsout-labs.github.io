# lightsout-labs.github.io

The Lightsout Labs blog, a bilingual static site on the lights-out software
factory, built with Astro and published to GitHub Pages. It is built with the
`nightshift` workflow. What it must do is in `docs/requirements.md`, how it
is built is in `docs/architecture.md` and, inside each module, in
`docs/design/`, and progress is in `docs/backlog.md`.

## Commands

- `make check`: Prettier check, ESLint, `astro check`, Vitest with an 85%
  coverage floor on `src/lib` and `tools`, and `scripts/check-docs.py`. Run
  it after every change.
- `make e2e`: `astro build`, Playwright against `astro preview`, then
  Lighthouse CI at 95 or higher in every category. Run it before a pull
  request.
- `make dev`: the Astro dev server at <http://localhost:4321>.

## Rules

- Work on one slice at a time, with `/nightshift:build`. Tests come first.
- `.nightshift` holds the project's settings: `language`, `ci`, and
  `stop-after-slice`.
- The simplest design and code that meet the requirements. Nothing for a
  need that is not stated.
- Deep modules: small interfaces that hide substantial behavior.
- Tests go through public interfaces only and cover the core logic. None is
  redundant or written to raise coverage.
- Never commit to `main`. One branch and one squash-merged pull request per
  slice.
- Documents are in the `language` of `.nightshift`, except the words that
  scripts read: `Status:` lines with their values, `## Snn:`,
  `Acceptance criteria:`, `Notes:`, `Fixes:`, and `Closes:`. Code, comments,
  and commit messages are in English.
- Update the affected documents in the same change as the behavior.
- Do not edit `scripts/check-docs.py`; it is a copy from the plugin.
- `@playwright/test` is pinned to an exact version, and the CI and deploy
  workflows use the Playwright container image with the same tag. Change
  them together.
