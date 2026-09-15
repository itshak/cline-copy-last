import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**"],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      indent: ["error", 2],
      semi: ["error", "always"],
      curly: ["error", "all"],
      "brace-style": ["error", "1tbs", { allowSingleLine: false }],
      "max-statements-per-line": ["error", { max: 1 }],
    },
  },
);
