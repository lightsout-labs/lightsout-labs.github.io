---
title: "Nobody Reviewed These 58 Pull Requests, and the Spreadsheet Editor Works"
description: "Vibe coding builds impressive demos. We built a spreadsheet editor without reading its code to learn what industrial software needs beyond that, and which of seven open questions the build answered."
date: 2026-11-20
part: 1
---

[Gridworks](https://lightsout-labs.github.io/gridworks/) is a spreadsheet
editor that runs in the browser. It opens and saves `.xlsx` and `.csv`
files, recalculates about 150 functions, sorts, filters, freezes panes,
prints, and keeps working offline. Its
[repository](https://github.com/lightsout-labs/gridworks) has 58 merged pull
requests, made between 13 and 20 November 2026. None of them has a review
from a person. A coding agent wrote the code and the tests, opened each pull
request, and each one merged itself when CI passed.

That sounds like vibe coding with a bigger budget. It is not, and the
difference is the subject of this series. Vibe coding has already shown
that an agent can build something that looks finished. What it has not
shown is how to build something you would maintain for years, with
requirements that keep moving. We set up an experiment to find out what
that takes. This first part lays out the questions, what the experiment
answered, and what it left open.

## What vibe coding builds today

Andrej Karpathy named the practice in
[a post in February 2025](https://x.com/karpathy/status/1886192184808149383):
you describe what you want, accept what the model writes, and stop reading
the code. The best-known result is Pieter Levels'
[fly.pieter.com](https://fly.pieter.com), a multiplayer flight game in the
browser. In
[his own write-up](https://levels.io/full-multiplayer-python-websockets-game-ai)
he says he built it with an AI code editor, with no background in game
development, and that it reached $1M in annual recurring revenue in 17 days.
That revenue figure is his claim, and we have no way to check it. What the
game shows is narrower and still remarkable: a person who had never written
a game shipped a playable 3D multiplayer one.

At the other end of the scale, Anthropic's Nicholas Carlini
[had sixteen Claude agents write a C compiler in Rust](https://www.anthropic.com/engineering/building-c-compiler).
Over about 2,000 sessions and $20,000 in API costs, they produced around
100,000 lines that can build Linux 6.9 for x86, ARM, and RISC-V. That is not
vibe coding: the agents worked against a test harness, and used GCC as a
reference to find out which files they compiled wrong. The post also lists
what the compiler still cannot do.

Neither example claims more than it shows, and we will not claim more for
them. Between them they show that an agent can produce a working program of
moderate size quickly, and that a much larger one is possible when someone
builds an unusually strong way to check it.

## Seven questions industrial software raises

A game that people play for a week and a compiler checked against GCC are
not what most of us ship. Industrial software lives for years. Its
requirements change while it is being built and after it ships, its
maintainers change, and a wrong result costs someone money. Large games are
closer to that than to a weekend demo. For that kind of work, seven
questions stay open.

Can an agent develop software on its own, from requirements to release,
with people stepping in only to decide?

Do people still have to review every line? Reviewing everything an agent
writes takes as long as writing it, and outside data says AI-written code
needs the attention: CodeRabbit's
[analysis of 470 open-source pull requests](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
found about 1.7 times as many issues in AI-co-authored ones as in
human-only ones, from a vendor that sells review tools.

How does the product stay within the requirements? Agents add features,
options, and optimisations nobody asked for, and each one is code someone
has to keep working.

How does the code stay clean while features keep arriving and the
requirements keep changing? In industrial software that never stops. The
question is whether each change is absorbed by the design or patched around
it. GitClear's
[study of 211 million changed lines](https://www.devclass.com/ai-ml/2025/02/20/ai-is-eroding-code-quality-states-new-in-depth-report/1626250)
reports copy-pasted code overtaking moved, refactored code in 2024, which is
what patching around looks like at scale.

Who checks the tests, when the agent wrote both the tests and the code they
test? METR
[reported](https://metr.org/blog/2025-06-05-recent-reward-hacking/) frontier
models raising their scores by editing tests and scoring code instead of
solving the task.

How does a project stay coherent when the agent remembers nothing between
sessions? Anthropic's
[post on long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
starts from exactly that: each new session begins with no memory of the
last.

And what makes a rule hold, when an instruction in a prompt is a request the
model may not follow? In July 2025 a Replit agent
[deleted a production database during an explicit code freeze](https://fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure/).
Claude Code's own
[hooks guide](https://code.claude.com/docs/en/hooks-guide) describes hooks
as the way to make an action happen every time instead of leaving it to the
model.

## The experiment

We wrote [`nightshift`](https://github.com/lightsout-labs/nightshift), a
Claude Code plugin, to see whether a process around the agent could answer
those questions, and we used it to build Gridworks. We picked a spreadsheet
because it is industrial in miniature: hundreds of behaviours that users
know exactly from Excel, a file format that has to round-trip, and enough
features that the code could easily turn into a pile.

The plugin runs five stages. `spec` asks follow-up questions until the
requirements are agreed, `design` writes the architecture and a backlog of
vertical slices, `build` builds one slice at a time, and `release` and `fix`
handle delivery and reported defects. Three gates belong to people:
approving the requirements, approving the design, and accepting the
delivery. Approval is typing `approve`. Everything between the gates is the
agent's: one branch, one test-first build, one review by a second agent, and
one pull request per slice. How those parts fit together is the subject of
Part 2.

Our part in the Gridworks week was small and specific. We answered the
questions `spec` asked, approved the requirements and the design, approved
five later changes to the requirements, and filed five issues after using
the app. We did not open the code.

## What the experiment answered

| Question | Status | Covered in depth |
|---|---|---|
| Full autonomy | Partly answered | Part 2 |
| Line-by-line review | Answered, for this build | Part 5 |
| Staying within the requirements | Partly answered | Parts 6 and 8 |
| Clean structure under change | Partly answered | Parts 3 and 6 |
| Who checks the tests | Partly answered | Parts 4 and 12 |
| Coherence across sessions | Answered, at this scale | Part 2 |
| Rules that hold | Answered for what hooks enforce | Part 10 |

### Full autonomy: partly answered

The agent did every piece of engineering work in the 58 pull requests,
including CI, deployment, and the fixes for our issues. But it was never
meant to decide what to build, and it did not. Seven approvals and five
issues were ours, and the third gate has not happened: Gridworks has no
delivery report yet, so nobody has accepted it. What the build shows is
that the work between decisions can run unattended. Whether those decisions
can be fewer, or made by someone who is not an engineer, is still open.

### Line-by-line review: answered, for this build

Nobody read the diffs, and the product works. What replaced reading was a
stack of checks on every change (formatting, lint, types, unit tests with a
coverage floor, end-to-end tests in three browsers) and one review per
slice by a separate agent that sees the diff, the slice, and the design,
but none of the conversation that produced them. All five defects we
reported came from using the app:
[dates shown as serial numbers](https://github.com/lightsout-labs/gridworks/issues/40),
`ISFORMULA` giving `#NAME?`, a `VLOOKUP` hint without Excel's choices, a completion list
that lost its highlight, and a start screen we wanted as a dialog. We do
not know which of them a reviewer reading code would have caught. We know
that reading code was not how they were found.

### Staying within the requirements: partly answered

Every stage applies the rule "the simplest design that meets the
requirements", and the reviewer checks for scope no requirement states.
Gridworks' requirements record what it leaves out: no charts or pivot
tables, no dynamic arrays, and when we asked for `ISFORMULA`, its neighbour
`FORMULATEXT` was added and `SHEET` and `SHEETS` explicitly were not. The
formula design notes that `RAND`, `OFFSET`, and `INDIRECT` are not built.
That is evidence the boundary was kept where it was written down. We have
not audited the code for features nobody wrote down, so we cannot say the
boundary held everywhere.

### Clean structure under change: partly answered

This is the question the week can say least about, so it gets the most
care.

The requirements changed five times after the first approval: twice on
our own initiative, three times in answer to issues. On 16 November we added
Excel's Point mode, for picking references with Shift, Ctrl, and the
arrow keys, and the fill-handle options menu. Each went in as an edit to the requirements,
approved like the original, and a new slice (S33 and S34) placed in the
backlog where it belonged, before slices already planned. From 18 to 20
November our five issues followed one path. The agent wrote a planning pull
request first. A defect, such as the dates, only added a slice to the
backlog; a change of behaviour, such as turning the start screen into a
dialog, also rewrote the requirement and waited for our approval. Then a
normal slice pull request built it. The five issues became S35 to S40.

Where the design had to move, the change shows up in the architecture
document as an edit to one module's interface. The
[argument values for formula help](https://github.com/lightsout-labs/gridworks/pull/51)
widened `argumentHint` in the formula module and added two notes to the
grid's design and one to the formula module's. `ISFORMULA` needed the evaluation context to expose a
cell's formula, a one-line change to the same interface. The workbook
dialog, which replaced a whole screen, changed one requirement and no part
of the architecture; its slice touched 15 files. Earlier, a measurement
had overturned a design decision. The requirement is a 10 MB file opened
within 5 seconds, and ExcelJS took 4.5 seconds in Node just to load an
11 MB file, before any of Gridworks' own work. The agent recorded a
[new decision](https://github.com/lightsout-labs/gridworks/blob/main/docs/adr/0006-own-xlsx-reader.md)
to write its own reader, and later its own writer, and marked the old one
as superseded.

How far does that go? It shows that changes arriving during a build were
taken into the requirements and the design before any code, through the
same gates as the original plan, and that each landed in one module. It
does not show that the architecture holds up over the life of a product. A
week is short, all the changes were small, and one codebase built in one
pass has not yet met the change that cuts across its modules. That needs
months of real use and a second project.

### Who checks the tests: partly answered

Tests come first, from the slice's acceptance criteria, and each must fail
before the code exists. The reviewer reads the tests for meaning, and the
rules forbid weakening a test or the coverage floor to get a check to pass.
That covers a test that is wrong about the criterion. It does not cover a
criterion that is wrong about the product. The slice that built the date
functions said they return Excel's serial numbers, and the tests checked
exactly that. Typing `=DATE(2026,11,18)` then showed `46344`, which is the
serial number Excel stores and never what it shows. Every check was right
and the product was wrong. The final check on the tests turned out to be a
person using the app, and so far nothing earlier replaces that.

### Coherence across sessions: answered, at this scale

Each slice started from a cleared context and read its state from files:
the requirements, the architecture, the design notes of the modules it
touched, and the backlog. Slices left notes for later ones by number. S33
warned that from S24 on, any new way to change an entry's text must go
through the view; S39 told S40 which CSS classes would make the new dialog
open in place. The weak point is size. The architecture document reached
65 KB before module decisions were split out into `docs/design/` on
18 November, which brought it down to 21 KB. A backlog of 1,378 lines is
still readable. One ten times larger may not be.

### Rules that hold: answered for what hooks enforce

`nightshift` puts its hard rules in hooks, which run outside the model. The
agent cannot write an approved status into a gated document; only a prompt
the person types as `approve` does that. It cannot commit to `main`. It
cannot end a slice while `make check` fails, and after three failed fixes in
a row it is told to stop and ask. The plugin's own
[delivery report](https://github.com/lightsout-labs/nightshift/blob/main/docs/delivery/v0.1.0.md)
states the limit: the `main` hook "stops mistakes, not a determined bypass",
so server-side branch protection is still needed. Rules that need judgment,
such as keeping the design simple, are still prompts, checked only by the
reviewer.

## Where this leaves us

Four of the seven questions are only partly answered, and the evidence for
all of them is a single product, written in TypeScript over a week. A second
project, in a language with a stricter compiler and built by a team, is the
obvious next test.

The clearest lesson is about where people stand. The defects that reached us
were gaps in what we had asked for, not in how the code was written, and we
found them by using the product. If the agent writes the code and the
tests, the requirements are the only thing both are checked against. Part 2
starts there, with how the factory is built so that writing them down is
where human attention goes.
