/// <reference types="vitest" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [dtsPlugin()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/export.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rolldownOptions: {
      external: [/^node:/],
    },
  },
  test: {
    projects: ["src/**/*.{test}.{ts,tsx}"],
  },
});
