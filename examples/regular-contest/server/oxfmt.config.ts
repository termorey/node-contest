import {defineConfig} from "oxfmt";

export default defineConfig({
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "arrowParens": "always",
  "bracketSameLine": false,
  "objectWrap": "preserve",
  "bracketSpacing": true,
  "semi": true,
  "experimentalOperatorPosition": "end",
  "singleQuote": false,
  "jsxSingleQuote": false,
  "quoteProps": "as-needed",
  "trailingComma": "all",
  "singleAttributePerLine": false,
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "proseWrap": "preserve",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "embeddedLanguageFormatting": "auto",
  "sortPackageJson": false,
  "ignorePatterns": []
})
