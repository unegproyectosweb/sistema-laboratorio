// @ts-check
import { defineConfig } from "tsdown";

export default defineConfig({
  platform: "node",
  format: "esm",
  entry: [
    "src/main.ts",
    "src/config/typeorm.ts",
    "src/migrations/**/*.ts",
    "src/**/*.entity.ts",
  ],
  outDir: "dist",
  noExternal: [/@uneg-lab\/.*/],
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
