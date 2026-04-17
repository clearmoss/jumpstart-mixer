import eslintReact from "@eslint-react/eslint-plugin";
import eslintJs from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import pluginRouter from "@tanstack/eslint-plugin-router";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default defineConfig({
  files: ["**/*.ts", "**/*.tsx"],

  extends: [
    eslintJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintReact.configs["recommended-typescript"],
    // TanStack Router & Query recommended configs
    ...pluginRouter.configs["flat/recommended"],
    ...pluginQuery.configs["flat/recommended"],
    // Prettier should be last to override conflicting formatting rules
    eslintConfigPrettier,
  ],

  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
