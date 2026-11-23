# Backlog

Status: Approved

Slices for the Lightsout Labs blog, built in this order. Each one is
testable end to end.

## S01: Walking skeleton: a deployed bilingual shell

Status: Done

Acceptance criteria:
- `https://lightsout-labs.github.io/` shows a page with links to `/en/` and
  `/zh/` that works without JavaScript; with JavaScript, a browser that
  prefers Chinese lands on `/zh/` and any other on `/en/`. (R22, R23, R33)
- `/en/` and `/zh/` each show the blog's name and an empty series list in
  their language, in the minimal reading-first layout, following the
  system's light or dark theme, with no horizontal scroll at 360 px. (R24,
  R29, R30)
- The root and both index pages score 95 or higher on mobile Lighthouse in
  Performance, Accessibility, Best Practices, and SEO. (R32)
- The repository has a "Content revision" issue template asking for the
  article or post, the language, and the change wanted. (R34)
- `make check` and `make e2e` pass locally and in CI, where `check` and
  `e2e` are required on `main`.
- A push to `main` deploys the site to GitHub Pages, and the deploy workflow
  fails unless `/`, `/en/`, and `/zh/` return 200.

Notes:
- S03: `make figures` does not exist yet; add it to `make e2e`, `make dev`,
  and the deploy workflow's build job, as the architecture says.
- S02, S05: the index strings (tagline, heading, empty state) live in
  `getStaticPaths` in `src/pages/[lang]/index.astro`; the series list
  replaces the empty state.
- S05: the root page has no canonical, `hreflang` alternates, or
  `robots.txt` yet.
- The Playwright container tag in both workflows must match the pinned
  `@playwright/test` version.
- CI: `e2e` first failed with `make: not found`; the Playwright image has
  no `make`, so the job installs it with `apt-get`.

## S02: Part 1 in both languages, checked against the style guide

Status: Done

Acceptance criteria:
- `docs/style-guide.md` describes the voice and holds the English and
  Chinese rule blocks with banned words, phrases, patterns, and density
  limits, including every example R19 names. (R19)
- `make check` fails, naming file and line, on a banned item or a density
  limit exceeded in any article, and on an English article outside 1,500 to
  3,000 words or a Chinese one outside 3,000 to 6,000 characters. (R3, R20,
  R21)
- `make check` fails when an article has no counterpart in the other
  language. (R21)
- Part 1, on the lights-out software factory's idea and principles, is
  published at `/en/lights-out-factory/` and `/zh/lights-out-factory/`,
  written natively in each language, citing at least two examples from
  `nightshift` or `gridworks` that match the repositories, stating a
  limitation, with a title the body supports; its centrepiece examples are
  recorded in `docs/examples.md`. (R1, R4–R8)
- Each article page shows title, "Lightsout Labs", date, reading time, "1 of
  12", and the body, in the reading-first layout for Latin and CJK text, in
  light and dark themes, with no horizontal scroll at 360 px, and its full
  content without JavaScript. (R9, R26, R29, R30, R33)
- Each index lists Part 1 with title, summary, date, and reading time. (R24)
- The article pages score 95 or higher on mobile Lighthouse in all four
  categories. (R32)

Notes:
- The fourth criterion said "1 of 8", copied from R26's example; R1 plans
  twelve parts and every later slice says "of 12", so it now reads "1 of
  12".
- S03: Part 1 has no figures yet; `tools/remark-figure` and the linter's
  figure checks do not exist.
- S04: `lint()` checks articles only; add social posts to it.
- S05: `seriesOf` offers only `articles(lang)`; add `article`,
  `neighbours`, `counterpart`, and `pageMeta` there. `SERIES_SIZE` lives in
  `src/lib/series`, and `src/components/Facts.astro` words the position.
- S07 and every later article slice: read `docs/examples.md` first. Part 1
  ends by pointing to the next article without a link; S07 adds it.

## S18: Part 1 rewritten around the questions vibe coding leaves open

Status: Done

Acceptance criteria:
- `docs/style-guide.md` bans, in English and Chinese, describing the
  project's owner in the third person ("the owner", "负责人"), slogans built
  from a list of counts ("one person, one week, forty slices", "一个人、一
  周、四十个切片"), and origin-story openers ("it all started with", "一切
  从……开始"); `make check` fails on each, naming file and line. (R19, R20)
- Part 1 at `/en/lights-out-factory/` and `/zh/lights-out-factory/` is
  rewritten in both languages, each written separately, in this order:
  what vibe coding can build today, shown with real, linked examples and no
  claim beyond them; the questions industrial software and large games
  raise; the experiment we started to answer them; and, for each question,
  what the experiment showed, marked as answered, partly answered, or still
  open, with evidence from the repositories and a pointer to the part that
  covers it in depth. (R35)
- Both versions raise the seven questions: full autonomy, line-by-line
  review, staying within the requirements, clean structure as features are
  added and requirements change, who checks agent-written tests, coherence across sessions, and
  rules that hold beyond the prompt; outside findings carry links. (R6,
  R35)
- The answer on clean structure shows, from the `gridworks` history, how
  the requirement changes made during the build (the issues filed mid-build
  and the slices they became) were taken into the design, and states how
  far a one-week build can show that the architecture holds up under
  change. (R7, R35)
- Both versions speak as "we", never describe the owner in the third
  person, and do not open with the history of the original notes; each
  title makes an eye-catching, specific claim that the body supports,
  creates contrast with a habit the reader holds or names a real change
  the reader has reason to worry about, drawn from facts the article
  shows, and is not a count-list slogan. (R8, R36, R37)
- Both versions still meet R3 to R9 and pass `make check`, and
  `docs/examples.md` records Part 1's new centrepiece examples, freeing any
  it no longer uses. (R3–R9)
- Both pages still score 95 or higher on mobile Lighthouse. (R32)

Notes:
- Built before S03 and S04, because their figures and social posts are
  taken from Part 1.
- Titles chosen: "Nobody Reviewed These 58 Pull Requests, and the
  Spreadsheet Editor Works" and "代码和测试都是智能体写的，我们一行都没看".
  Check the count against `gridworks` and that the Chinese body answers who
  checks the agent's tests before publishing.
- Checked: 58 merged pull requests in `gridworks`, none with a review. The
  Chinese version opens with the date bug (#40) and answers who checks the
  tests first.
- S03, S04: Part 1 has a Markdown table of the seven questions; the e2e
  "whole article" test now counts tables. Part 1 points to Parts 2, 3, 4,
  5, 6, 8, 10 and 12; `docs/examples.md` lists what it uses as centrepiece
  and what is free for them (hooks, slice notes, scope exclusions).
- The count-list patterns in the style guide are narrow on purpose (three
  number-word pairs ending a sentence; Chinese numerals joined by 、), so
  plain enumerations still pass.

## S03: Figures in Part 1

Status: Done

Acceptance criteria:
- A diagram written as Mermaid source in `figures/diagrams/` appears in Part
  1 with English labels on `/en/` and Chinese labels on `/zh/`, with a light
  and a dark version that follow the theme. (R10, R11, R12, R29)
- A screenshot of `nightshift`, `gridworks`, or their GitHub pages appears
  in Part 1 in both languages, with a record of what it shows and where it
  was taken. (R11)
- Every figure shows its caption, and its image carries alt text, in the
  page's language. (R13)
- Figures are lazy-loaded at a width that suits the screen, readable at 360
  px, and both Part 1 pages still score 95 or higher on mobile Lighthouse.
  (R14, R32)
- `make figures` rebuilds every figure from source with one command. (R11)
- `make check` fails on a figure with no alt text or caption, a figure name
  with no source in the article's language, or a screenshot with no record.
  (R11, R13, R20)

Notes:
- S04: `make figures` writes WebP only. The PNGs for WeChat and X posts are
  not rendered yet; add them to `tools/figures` and print their paths from
  the linter. Part 1 has two figures: `stages-and-gates` (diagram) and
  `gridworks-merged-pulls` (screenshot).
- S06: share cards are not rendered yet; `tools/figures` has no HTML
  template step.
- S07 and later: a diagram must stay at most about 420 px wide, or the
  e2e test that keeps figures readable at 360 px fails. Draw top to bottom
  with short labels and explicit `<br>` breaks; Chinese labels need them
  too, since Mermaid wraps at about seven characters.
- Later slices: Astro 7's default Markdown processor runs no remark
  plugins, so `@astrojs/markdown-remark` is a dependency. The CI `check`
  job installs Chromium for the renderer's unit test.
- CI's first run failed: `astro check` renders the articles, and a fresh
  checkout has no `public/figures/figures.json`. `make check` now runs
  `make figures` first.

## S04: Social posts for Part 1

Status: Done

Acceptance criteria:
- `social/lights-out-factory/wechat.md` holds a Chinese WeChat Official
  Account post with a headline of at most 30 characters, a summary of at
  most 54, a body of 1,500 to 3,000 characters that stands alone, at least
  two images from the article in place, and a closing link to
  `/zh/lights-out-factory/`. (R15, R17)
- `social/lights-out-factory/x.md` holds an English thread of 5 to 10 posts,
  each at most 280 characters as X counts them, the first with an image and
  working alone as a hook, at least one more image, and the last linking to
  `/en/lights-out-factory/`. (R16, R17)
- Each post can be copied in one go, and each image shows the PNG file to
  upload, which `make figures` produces. (R17)
- `make check` fails, naming file and line, when a social post breaks the
  style guide, its length or post-count limits, or uses an image that is not
  in its article. (R18, R20, R21)
- The social posts are not published on the site. (R17)

Notes:
- S07 and later: each article slice writes `social/<slug>/wechat.md` and
  `x.md` the same way. Images are `![alt](public/figures/<key>.png)` lines,
  `<key>` being `<name>.<lang>` for a diagram and `<name>` for a screenshot;
  the WeChat body is plain text (no backticks or headings) so it pastes
  into WeChat, and links are written out as bare addresses.
- S07 and later: the WeChat body for Part 1 is 1,565 characters, near the
  1,500 floor; cutting it needs a sentence added elsewhere.
- Later slices: the linter does not require every article to have social
  posts; it checks the ones that exist.

## S05: Language switch, series navigation, feeds, and search metadata

Status: Todo

Acceptance criteria:
- Every page has a language switch; on an article it leads to the same
  article in the other language. (R25)
- Each article page shows its position in the series and links to the
  previous and next article where they exist. (R26)
- `/en/rss.xml` and `/zh/rss.xml` are valid RSS listing that language's
  articles, and every page links its language's feed. (R27)
- Every page has a unique title and meta description, a canonical URL, and
  `hreflang` links to its counterpart; `sitemap.xml` and `robots.txt` exist.
  (R31)
- Each article page carries valid JSON-LD `BlogPosting` data with title,
  description, date, author "Lightsout Labs", and language. (R9, R31)
- All page types still score 95 or higher on mobile Lighthouse. (R32)

## S06: Share cards

Status: Todo

Acceptance criteria:
- Each article has a generated share image showing its title in its language
  and the Lightsout Labs name, legible as a thumbnail. (R28)
- Each article page carries Open Graph and X card tags pointing to its share
  image with absolute URLs, and the image is served. (R28)
- The index pages carry a share image for the blog as a whole. (R28)
- `make figures` regenerates share cards when a title changes. (R28)

## S07: Part 2, How the factory works

Status: Todo

Acceptance criteria:
- Part 2 of 12, on how the factory works: gates, hooks, documents as the
  record of progress, and one slice per context, is published at
  `/en/factory-design/` and `/zh/factory-design/`, both versions passing
  `make check`. (R1, R3, R9)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/factory-design/wechat.md` and `social/factory-design/x.md` exist
  with images from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 1 links
  forward to Part 2. (R26, R32)

## S08: Part 3, Agile and the development process

Status: Todo

Acceptance criteria:
- Part 3 of 12, on Agile and the development process after automation,
  including whether agreeing on the requirements up front is a return to
  waterfall, is published at `/en/agile/` and `/zh/agile/`, both versions
  passing `make check`. (R1, R3, R9)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/agile/wechat.md` and `social/agile/x.md` exist with images from
  the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 2 links
  forward to Part 3. (R26, R32)

## S09: Part 4, TDD and the test pyramid

Status: Todo

Acceptance criteria:
- Part 4 of 12, on TDD and the test pyramid when tests are the agent's
  specification, is published at `/en/tdd/` and `/zh/tdd/`, both versions
  passing `make check`. (R1, R3, R9)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/tdd/wechat.md` and `social/tdd/x.md` exist with images from the
  article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 3 links
  forward to Part 4. (R26, R32)

## S10: Part 5, Code review by humans and by AI

Status: Todo

Acceptance criteria:
- Part 5 of 12, on code review by humans and by AI, and what humans should
  review once they no longer read every diff, is published at
  `/en/code-review/` and `/zh/code-review/`, both versions passing `make
  check`. (R1, R3, R9)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/code-review/wechat.md` and `social/code-review/x.md` exist with
  images from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 4 links
  forward to Part 5. (R26, R32)

## S11: Part 6, Design principles under automation

Status: Todo

Acceptance criteria:
- Part 6 of 12, on KISS, YAGNI, DRY, SOLID, design patterns, deep modules,
  and vertical slices under automation, is published at
  `/en/design-principles/` and `/zh/design-principles/`, both versions
  passing `make check`. (R1, R3, R9)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/design-principles/wechat.md` and `social/design-principles/x.md`
  exist with images from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 5 links
  forward to Part 6. (R26, R32)

## S12: Part 7, Choosing a programming language

Status: Todo

Acceptance criteria:
- Part 7 of 12, on choosing a programming language when an agent writes the
  code, is published at `/en/programming-language/` and
  `/zh/programming-language/`, both versions passing `make check`. (R1, R3,
  R9)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/programming-language/wechat.md` and
  `social/programming-language/x.md` exist with images from the article and
  pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 6 links
  forward to Part 7. (R26, R32)

## S13: Part 8, The product manager

Status: Todo

Acceptance criteria:
- Part 8 of 12, on the product manager, is published at
  `/en/product-manager/` and `/zh/product-manager/`, both versions passing
  `make check`. (R1, R3, R9)
- Each version covers what the role does today, what the factory takes over,
  what remains and grows in importance, the skills and habits to build, and
  the failure modes to avoid, and discusses the person rather than repeating
  the practice articles. (R2)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/product-manager/wechat.md` and `social/product-manager/x.md` exist
  with images from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 7 links
  forward to Part 8. (R26, R32)

## S14: Part 9, The architect

Status: Todo

Acceptance criteria:
- Part 9 of 12, on the architect, is published at `/en/architect/` and
  `/zh/architect/`, both versions passing `make check`. (R1, R3, R9)
- Each version covers what the role does today, what the factory takes over,
  what remains and grows in importance, the skills and habits to build, and
  the failure modes to avoid, and discusses the person rather than repeating
  the practice articles. (R2)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/architect/wechat.md` and `social/architect/x.md` exist with images
  from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 8 links
  forward to Part 9. (R26, R32)

## S15: Part 10, The DevOps engineer

Status: Todo

Acceptance criteria:
- Part 10 of 12, on the DevOps engineer: CI, deployment, environments, and
  the guardrails that let an agent work unattended, is published at
  `/en/devops/` and `/zh/devops/`, both versions passing `make check`. (R1,
  R3, R9)
- Each version covers what the role does today, what the factory takes over,
  what remains and grows in importance, the skills and habits to build, and
  the failure modes to avoid, and discusses the person rather than repeating
  the practice articles. (R2)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/devops/wechat.md` and `social/devops/x.md` exist with images from
  the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 9 links
  forward to Part 10. (R26, R32)

## S16: Part 11, The programmer

Status: Todo

Acceptance criteria:
- Part 11 of 12, on the programmer, is published at `/en/programmer/` and
  `/zh/programmer/`, both versions passing `make check`. (R1, R3, R9)
- Each version covers what the role does today, what the factory takes over,
  what remains and grows in importance, the skills and habits to build, and
  the failure modes to avoid, and discusses the person rather than repeating
  the practice articles. (R2)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/programmer/wechat.md` and `social/programmer/x.md` exist with
  images from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 10 links
  forward to Part 11. (R26, R32)

## S17: Part 12, The test engineer

Status: Todo

Acceptance criteria:
- Part 12 of 12, on the test engineer, is published at `/en/test-engineer/`
  and `/zh/test-engineer/`, both versions passing `make check`. (R1, R3, R9)
- Each version covers what the role does today, what the factory takes over,
  what remains and grows in importance, the skills and habits to build, and
  the failure modes to avoid, and discusses the person rather than repeating
  the practice articles. (R2)
- The two versions argue the same thesis but have their own titles,
  openings, structure, and examples; no paragraph is a sentence-by-sentence
  translation of the other. (R4)
- Each version cites at least two concrete examples from `nightshift` or
  `gridworks` that match the repositories; its centrepiece examples are
  recorded in `docs/examples.md`, and none is the centrepiece of an earlier
  article. (R5)
- Each version invents no statistics, quotes, or stories, links the source
  of every outside figure, states at least one limitation, and has a title
  that the body supports. (R6–R8)
- Figures sit where they explain a point, each a diagram with native labels
  in both languages or a screenshot with a record, with alt text and a
  caption. (R10–R14)
- `social/test-engineer/wechat.md` and `social/test-engineer/x.md` exist
  with images from the article and pass `make check`. (R15–R18)
- Both pages score 95 or higher on mobile Lighthouse, and Part 11 links
  forward to Part 12. (R26, R32)
