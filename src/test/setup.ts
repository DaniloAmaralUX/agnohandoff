/* Setup global do Vitest — carregado antes de cada suíte (jsdom).
   Estende expect com os matchers do jest-dom (toBeInTheDocument, etc.)
   e registra o matcher toHaveNoViolations do vitest-axe. */
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as matchers from "vitest-axe/matchers";

// Tipos de toHaveNoViolations: ver src/test/vitest-axe.d.ts.
expect.extend(matchers);
