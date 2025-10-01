import * as path from "node:path";
import { defineConfig } from "vite";
import dtsPlugin from "vite-plugin-dts";

export default defineConfig({
  plugins: [dtsPlugin({ rollupTypes: true })],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/export.ts"),
      name: "index",
      fileName: "index",
    },
    rollupOptions: {
      external: [/^node:/],
    },
  },
});
