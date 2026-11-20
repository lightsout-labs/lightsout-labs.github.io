import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "coverage/",
      ".lighthouseci/",
      "test-results/",
      "playwright-report/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  { languageOptions: { globals: { ...globals.node, ...globals.browser } } },
);
