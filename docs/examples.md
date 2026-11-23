# Centrepiece examples

The `nightshift` and `gridworks` examples each article is built around, with
where each comes from. An example is the centrepiece of one article only
(R5); other articles may mention it briefly and link to that article. Read
this before writing an article and add its entries in the same change.

## Part 1: The lights-out software factory (`lights-out-factory`)

Centrepieces:

- **The `gridworks` week.** From the requirements draft on 13 November 2026
  (gridworks #1) to S40 on 20 November 2026 (gridworks #63): 58 merged pull
  requests, none with a review from a person, each merged automatically once
  CI passed. Our part was seven approvals (requirements, design, and five
  requirement changes: gridworks #25, #28, #51, #54, #61) and five issues
  (gridworks #40, #42, #44, #48, #58). No delivery report yet.
- **Requirement changes taken in during the build.** S33 and S34, added on
  16 November (gridworks #25, #28) ahead of planned slices; the five issues
  planned in docs pull requests (gridworks #47, #51, #53, #54, #60, #61) and
  built as S35 to S40; the interface edits in `docs/architecture.md` for
  #42 (`argumentHint`) and #44 (the evaluation context gives a cell's
  formula); the workbook dialog changing R34 and no architecture, its slice
  touching 15 files (gridworks #63); ADR 0006 and 0007 replacing ExcelJS
  after a measurement (4.5 s for an 11 MB file).
- **The date bug as the limit of agent-written tests.** S10's criterion
  ("using Excel's serial numbers") and its tests passed, and
  `=DATE(2026,11,18)` showed `46344` (gridworks #40, fixed in S35, #49), with
  S35's note that `=TODAY()+7` still differs from Excel.

Figures:

- `figures/screenshots/gridworks-merged-pulls.png`: the 58 merged pull
  requests on GitHub, the evidence for the `gridworks` week.
- `figures/diagrams/stages-and-gates`: the five stages and three gates of
  `nightshift`, drawn at overview level. Part 2 may draw the stages in
  detail with its own diagram.

Mentioned briefly, free to be another article's centrepiece:

- The outside sources of the seven questions: Karpathy's post, fly.pieter.com,
  Anthropic's C compiler, CodeRabbit, GitClear, METR on reward hacking,
  Anthropic on long-running agents, the Replit database deletion, and the
  Claude Code hooks guide.
- The hooks: gate protection, approval by typing `approve`, `main`
  protection, check before stopping, and the three-failed-fixes stop
  (Parts 2 and 10), with the limits in
  `nightshift/docs/delivery/v0.1.0.md`.
- Notes passed between slices (S33's note on `point`, S39's note for S40),
  and the architecture document growing to 65 KB before the split into
  `docs/design/` (gridworks #46) (Part 2).
- Scope recorded as excluded: charts and pivot tables, dynamic arrays,
  `SHEET` and `SHEETS`, and `RAND`, `OFFSET`, `INDIRECT` (Parts 6 and 8).
- The other four issues (gridworks #42, #44, #48, #58) as defects found by
  using the app (Part 5).

Freed by the rewrite, no longer used in Part 1:

- The seventeen original notes in `nightshift/docs/requirements.md`, note 3
  ("Save tokens. Do not launch a crowd of agents."), and the "Single-agent
  rule" and "Independent code review" decisions with
  `nightshift/agents/slice-reviewer.md`.
