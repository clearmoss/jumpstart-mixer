import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/tests/setup.ts"],
      css: true,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      },
      include: ["src/tests/**/*.{test,spec}.{js,ts,jsx,tsx}"],
      // exclude e2e Playwright tests
      exclude: ["src/tests/e2e/**/*"],
    },
  }),
);
