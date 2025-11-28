// @ts-check
import { defineConfig } from "rolldown";
import nodeExternals from "rollup-plugin-node-externals";

export default defineConfig({
  platform: "node",
  input: ["src/main.ts"],
  output: {
    dir: "dist",
    cleanDir: true,
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "src",
    keepNames: true,
  },
  plugins: [nodeExternals()],
  tsconfig: "tsconfig.json",
  transform: {
    decorator: {
      emitDecoratorMetadata: true,
    },
  },
});
