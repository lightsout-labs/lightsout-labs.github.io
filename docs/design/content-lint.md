# Content linter

Decisions inside `tools/content-lint` that the code does not make obvious.
What the module is for is in [the architecture](../architecture.md); the
rules themselves are in [the style guide](../style-guide.md).

## Rule blocks

- A rule is one line: `ban: <text>`, `pattern: <regular expression>`, or
  `limit: <em-dash | bold | bullet-lists> <number>`. Lines starting with `#`
  are comments. Anything else is reported as a malformed rule at its line
  in the guide, and so is a pattern that does not compile, so a broken rule
  fails the check instead of passing silently (ADR 0003).
- Bans and patterns ignore case. A `ban` matches whole words when it starts
  or ends with a Latin letter or digit, so `synergy` does not match
  `synergyless`; Chinese bans match anywhere, since Chinese has no word
  spaces. A space in a ban matches any whitespace, including a line break,
  because paragraphs are wrapped in the source.
- Typographic apostrophes are read as plain ones before matching, so the
  guide can write `it's` once for both.

## What is checked where

- Bans run over the whole file except code and link targets, including the
  front matter, so a banned word in a title or summary is caught. Lengths
  and densities count only the body.
- A density limit is per 1,000 words in English and per 1,000 characters in
  Chinese, the units of the length rules. The problem names the line of the
  first occurrence beyond the allowed count, which is where an edit helps.
- In Chinese a double em-dash, `——`, the normal Chinese dash, counts as one.
- A bullet list is a run of item lines (`-`, `*`, `+`, or `1.`) and
  indented continuation lines; a blank line ends it. A loose list, with
  blank lines between its items, therefore counts once per item. That errs
  toward stricter, which suits a limit meant to discourage lists.
- A length or pairing problem is reported at line 1, as it concerns the
  whole file.

## Social posts

- A post is checked against the article of the same slug in its language:
  Chinese for `wechat.md`, English for `x.md`. A post without that article
  is reported and checked no further.
- Bans and density limits are the article rules, over the whole post; an X
  thread's densities are per 1,000 words of the whole thread.
- The WeChat headline and summary count every character, punctuation and
  spaces included, as WeChat's own fields do. The body uses the article
  count, so a bare web address, like a link target, adds nothing to it.
- An X post's length is `twitter-text`'s weighted length of its text
  without its image lines, as images are attachments.
- The closing link is any `http(s)` address ending in `/<lang>/<slug>/`:
  for WeChat on the last line of the file, for X in the last post. The
  linter does not repeat the site's origin from the Astro config.
- Image count problems and link problems concern the whole post or thread
  and are reported at line 1; a post's own length or link problem at its
  first line.

## Running

The CLI is TypeScript run directly by Node (24 or later strips types), so
`make check` needs no build step or extra runner. Imports therefore carry
the `.ts` extension.
