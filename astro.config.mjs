// @ts-check
import { defineConfig } from "astro/config";
import remarkFigure from "./tools/remark-figure/index.ts";

export default defineConfig({
  site: "https://lightsout-labs.github.io",
  trailingSlash: "always",
  build: { inlineStylesheets: "always" },
  markdown: {
    remarkPlugins: [[remarkFigure, { manifest: "public/figures/figures.json" }]],
  },
});
