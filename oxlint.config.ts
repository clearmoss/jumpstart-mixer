import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    suspicious: "error",
    pedantic: "error",
    perf: "error",
  },
  rules: {
    "eslint/no-unused-vars": "error",
    "eslint/no-inline-comments": "allow",
    "eslint/max-lines-per-function": "allow",
    "eslint/max-lines": "allow",
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/stable-query-client": "error",
    "@tanstack/query/no-rest-destructuring": "warn",
    "@tanstack/query/no-unstable-deps": "error",
    "react/react-in-jsx-scope": "off",
    "tailwindcss/no-unknown-classes": [
      "error",
      {
        ignorePrefixes: ["group/", "peer/"],
      },
    ],
    "tailwindcss/no-conflicting-classes": "error",
  },
  plugins: ["react", "unicorn", "typescript", "oxc"],
  jsPlugins: [
    "@tanstack/eslint-plugin-query",
    "@tanstack/eslint-plugin-router",
    "oxlint-tailwindcss",
  ],
  settings: { tailwindcss: { entryPoint: "src/styles.css" } },
  env: {
    builtin: true,
  },
});
