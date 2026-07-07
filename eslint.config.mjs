import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Padrões legítimos de mount/media-query/guard (theme-toggle, use-mobile,
      // auth-guard): sinaliza como aviso, mas não bloqueia o build/CI.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Relatório de cobertura gerado (gitignored) — não deve ser lintado.
    "coverage/**",
  ]),
]);

export default eslintConfig;
