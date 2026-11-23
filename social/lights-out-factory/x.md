58 pull requests merged between 13 and 20 November, and not one was reviewed by a person. A coding agent wrote the code and the tests, and each pull request merged itself when CI passed. The product is a spreadsheet editor, and it works. What that proves, and what it doesn't:

![GitHub's list of Gridworks pull requests filtered to merged ones: 58 closed, the latest merged on 20 November 2026](public/figures/gridworks-merged-pulls.png)

---

Vibe coding has shown that an agent can build something that looks finished. Industrial software is harder: it lives for years, its requirements keep moving, its maintainers change, and a wrong result costs someone money. That raises seven questions.

---

Can an agent go from requirements to release on its own? Must people review every line? How does the product stay within its requirements? How does the code stay clean under change? Who checks the tests? How does it stay coherent across sessions? What makes a rule hold?

---

To find out, we wrote nightshift, a Claude Code plugin, and built the spreadsheet with it. It runs five stages with three gates where we decide: approving the requirements, approving the design, and accepting the delivery. Between the gates, the agent builds one slice at a time.

![A flowchart of nightshift's five stages, spec, design, build, release and fix, with our three gates](public/figures/stages-and-gates.en.png)

---

Our part that week: answering the questions spec asked, approving the requirements and the design, approving five later changes, and filing five issues after using the app. We never opened the code.

---

Line-by-line review: answered, for this build. Every change passed formatting, lint, types, unit tests with a coverage floor, and end-to-end tests in three browsers, plus a review of each slice by a second agent. All five defects we reported came from using the app.

---

Who checks the tests: partly answered. The date functions' slice said they return Excel's serial numbers, and the tests checked exactly that. Typing =DATE(2026,11,18) showed 46344. Every check was right and the product was wrong. We found it by using the app.

---

Four of the seven questions are only partly answered, and all the evidence is one TypeScript product built in a week. What we learned is where people stand: when the agent writes the code and the tests, the requirements are the only thing both are checked against.

---

Part 1 of our series on the lights-out software factory covers all seven questions, what the experiment answered, and what it left open:
https://lightsout-labs.github.io/en/lights-out-factory/
