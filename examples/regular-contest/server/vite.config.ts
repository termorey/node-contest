import { resolve } from "node:path";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import devServer from "@hono/vite-dev-server";

export default defineConfig({
  plugins: [
    tsConfigPaths(),
    devServer({
      entry: resolve(__dirname, "./src/main.ts"),
    }),
  ],
  server: { host: true },
});
