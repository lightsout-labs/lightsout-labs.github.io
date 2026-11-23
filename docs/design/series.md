# Series model

Decisions inside `src/lib/series` that the code does not make obvious. What
the module is for is in [the architecture](../architecture.md).

- The module takes the content collection's entries as an argument,
  `seriesOf(entries, site)`, instead of calling `getCollection` itself. Astro's
  `astro:content` module exists only inside an Astro build, so this keeps
  the ordering, pairing, and reading-time logic testable in Vitest with
  plain objects. Pages call
  `seriesOf(await getCollection("articles"), import.meta.env.SITE)`.
- An entry's id is `<lang>/<slug>`, as the glob loader in
  `src/content.config.ts` names it from the file path; the module splits it
  and does not read the file system.
- `seriesOf` also takes the site's origin, which pages pass as
  `import.meta.env.SITE`, so absolute URLs are built in one place and the
  origin is written only in the Astro config. `robots.txt` is an endpoint
  for the same reason.
- There is no `article` or `counterpart` operation: an article page gets
  its article from `getStaticPaths`, and the counterpart matters only
  inside `pageMeta`, for `hreflang` and the language switch.
- `pageMeta` holds every title and summary the site shows outside an
  article: the root page's and each index's, which is also the index's
  tagline. Titles differ per page (R31): an index is "<topic> | Lightsout
  Labs" in its language, an article "<title> | Lightsout Labs", the root
  just "Lightsout Labs".
- `hreflang` is `en` and `zh-CN`, the same values as the pages' `lang`.
  The root page and both indexes list each other's languages and name the
  root `x-default`, since the root is the page that picks a language. An
  article lists only the languages it exists in; the linter requires both,
  but if one is missing the switch goes to the other language's index
  rather than to a page that does not exist.
- The root page has no language switch; its body is already the two
  language links. It links both feeds.
- `pageMeta` gives the JSON-LD already serialized, with `<` written as
  `\u003c`, so a title containing `</script>` cannot end the element the
  layout puts it in.
- The JSON-LD author is an `Organization`, as Lightsout Labs is not a
  person, and `datePublished` is the date alone, as the front matter has
  no time.
- The series position stays with `Facts` (Part n of `SERIES_SIZE`), so
  `neighbours` gives only the previous and next articles.
- Reading time is rounded up and is at least one minute, so a short page
  never shows "0 min read".
