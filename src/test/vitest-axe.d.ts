/* Augmentação de tipos do matcher toHaveNoViolations (vitest-axe) para o
   Vitest 4, que expõe os matchers pela interface Assertion de @vitest/expect
   (a augmentação do namespace `Vi` do próprio vitest-axe é da era vitest 1/2). */
import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  interface Assertion<T = unknown> extends AxeMatchers {
    _t?: T;
  }
}
