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

## Running

The CLI is TypeScript run directly by Node (24 or later strips types), so
`make check` needs no build step or extra runner. Imports therefore carry
the `.ts` extension.
