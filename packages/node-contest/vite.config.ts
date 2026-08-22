/// <reference types="vitest/config" />
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "unplugin-dts/vite";

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
  resolve: { tsconfigPaths: true },
});
