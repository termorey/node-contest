import { resolve } from "node:path";
import { defineConfig } from "vite";
import devServer from "@hono/vite-dev-server";

export default defineConfig({
  plugins: [
    devServer({
      entry: resolve(__dirname, "./src/main.ts"),
    }),
  ],
  server: { host: true, port: 4000 },
  resolve: { tsconfigPaths: true },
});
