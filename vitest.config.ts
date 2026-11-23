/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Astro's Vite config lets unit tests render components with the container API.
export default getViteConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "tools/**/*.ts"],
      thresholds: { lines: 85, functions: 85, branches: 85, statements: 85 },
    },
  },
});
