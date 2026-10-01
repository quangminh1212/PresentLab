import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".superpowers/**",
      "dist/**",
      "public/**",
      "node_modules/**",
      ".artifacts/**",
      "coverage/**",
      "web/vendor/three/**",
      "web/lusion/_astro/**",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        Buffer: "readonly",
        URL: "readonly",
        clearInterval: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        process: "readonly",
        setInterval: "readonly",
        setTimeout: "readonly",
      },
    },
  },
  {
    files: ["web/portal/app.js", "web/portal/world.js", "web/lusion/scripts/**/*.js"],
    languageOptions: {
      globals: {
        AbortController: "readonly",
        Blob: "readonly",
        FormData: "readonly",
        URL: "readonly",
        clearTimeout: "readonly",
        console: "readonly",
        document: "readonly",
        DOMMatrixReadOnly: "readonly",
        Element: "readonly",
        Event: "readonly",
        fetch: "readonly",
        getComputedStyle: "readonly",
        HTMLCanvasElement: "readonly",
        HTMLImageElement: "readonly",
        ImageBitmap: "readonly",
        ImageData: "readonly",
        localStorage: "readonly",
        MutationObserver: "readonly",
        navigator: "readonly",
        Node: "readonly",
        NodeFilter: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        ResizeObserver: "readonly",
        setTimeout: "readonly",
        window: "readonly",
        CustomEvent: "readonly",
        location: "readonly",
      },
    },
  },
);
