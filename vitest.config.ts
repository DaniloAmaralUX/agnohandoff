import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Mede só o que os testes de unidade cobrem (data layer + design system),
      // não as páginas/UI (cobertas por e2e). Glob: todo hook novo em api/**
      // entra no gate de 85% automaticamente.
      include: ["src/lib/api/**/*.ts", "src/lib/constants.ts"],
      exclude: [
        "src/lib/api/**/*.test.*",
        "src/lib/api/schema.ts", // gerado do OpenAPI (types-only)
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        // Ramos: alguns fallbacks (?? "") são inalcançáveis dado o contrato Zod
        // (ex.: name é sempre presente); mantemos o piso global em 70 e a
        // camada api/** exige 80 (abaixo).
        branches: 70,
        "src/lib/api/**": {
          lines: 85,
          functions: 85,
          statements: 85,
          branches: 80,
        },
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
