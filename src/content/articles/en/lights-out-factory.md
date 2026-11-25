---
title: "Nobody Read Our 58 Pull Requests, and the Spreadsheet App Is Live"
description: "A coding agent built Gridworks, a spreadsheet app in the browser, and every pull request merged without a human reading it. Our claim: write the requirements and the checks, and who writes the code stops mattering."
date: 2026-11-20
part: 1
---

Between 13 and 20 November 2026, 58 pull requests merged into the
[Gridworks repository](https://github.com/lightsout-labs/gridworks). Not one
of them was read by a person. A coding agent wrote the code and the tests,
opened each pull request, and each one merged itself when CI passed and was
then deployed. The result is a spreadsheet app that anyone can
open at [lightsout-labs.github.io/gridworks](https://lightsout-labs.github.io/gridworks/)
right now.

Our own part in that week was small. We answered the questions the agent
asked while it pinned down the requirements, typed `approve` on the
requirements and on the design, approved five changes to the requirements
later on, and filed five issues after using the app. We never opened the
code.

![GitHub's list of Gridworks pull requests filtered to merged ones: 58 closed and none open. The latest is #63, "feat: the workbook dialog (S40)", merged on 20 November 2026.](fig:gridworks-merged-pulls "The 58 merged pull requests of Gridworks on GitHub, the latest on 20 November")

Here is the position we take from it. Give an agent clear requirements and a
written way to verify them, and it builds the software with nobody watching.
Whether a human writes the code no longer matters. What matters is the
specification, and the checks that hold the agent's output to it.

This piece is for engineers who have not yet watched an agent do this. It
shows what was built, what took the place of code review, how one defect went
from issue to fix without anyone reading code, and what we think it means for
people whose job has been writing code.

## What the agent built in under a week

Gridworks is a spreadsheet editor that runs entirely in the browser, with no
install and no account. It opens and saves real `.xlsx` files and reads and
writes `.csv`. It sorts, filters, freezes panes, applies conditional formats
and data validation, prints, and keeps working offline. The interface comes
in English and Chinese, in light and dark themes.

We counted the rest in the repository as we wrote this. The first commit is
dated 13 November at 20:44 and the last merge 20 November at 15:51 (UTC+8),
so the build took less than seven days. The production code in `src` is
25,651 lines across 75 files. The formula engine implements 184 Excel
functions. There are more than 470 unit tests, and more than 130 end-to-end
tests that run in Chromium, Firefox, and WebKit.

The `.xlsx` support is the agent's own code. It started with ExcelJS, then
measured it: loading an 11 MB file took 4.5 seconds in Node, and the
requirements said a 10 MB file must open within five. So it recorded
[an architecture decision](https://github.com/lightsout-labs/gridworks/blob/main/docs/adr/0006-own-xlsx-reader.md)
to write its own reader, and later another one for its own writer.

The work was split into 40 slices, each a thin vertical piece of the product
with its own branch and pull request. The other pull requests carry the
requirements, the design, the requirement changes, the plans for fixing
issues, and a few adjustments to tests and CI.

A day of this looks dull from the outside. We type `/nightshift:build` in
Claude Code. The agent picks the first slice in the backlog that isn't done,
branches from `main`, writes the tests, writes the code, runs the checks,
hands the diff to a reviewer, opens the pull request, and waits for CI to
merge it. Then it stops. We type `/clear` to empty its context and run the
command again. Most of the time we were doing something else, and checked in
now and then to try the new feature on the live site.

The requirements did not stay still. On 16 November we wanted Excel's Point
mode, where you pick a reference with the arrow keys or the mouse while
typing a formula, and the options menu that appears after dragging the fill
handle. Three issues later asked for changes in behavior, such as replacing
the full-screen workbook list at startup with a dialog. Each change went into
the requirements first, waited for our `approve` like the original, and then
became new slices in the backlog. The dialog changed one requirement and no
part of the architecture, and the slice that built it touched 15 files.

## What stood in for reading the code

Nobody reading the code is not the same as nobody checking it. The checking
that review used to do was split into five things, each written down in the
repository and each run on every change.

The first is the requirements. Gridworks was built with
[`nightshift`](https://github.com/lightsout-labs/nightshift), a Claude Code
plugin we wrote. Its `spec` stage keeps asking until the requirements are
specific enough to test, then stops for our approval. After that the
requirements are the agent's only source of truth: the design comes from
them, every slice's acceptance criteria come from them, and the tests come
from the criteria. Every slice starts with an empty context, so the agent
remembers nothing from the previous one and picks up from the requirements,
the architecture, the design notes of the modules it touches, and the
backlog. Whatever those documents leave out, the next slice does not know.

The second is tests written before the code. Each slice turns its acceptance
criteria into tests, runs them, and confirms they fail because the behavior
is missing. The rules forbid weakening a test, lowering the coverage floor,
or relaxing a lint rule to get a check to pass.

The third is a review by a second agent. When a slice is done, a read-only
reviewer gets the diff, the slice, and the design of the modules it touches.
It never sees the conversation that produced the code. Its verdict goes into
the pull request description, where anyone can read it. In 21 of the 40
slices it raised at least one blocking finding, 26 in all, and each was fixed
before the pull request opened. In the slice that added hyperlinks to cells,
it caught that a `javascript:` link would be stored and followed; the fix
allows only `http:`, `https:`, and `mailto:`. In the formula slice it caught
that `0^-1` returned `#NUM!` where Excel returns `#DIV/0!`.

The fourth is hooks. A rule in a prompt is a request the model can ignore. A
hook runs outside the model, so it holds whether the model agrees or not.
The agent cannot mark a document approved; only a human typing `approve`
does that. It cannot commit to `main`. It cannot stop in the middle of a
slice while `make check` fails, and after three failed fixes in a row it has
to stop and ask us.

The fifth is CI and the three gates. Every pull request runs formatting,
lint, type checks, unit tests with a coverage floor, and the end-to-end tests
in three browsers, and merges only when all of them pass. The gates are where
humans decide: approving the requirements, approving the design, and
accepting the delivery.

![A top-to-bottom flowchart: spec, where we approve the requirements; design, where we approve the design; then build, which repeats one slice at a time, with fix turning the defects we report into slices for build; and finally release, where we accept the delivery.](fig:stages-and-gates "The five stages of nightshift and the three gates where we decide")

Together these answer the question a code reviewer asks: does this change do
what the requirements say? Every one of these checks runs on every pull
request, however tired or rushed anyone is.

## The date bug, fixed without anyone reading code

On the morning of 18 November we typed `=DATE(2026,11,18)` into a cell and
got `46344`. `TODAY()`, `NOW()`, and `TIME(14,30,0)` did the same. The number
is not wrong. It is the serial number Excel stores for that date, but Excel
shows it to you as `11/18/2026`.

We filed [issue #40](https://github.com/lightsout-labs/gridworks/issues/40).
It is a list of formulas, each with what it should show and what it showed.

From there the agent did the work, and we ran two commands, `fix` and then
`build`. The `fix` stage read the issue, judged that it broke an approved
requirement (function results match Excel), and opened a pull request that
changed only the backlog: a new slice, S35, at the front, with the issue's
examples as its acceptance criteria. That merged at 17:23. S35 then ran like
any slice. Its tests failed first, the code changed, the reviewer raised two
minor points and nothing blocking, and at 17:40 the fix merged, the issue
closed itself, and the new version deployed.

Afterwards we looked at how the bug got in. Slice S10 built the date
functions, and its acceptance criterion said they return Excel's results for
the examples in Excel's documentation, "using Excel's serial numbers". The
tests checked serial numbers, and they all passed. Every check was right. The
criterion never said what the user should see.

We think this is the most useful thing that happened all week. The defect
was in the specification, and the fix was too: once "shows as a date" was
written into a criterion, the tests followed and the code followed. Nobody
needed to read the code, and nobody did.

## What this means if you write code for a living

Hand the same requirements to an agent twice and you will get two different
codebases, with modules cut differently, names chosen differently, and tests
written differently. Some engineers take that as proof the agent can't be
trusted. We see it the other way. With complete verification, every one of
those results meets the requirements, and they differ only where the
requirements say nothing. Nobody should care what happens there.

That moves where an engineer's effort goes. The hours spent writing code and
reading other people's code go into two things: requirements precise enough
to check, and checks that run on their own. The S10 criterion sat in a
backlog we approved, and we let it through. The people who can write that
sentence correctly, and who can spot it when it is wrong, are the ones worth
the most from here on.

Looking back at the week, everything we wrote was specification. We answered
`spec`'s questions, approved requirements and changes, and filed issues. The
body of #40 is a table of formula, expected display, and actual display, and
the agent turned it almost word for word into S35's criteria. Writing a good
issue and writing a good test turn out to be the same skill.

We also know what this build does not prove. All the evidence comes from one
product, in TypeScript, built in under seven days, whose changes were small
and which has not been maintained for years. The third gate has not been
passed: Gridworks has no delivery report yet. And our premise of complete
verification did not hold here. We found the date bug by using the app, and
S35's own note records one remaining difference from Excel: `=TODAY()+7`
does not pick up a date format. Verification is only as complete as the
requirements are clear, and getting them clear is still on people.

If you doubt the claim, test it the direct way. The approved
[requirements for Gridworks](https://github.com/lightsout-labs/gridworks/blob/main/docs/requirements.md)
are in the repository. Build the whole thing from them, with `nightshift` or
with a process of your own, and compare what you get with ours: whether
every feature is there, whether the tests pass, and where the defects turn
up. We would like to see the result.
