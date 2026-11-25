Nobody read our 58 pull requests. A coding agent wrote the code and the tests for Gridworks, a spreadsheet app, and every pull request merged itself when CI passed. The app is live. Our claim: once the requirements and the checks are written, who writes the code stops mattering.

![GitHub's list of Gridworks pull requests filtered to merged ones: 58 closed, the latest merged on 20 November 2026](public/figures/gridworks-merged-pulls.png)

---

Our part that week: answering the agent's questions about the requirements, typing approve on the requirements and the design, approving five later changes, and filing five issues. We never opened the code.

---

What it built in under seven days: 25,651 lines of production code, 184 Excel functions, over 470 unit tests and over 130 end-to-end tests in three browsers, and its own reader and writer for .xlsx files after measuring ExcelJS as too slow.

---

What replaced code review: requirements as the only source of truth, tests written before the code, a review by a second agent that never sees the coding session, hooks the model can't override, and CI. People decide at three gates.

![A flowchart of nightshift's five stages, spec, design, build, release and fix, with our three gates](public/figures/stages-and-gates.en.png)

---

The reviewer blocked 21 of 40 slices before they shipped. One catch: cell hyperlinks would have stored and followed javascript: links. The fix allows only http, https and mailto.

---

A bug: =DATE(2026,11,18) showed 46344. The slice's criterion said "using Excel's serial numbers", and the tests checked exactly that. We filed an issue; the agent turned it into a slice, tested, fixed and merged it. Nobody read code. The flaw was in the spec, and so was the fix.

---

Run the same requirements twice and you get different code. With complete verification, every result meets the requirements. The limits: this is one product built in under a week and not yet maintained over time, and the date bug shows our checks were not complete.

---

Doubt it? Build Gridworks yourself from its approved requirements, with nightshift or your own process, and compare. Part 1 of our series on the lights-out software factory:
https://lightsout-labs.github.io/en/lights-out-factory/
