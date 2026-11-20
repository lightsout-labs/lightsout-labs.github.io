# 0003: Keep the machine-checked style rules inside the style guide

## Context

R19 asks for a style guide with banned items, and R20 asks for a check that
fails on them. The owner will revise the voice through issues, and each
change of taste should change both what writers read and what the check
enforces.

Options considered:

- **Rules in a separate config file** (YAML or JSON) next to the linter:
  easy to parse, but the guide and the config drift apart.
- **Rules in the guide's prose**, parsed from lists: brittle; an edit to
  the wording breaks the check.
- **Rules in tagged fenced blocks inside the guide**: one file, readable by
  people, exact for the linter.

## Decision

`docs/style-guide.md` holds the rules in fenced blocks tagged
`style-rules-en` and `style-rules-zh`. Each block lists banned words and
phrases (one per line), banned patterns (regular expressions, marked as
such), and the density limits per 1,000 words or 1,000 characters. The
linter reads only these blocks; the prose around them explains the reasons
and gives examples.

## Consequences

- Changing the voice is one edit in one file.
- The linter fails, naming the line, if a block is malformed, so a broken
  rule cannot pass silently.
- Rules that need judgment, such as "no formulaic ending that summarizes
  what was just said", stay in prose for writers and reviewers; only the
  ones a pattern can catch go in the blocks.
