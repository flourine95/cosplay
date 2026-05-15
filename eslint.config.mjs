import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "prefer-arrow-callback": "error",
      "prefer-template": "error",
      "prefer-destructuring": ["error", {
        "array": true,
        "object": true
      }],
      "prefer-spread": "error",
      "prefer-rest-params": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "camelcase": ["error", { 
        "properties": "never",
        "ignoreDestructuring": false
      }],
      "no-console": ["warn", { 
        "allow": ["warn", "error"] 
      }],
    }
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "components/ui/**",
    "app/generated/**",
    ".kiro/**",
    "node_modules/**",
  ]),
])

export default eslintConfig;
