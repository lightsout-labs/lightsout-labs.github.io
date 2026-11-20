# Centrepiece examples

The `nightshift` and `gridworks` examples each article is built around, with
where each comes from. An example is the centrepiece of one article only
(R5); other articles may mention it briefly and link to that article. Read
this before writing an article and add its entries in the same change.

## Part 1: The lights-out software factory (`lights-out-factory`)

Centrepieces:

- **The `gridworks` week.** From the requirements draft on 13 November 2026
  (gridworks #1) to S40 on 20 November 2026 (gridworks #63): 40 slices and
  58 merged pull requests, none with a review from a person, each merged
  automatically once CI passed. The owner's part was two approvals, five
  issues (gridworks #40, #42, #44, #48, #58), and acceptance. The 54
  numbered requirements are in `gridworks/docs/requirements.md`.
- **The seventeen original notes and the single-agent rule.** The owner's
  notes at the top of `nightshift/docs/requirements.md`: note 2 (the human
  reviews requirements and design and accepts delivery; the AI does
  everything else) and note 3 ("Save tokens. Do not launch a crowd of
  agents."), and the "Single-agent rule" and "Independent code review"
  decisions in the same file, with the reviewer in
  `nightshift/agents/slice-reviewer.md`.

Mentioned briefly, free to be another article's centrepiece:

- gridworks #40, date results shown as serial numbers (`46344`), fixed in
  S35 (gridworks #49).
- gridworks #58, the request for "a beautiful dialog", which became S39 and
  S40.
- The known limits in `nightshift/docs/delivery/v0.1.0.md`: behavior checked
  only by building `gridworks`, and `main` protection as a local hook.
- The hooks: gate protection, `main` protection, check before stopping
  (Part 2).
