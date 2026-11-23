// Renders every figure into public/figures/; `make figures` runs it.
import { renderFigures } from "./index.ts";

await renderFigures(process.cwd());
