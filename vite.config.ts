import { defineConfig } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  lint: {
    plugins: ["import", "typescript", "react"],
    env: {
      browser: true,
      es2023: true,
    },
    rules: {
      eqeqeq: "error",
      "no-debugger": "error",
      "no-unused-vars": "error",
      "no-console": "off",
      "react/jsx-no-target-blank": "error",
    },
  },
  fmt: {
    semi: true,
    singleQuote: false,
    tabWidth: 2,
    useTabs: false,
    trailingComma: "all",
    printWidth: 100,
    arrowParens: "always",
    endOfLine: "lf",
    bracketSpacing: true,
    bracketSameLine: false,
    quoteProps: "as-needed",
    jsxSingleQuote: false,
  },
});
