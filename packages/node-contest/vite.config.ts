/// <reference types="vitest" />
import * as path from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [dtsPlugin()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/export.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: [/^node:/],
    },
  },
  test: {
    projects: ["src/**/*.{test}.{ts,tsx}"],
  },
});
