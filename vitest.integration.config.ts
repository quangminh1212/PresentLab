import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    // These suites launch Chromium and share local rendering resources.
    fileParallelism: false,
  },
});
