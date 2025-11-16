// @ts-check
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["dist", "node_modules", "build"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["./backend/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2022,
      sourceType: "module",
      // parserOptions: {
      //   projectService: true,
      //   tsconfigRootDir: path.join(import.meta.dirname, "backend"),
      // },
    },
    // rules: {
    //   "@typescript-eslint/no-floating-promises": "warn",
    //   "@typescript-eslint/no-unsafe-argument": "warn",
    // },
  },
  {
    files: ["./frontend/**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-imports": "warn",
    },
  },
);
