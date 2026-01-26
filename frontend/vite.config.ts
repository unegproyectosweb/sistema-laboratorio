import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    devtoolsJson({ uuid: "4bd1a9d1-3698-4311-b4f9-1e85d7abaf1d" }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        babelrc: false,
        configFile: false,
        compact: false,
        presets: ["@babel/preset-typescript"],
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    proxy: {
      "/api": process.env.DEV_API_URL || "http://localhost:3000",
    },
  },
});
