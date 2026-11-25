# Centrepiece examples

The `nightshift` and `gridworks` examples each article is built around, with
where each comes from. An example is the centrepiece of one article only
(R5); other articles may mention it briefly and link to that article. Read
this before writing an article and add its entries in the same change.

## Part 1: The lights-out software factory (`lights-out-factory`)

Centrepieces:

- **The `gridworks` week.** From the first commit on 13 November 2026 at
  20:44 to the merge of S40 on 20 November at 15:51 (+08:00, gridworks
  #63): 58 merged pull requests, none with a review from a person, each
  merged automatically once CI passed. Our part was answering `spec`'s
  questions, two approvals (requirements and design), five approved
  requirement changes (gridworks #25, #28, #51, #54, #61), and five issues
  (gridworks #40, #42, #44, #48, #58). No delivery report yet.
- **What was built, in numbers** (checked at S40 with `git ls-files` and
  `wc -l`): 75 files and 25,651 lines of production code in `src`, 184
  functions in `LIBRARY`, more than 470 unit tests and more than 130
  end-to-end tests (counted as `it`/`test` calls; `it.each` makes more
  cases), and its own `.xlsx` reader and writer after ExcelJS took 4.5 s to
  load an 11 MB file (ADR 0006 and 0007).
- **What stood in for reading the code.** The requirements as the only
  source, tests written first, the slice reviewer (blocking findings in 21
  of 40 slices, 26 in all, from the `Review` sections of the pull requests;
  briefly the `javascript:` link in S27, gridworks #37, and `0^-1` in S07,
  gridworks #10), the hooks, CI, and the three gates.
- **The date bug handled with no person reading code.** S10's criterion
  ("using Excel's serial numbers") and its tests passed, and
  `=DATE(2026,11,18)` showed `46344` (gridworks #40, filed 18 November);
  `fix` planned S35 (gridworks #47, merged 17:23) and S35 merged at 17:40
  (gridworks #49), closing the issue, with S35's note that `=TODAY()+7`
  still differs from Excel.
- **Requirement changes in brief.** S33 and S34 added on 16 November
  (gridworks #25, #28), and the workbook dialog changing one requirement
  and no architecture, its slice touching 15 files (gridworks #63).

Figures:

- `figures/screenshots/gridworks-merged-pulls.png`: the 58 merged pull
  requests on GitHub, the evidence for the `gridworks` week.
- `figures/diagrams/stages-and-gates`: the five stages and three gates of
  `nightshift`, drawn at overview level. Part 2 may draw the stages in
  detail with its own diagram.

Mentioned briefly, free to be another article's centrepiece:

- The hooks in detail, with the limits in
  `nightshift/docs/delivery/v0.1.0.md` (Parts 2 and 10).
- Each slice starting from a clean context and reading the documents;
  notes passed between slices (S33's note on `point`, S39's note for S40),
  and the architecture document growing to 65 KB before the split into
  `docs/design/` (gridworks #46) (Part 2).
- The reviewer's individual findings beyond the two above (Part 5).
- The other four issues (gridworks #42, #44, #48, #58) as defects found by
  using the app (Part 5), and the interface edits for #42 and #44.

Freed by the rewrites, no longer used in Part 1:

- The vibe coding examples and outside reports: Karpathy's post,
  fly.pieter.com, Anthropic's C compiler, CodeRabbit, GitClear, METR on
  reward hacking, Anthropic on long-running agents, the Replit database
  deletion, and the Claude Code hooks guide.
- The seven questions and their table of conclusions.
- Scope recorded as excluded: charts and pivot tables, dynamic arrays,
  `SHEET` and `SHEETS`, and `RAND`, `OFFSET`, `INDIRECT` (Parts 6 and 8).
- The seventeen original notes in `nightshift/docs/requirements.md`, note 3
  ("Save tokens. Do not launch a crowd of agents."), and the "Single-agent
  rule" and "Independent code review" decisions with
  `nightshift/agents/slice-reviewer.md`.
