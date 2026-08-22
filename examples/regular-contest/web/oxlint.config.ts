import {defineConfig} from "oxlint";

export default defineConfig({
  plugins: ["typescript", "react", "react-perf"],
  ignorePatterns: ["dist"],
  rules: {
    "react/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ]
  }
});
