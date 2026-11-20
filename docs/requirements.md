# Requirements

Status: Approved

## Original request

Translated from the owner's original notes.

Create a blog for lightsout-labs about the ideas and principles of the AI
automated software factory, its design rationale, how AI-automated
development changes the software development process, which processes and
principles have to change, and how roles such as product manager, architect,
systems engineer, programmer, and test engineer are affected and what shift
each must make. The blog has an English and a Chinese version, each written
natively, not translated from the other. Also produce series of posts for
WeChat and X, which the owner publishes by hand. Titles should grab attention
and draw traffic, but the content must be substantial and useful, and the
wording must read like a normal human article with no "AI flavor". The owner
will raise issues on the content afterwards to revise it.

## Goal

A bilingual static blog at `https://lightsout-labs.github.io` that makes the
case for the "lights-out" software factory: an AI agent does the documents,
code, tests, CI, and releases, while the human decides at a few gates. The
series explains the idea, its design, and what it changes for the process and
for each role on a team, grounded in what actually happened when the
`nightshift` plugin built `gridworks`. Each article exists as a native
English piece and a native Chinese piece, and each comes with ready-to-paste
WeChat and X posts that drive readers to it. Readers are engineers, tech
leads, and product people who are deciding how to work with coding agents.

## Requirements

### Content: the series

1. The series has twelve articles, each published in English and in
   Chinese:
   1. The lights-out software factory: the idea and its principles.
   2. How the factory works: gates, hooks, documents as the record of
      progress, and one slice per context.
   3. Agile and the development process after automation: what happens to
      iterations, estimation, user stories, and ceremonies, and to the flow
      from requirements to release, including whether agreeing on the
      requirements up front is a return to waterfall.
   4. TDD and the test pyramid: tests as the agent's specification, and how
      the balance between test levels shifts.
   5. Code review by humans and by AI: what each catches, and what humans
      should review once they no longer read every diff.
   6. Design principles under automation: KISS, YAGNI, DRY, SOLID, design
      patterns, deep modules, and vertical slices; which matter more, which
      matter less, and which change meaning.
   7. Choosing a programming language when an agent writes the code: what
      weighs more (type systems, compiler and tool feedback, how well models
      know the language, ecosystem, token cost, how easily humans review
      it) and what weighs less (taste, habit, and community loyalty).
   8. The product manager.
   9. The architect.
   10. The DevOps engineer: CI, deployment, environments, and the guardrails
       (hooks, required checks, branch protection) that let an agent work
       unattended.
   11. The programmer.
   12. The test engineer.
2. Each role article (1.8 to 1.12) covers: what the role does today, what an
   automated factory takes over, what remains and becomes more important,
   the concrete skills and habits to build, and the failure modes to avoid.
   Practice articles (1.3 to 1.7)
   discuss the practice; role articles discuss the person, so the two do not
   repeat each other.
3. Each English article is 1,500 to 3,000 words; each Chinese article is
   3,000 to 6,000 Chinese characters, excluding code blocks.
4. The English and Chinese versions of an article argue the same core thesis
   but are written independently: each has its own title, opening, structure
   and examples where it suits the readership, and no paragraph is a
   sentence-by-sentence translation of the other.
5. Every article cites at least two concrete examples from the
   lightsout-labs projects (`nightshift`, `gridworks`): a gate, a hook, a
   slice, a review finding, a failure, or a number from their repositories.
   Each such claim matches what the repositories actually contain. Across
   the series, each example is the centrepiece of at most one article;
   other articles may mention it briefly and link to that article.
6. No article invents statistics, quotes, studies, or customer stories. A
   figure from outside lightsout-labs carries a link to its source.
7. Each article states at least one limitation or open problem of the
   factory approach, so the series argues rather than advertises.
8. Every title makes a specific, provocative claim that the article then
   supports in its body. No title is a question the article does not answer,
   and none promises a result the article does not show.
9. The byline on every article is "Lightsout Labs".

### Content: figures

10. Articles are illustrated. Figures sit where they make a point easier to
    grasp, such as a flow, a structure, a before-and-after, or real
    evidence, and not as decoration. There is no fixed count per article.
11. Every figure is one of two kinds:
    1. A diagram or chart generated from source kept in the repository
       (for example Mermaid, Graphviz, or a plotting script), rebuilt by a
       single `make` target.
    2. A screenshot of `nightshift`, `gridworks`, or their GitHub pages
       (pull requests, issues, CI runs), with a record next to the image
       of what it shows and where it was taken from.
12. Diagrams are generated in both languages: the Chinese article shows
    Chinese labels, the English article English labels. Screenshots are
    shared as they are.
13. Every figure has alt text and a caption in the article's language.
14. Figures are sized and compressed so that article pages still meet
    requirement 32, and are readable on a 360 px wide phone and in both
    light and dark themes.

### Content: social posts

15. For each article there is one WeChat Official Account (公众号) post in
    Chinese: its own headline (at most 30 characters), a summary line for
    the share card (at most 54 characters), and a body of 1,500 to 3,000
    characters that stands on its own and ends with a link to the full
    article. The body carries at least two images taken from the article,
    placed where they belong in the text.
16. For each article there is one X thread in English of 5 to 10 posts. Each
    post is at most 280 characters as X counts them, with a link counted as
    23. The first post works on its own as a hook and carries an image;
    at least one later post carries another image; the last post links to
    the full article.
17. Social posts live under `social/` in the repository, one Markdown file
    per post or thread, laid out so each post can be copied in one go, with
    each image's file path shown where it goes. They are not published on
    the site.
18. Social posts follow the same rules as articles: requirements 6, 8, and
    the style guide (19).

### Writing style

19. The repository has a style guide, `docs/style-guide.md`, with separate
    English and Chinese sections. It describes the voice (a practitioner
    talking to peers, plain and specific, opinionated, first-person plural
    allowed) and lists banned words, phrases, and patterns that make text
    read as machine-written, for example "delve", "in today's fast-paced
    world", "it's important to note", "game-changer", "不仅……更是",
    "赋能", "在当今……的时代", "让我们一起", and formulaic endings that
    summarize what was just said.
20. A script run by `make check` scans all articles and social posts and
    fails, naming file and line, when it finds a banned item from the style
    guide, or when a piece exceeds the style guide's limits on em-dashes,
    bolded phrases, and bullet lists per 1,000 words.
21. A script run by `make check` fails when an article or social post breaks
    the length limits of requirements 3, 15, or 16, or when an article lacks
    its counterpart in the other language.

### Site

22. The site is static, served by GitHub Pages from this repository at
    `https://lightsout-labs.github.io`, and deployed automatically when
    `main` changes.
23. English pages live under `/en/` and Chinese pages under `/zh/`; the root
    page sends the visitor to the language that matches their browser, with
    English as the default, and links to both.
24. Each language has an index page listing its articles in series order,
    with title, one-line summary, date, and reading time.
25. Every page has a language switch. On an article, it leads to the
    counterpart article in the other language.
26. Each article page shows title, byline, date, reading time, the series
    position ("3 of 8") with links to the previous and next article, and the
    article body.
27. Each language has its own RSS feed, linked from its pages.
28. Each article has a generated social share image (Open Graph and X card)
    showing its title and the Lightsout Labs name, and the page carries the
    Open Graph and X card meta tags that use it.
29. The site follows the system's light or dark theme.
30. The layout is minimal and reading-first, with typography set for both
    Latin and CJK text, and works from 360 px wide phones to desktop.
31. Every page has a unique title and meta description, a canonical URL,
    and `hreflang` links to its counterpart; the site has `sitemap.xml` and
    `robots.txt`; each article carries JSON-LD `BlogPosting` data.
32. On mobile, Lighthouse scores every page type (root, index, article) at
    95 or higher for Performance, Accessibility, Best Practices, and SEO.
33. Pages render their full content without JavaScript.

### Revision workflow

34. Content is revised through GitHub issues raised by the owner: each
    issue names an article or post and what to change, and its fix updates
    the content, passes `make check`, and closes the issue.

## Out of scope

- Comments, newsletters, analytics, or any server-side component.
- Posting to WeChat or X automatically; the owner posts by hand.
- Chinese X threads and WeChat Moments posts.
- Languages other than English and Chinese.
- A custom domain.
- Baidu-specific tuning.
- Decorative hero images or stock illustrations.

## Constraints

- Hosting is GitHub Pages for the `lightsout-labs` organization; the
  repository is `lightsout-labs/lightsout-labs.github.io`.
- Articles are written in Markdown so the owner can edit them directly.
- Article content is licensed CC BY 4.0; site code is licensed MIT.
- Factual claims about `nightshift` and `gridworks` are checked against the
  sibling repositories `lightsout-labs/nightshift` and
  `lightsout-labs/gridworks`.

## Decisions

- **Document language**: project documents are in English; the blog itself
  is bilingual.
- **CI**: GitHub Actions runs the checks and gates every merge.
- **Build**: `build` stops after each slice; Claude Code compacts at 200,000
  tokens.
- **Structure**: a series of twelve articles: two on the idea, four on
  practices (Agile and process, TDD, code review, design principles), one on
  programming language choice, and five on roles. A separate article on the
  end-to-end process was dropped because Agile and the factory's mechanism
  cover it; its waterfall question moved into the Agile article.
- **DevOps instead of systems engineer**: the role articles discuss the
  DevOps engineer rather than the systems engineer, in an article of its
  own, because the case-study projects give plenty of DevOps evidence (CI,
  deployment, hooks, branch protection) and little for systems engineering.
- **Examples**: each concrete example is the centrepiece of one article
  only, so the series does not retell the same stories.
- **Case study**: the series is grounded in `nightshift` and the `gridworks`
  build it produced.
- **Social posts**: one Chinese WeChat Official Account post and one English
  X thread per article, kept as files in the repository, not on the site.
- **Site extras**: language switch, per-language RSS, generated share cards,
  dark mode, reading time, and SEO (basics, `hreflang`, JSON-LD).
- **License**: CC BY 4.0 for content, MIT for code.
- **Style bar**: a style guide with banned phrases and patterns, enforced by
  a script in `make check`.
- **Byline**: "Lightsout Labs".
- **Length**: 1,500 to 3,000 English words; 3,000 to 6,000 Chinese
  characters.
- **Figures**: articles are illustrated with code-generated diagrams and
  screenshots of `nightshift`, `gridworks`, and GitHub, placed where they
  strengthen the text, with no fixed count; diagrams have per-language
  labels; social posts carry images.
- **Look**: minimal typographic layout; Lighthouse 95 or higher on mobile in
  all four categories.
