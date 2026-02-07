// @ts-check
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import reactPlugin from "eslint-plugin-react";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores(["**/dist", "**/node_modules", "**/build", "**/.react-router"]),
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

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
    rules: {
      "@typescript-eslint/consistent-type-imports": "off",
      //   "@typescript-eslint/no-floating-promises": "warn",
      //   "@typescript-eslint/no-unsafe-argument": "warn",
    },
  },
  {
    files: ["./frontend/**/*.{ts,tsx}"],
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat["jsx-runtime"],
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/prop-types": "off",
      "react-refresh/only-export-components": [
        "error",
        {
          allowConstantExport: true,
          allowExportNames: [
            // React Router exports
            "loader",
            "clientLoader",
            "action",
            "clientAction",
            "headers",
            "handle",
            "links",
            "meta",
            "shouldRevalidate",
            "clientMiddleware",
          ],
        },
      ],
    },
  },
  {
    name: "Shadcn UI Overrides",
    files: ["./frontend/src/components/ui/**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/consistent-type-imports": "off",
    },
  },
);
