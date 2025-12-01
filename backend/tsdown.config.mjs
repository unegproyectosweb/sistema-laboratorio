// @ts-check
import { globSync } from "node:fs";
import { defineConfig } from "tsdown";

const migrationFiles = globSync("src/migrations/**/*.ts");
const entityFiles = globSync("src/**/**/*.entity.ts");

export default defineConfig({
  platform: "node",
  format: "esm",
  entry: [
    "src/main.ts",
    "src/config/typeorm.ts",
    ...migrationFiles,
    ...entityFiles,
  ],
  outDir: "dist",
  clean: true,
  dts: false,
  tsconfig: "tsconfig.json",
  unbundle: true,
  sourcemap: true,
  minify: false,
  outputOptions: {
    keepNames: true,
    minify: false,
  },
});
