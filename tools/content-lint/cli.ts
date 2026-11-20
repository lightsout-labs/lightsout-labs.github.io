// Prints every content problem as `file:line: message` and exits 1 if any.
import { lint } from "./index.ts";

const problems = lint(process.cwd());
for (const { file, line, message } of problems) console.log(`${file}:${line}: ${message}`);
if (problems.length > 0) process.exit(1);
