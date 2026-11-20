// @ts-check
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://lightsout-labs.github.io",
  trailingSlash: "always",
  build: { inlineStylesheets: "always" },
});
