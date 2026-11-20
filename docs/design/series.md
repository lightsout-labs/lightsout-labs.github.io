# Series model

Decisions inside `src/lib/series` that the code does not make obvious. What
the module is for is in [the architecture](../architecture.md).

- The module takes the content collection's entries as an argument,
  `seriesOf(entries)`, instead of calling `getCollection` itself. Astro's
  `astro:content` module exists only inside an Astro build, so this keeps
  the ordering, pairing, and reading-time logic testable in Vitest with
  plain objects. Pages call `seriesOf(await getCollection("articles"))`.
- An entry's id is `<lang>/<slug>`, as the glob loader in
  `src/content.config.ts` names it from the file path; the module splits it
  and does not read the file system.
- `article(lang, slug)` and the other operations the architecture lists
  are added by the slice whose pages first need them (S05 for the language
  switch and navigation), not before.
- Reading time is rounded up and is at least one minute, so a short page
  never shows "0 min read".
