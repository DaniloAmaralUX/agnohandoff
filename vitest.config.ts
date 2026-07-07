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
      // não as páginas/UI (cobertas por e2e).
      include: [
        "src/lib/api/agents.ts",
        "src/lib/api/projects.ts",
        "src/lib/api/client.ts",
        "src/lib/api/schemas.ts",
        "src/lib/api/query-keys.ts",
        "src/lib/api/errors.ts",
        "src/lib/constants.ts",
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
