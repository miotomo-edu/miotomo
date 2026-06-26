const tsParser = require("@typescript-eslint/parser");

const browserGlobals = {
  Audio: "readonly",
  Blob: "readonly",
  CSS: "readonly",
  DocumentFragment: "readonly",
  Element: "readonly",
  FileReader: "readonly",
  FormData: "readonly",
  HTMLAudioElement: "readonly",
  HTMLDivElement: "readonly",
  HTMLInputElement: "readonly",
  HTMLVideoElement: "readonly",
  MediaRecorder: "readonly",
  MediaStream: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  WebSocket: "readonly",
  console: "readonly",
  document: "readonly",
  fetch: "readonly",
  import: "readonly",
  localStorage: "readonly",
  navigator: "readonly",
  window: "readonly",
};

module.exports = [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".code-review-graph/**",
      ".codex/**",
      ".serena/**",
      "docs/**",
      "public/**",
    ],
  },
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    files: ["src/**/*.{js,jsx,ts,tsx}", "vite.config.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: browserGlobals,
    },
  },
];
