---
title: "Stop Reading the Diffs: In a Lights-Out Software Factory, People Only Decide"
description: "58 pull requests, none reviewed by a person, and a working spreadsheet editor. What the human did instead, and the principles that made it safe."
date: 2026-11-20
part: 1
---

Between the evening of 13 November and the afternoon of 20 November 2026,
the [`gridworks`](https://github.com/lightsout-labs/gridworks) repository
went from an initial commit to a spreadsheet editor that opens and saves real
`.xlsx` files, recalculates formulas, sorts, filters, works offline, and
prints. It took 40 slices and 58 merged pull requests. Not one of those pull
requests has a review from a person on it. Each one merged itself once CI
went green.

The human who owns the project did not write the code, and did not read it
either. They answered questions about what the product should do, approved
two documents, opened five issues when something looked wrong, and accepted
what came out. Everything else, from the architecture to the tests, the CI
workflow, the deployment and the work on those five issues, was done by a
coding agent running a Claude Code plugin we wrote for the purpose,
[`nightshift`](https://github.com/lightsout-labs/nightshift).

We call this a lights-out software factory, after the factories that run
with the lights off because nobody needs to be on the floor. This series is
about what it takes to build software that way, what it changes, and where
it still falls short. This first part is about the idea itself. The claim is
simple and, for most teams, uncomfortable: once an agent writes the code,
the most useful thing a person can do is stop reading diffs and start
making decisions.

## What the human actually did

It helps to be precise about the human's part, because "the AI did
everything" is not true and not interesting.

The owner did four kinds of work on `gridworks`.

They agreed the requirements. The agent drafted
[`docs/requirements.md`](https://github.com/lightsout-labs/gridworks/blob/main/docs/requirements.md)
after asking follow-up questions, and the owner read it and typed
`approve`. The result has 54 numbered requirements, from "each sheet
supports at least 100,000 rows" to keyboard shortcuts and print layout.

They approved the design. The agent wrote the architecture, the decision
records, and a backlog of vertical slices. The owner read them and approved
them. From that point on, no slice needed the owner's permission to start
or to merge.

They reported what they saw. About 30 slices in, the owner used the product
and filed issues. One said that `=DATE(2026,11,18)` showed `46344` instead of a
date. Another asked to change the list of workbooks into "a beautiful dialog,
instead of a full screen view". Each issue became one or two slices, built
and merged the same way as the rest.

They accepted the delivery. That is the last gate, and it is where the
person who will live with the product says yes.

That is the whole job. No code review, no pairing, no standup, no "can you
take a quick look at this". The owner spent their attention on what the
software should do and whether it does it, and none on how.

## Why not just review the code?

The usual answer to "can we trust what the agent wrote?" is "a senior
engineer reviews every pull request". It sounds responsible. We think it is
the wrong place to put a person.

Reading a diff tells you whether the code looks reasonable. It does not tell
you whether the product is right. A reviewer looking at the code that
showed date results as serial numbers would have seen tidy code with
passing tests. The mistake was not in the code; it was in a gap between what Excel
users expect and what the requirement said. The owner found it by typing a
formula into the running app.

Reading every diff also does not scale with an agent. The agent produced 58
pull requests in a week. A person who reviews each one carefully becomes the
bottleneck the factory was meant to remove, and a person who reviews each
one quickly is not really reviewing. Either way their attention is spent on
the thing machines are better at checking, and taken from the thing only
they can decide.

So the factory moves the human. Code is checked by machines: formatters,
linters, type checkers, unit and end-to-end tests, a coverage floor, and a
second agent that reviews each slice from a fresh context. Intent is
checked by the human, at the points where intent is set: before anything is
built, and when it is delivered.

## Where the idea came from

`nightshift` started as a list of seventeen notes from its owner, kept at the
top of its
[requirements](https://github.com/lightsout-labs/nightshift/blob/main/docs/requirements.md).
Read now, they are a fair statement of the principles. The second note sets
the division of labour: the human reviews the requirements and the design and
accepts the final delivery, and the AI is responsible for everything else,
including the documents, the build, the tests, CI, and releases.

The third note is the one people find surprising: "Save tokens. Do not
launch a crowd of agents. Run through to the end, pausing only where human
confirmation is part of the workflow."

A lot of writing about AI software factories imagines a swarm: a planner
agent, a coder agent, a tester agent, a reviewer agent, all talking to each
other. `nightshift` went the other way. Its requirements turned the note into
a rule: the workflow never splits its work across several agents or runs
agents in parallel. One agent builds a slice from start to finish. The only
other agent the workflow launches is a read-only reviewer, once per slice,
which sees the diff, the slice's acceptance criteria, and the design, and
nothing of the conversation that produced them.

There are two reasons, and both are principles of the factory rather than
details of the tool.

The first is cost and clarity. Every hand-off between agents is a place
where context is lost and has to be rebuilt, which costs tokens and invites
misunderstanding. One agent with the right files in front of it does not
need to brief anyone.

The second is accountability. When a slice fails, there is one place to
look: the slice's branch, its notes, and its pull request. A swarm spreads a
failure across conversations nobody will read.

The reviewer is the exception because independence is its whole value. A
builder that reviews its own work in the same context will mostly agree with
itself.

## The principles

Strip away the tooling and the factory rests on a handful of ideas. Each of
them has a later article of its own; here is the short version and why each
one matters to the whole.

### People decide, machines verify

Every check that can be automated is automated, and runs on every change.
What is left for people is the set of questions no script can answer: what
should this do, is this design acceptable, is this what we wanted. If a
human finds themselves verifying something a machine could verify, that is
a gap in the factory, not a job.

### Agree before you build

The requirements and the design are agreed before the first line of code,
and the agent asks until they are. This looks like waterfall, and the
article on agile in this series takes that charge seriously. The difference
is that the agreement is cheap to change: a new requirement or a reported
defect goes into the backlog as a new slice, the same day.

### Rules live in code, not in prompts

An instruction in a prompt is a suggestion. `nightshift` enforces the rules
that matter with hooks that run outside the model: the agent cannot approve
its own gate, cannot commit to `main`, and cannot stop while `make check`
fails, until the third failure in a row sends it to ask a person. How those hooks work is the subject of the next article.

### Small vertical slices, one at a time

Work is cut into slices that each deliver something testable end to end,
from the interface down to storage. Each slice is one branch, one review,
and one pull request, and starts from a clean context. `gridworks` is 40
such slices, and each merge deployed a working product.

### The repository is the memory

The agent does not remember the last session. Everything it needs, from
requirements and design to the backlog and each slice's notes, is in files
under `docs/`, versioned with the code. A person can read the state of the
project without asking anyone, and so can the next session of the agent.

### The simplest thing that meets the requirements

An agent will happily build what nobody asked for: a plugin system, a
configuration layer, an abstraction for a second database. The factory
treats that as a defect. Every stage, from requirements to review, checks
for scope that no requirement states.

## What it does not solve

We built the factory, so we are the wrong people to call it finished. Three
problems are real.

The first is that green checks are not the same as a right product. The
date bug passed every check in CI and the slice review. The
owner caught it, but only because they used the app. The factory's answer,
an acceptance gate and an issue tracker, works, but it means the human's
judgment arrives late, after 30 slices, rather than while each one is built.
Making that loop shorter without bringing back line-by-line review is an
open problem.

The second is that requirements carry more weight than most people are used
to giving them. The owner's request for a "beautiful dialog" was a matter of
taste that no requirement had captured. When the human only decides at
gates, anything they did not say is decided by the agent. Some people will
find that freeing; others will find their own requirements are not as
precise as they thought.

The third is that the evidence is thin. `nightshift` has been validated by
building one product. Its own
[delivery report](https://github.com/lightsout-labs/nightshift/blob/main/docs/delivery/v0.1.0.md)
says so: some of its behavior has only been checked by building `gridworks`,
and its protection of `main` is a local hook that "stops mistakes, not a
determined bypass". A second project in another language, and a team rather
than a single owner, would test the idea much harder than a spreadsheet
editor built by one person in a week.

## What changes if you take this seriously

If people only decide, then the skills that matter move. Writing a
requirement precise enough to build from, and recognizing a design that
will hurt in six months, become the core of the job. Reviewing a diff
becomes something you do when a check is missing, and the fix is to add the
check. The rest of this series follows that shift through the practices,
from agile and TDD to code review and design, and then through the people:
the product manager, the architect, the DevOps engineer, the programmer, and
the test engineer.

The question to take into the next article is not whether an agent can write
the code. In `gridworks` it did, 58 times in a week. The question is what has
to be true of the factory around it so that nobody needs to look.
