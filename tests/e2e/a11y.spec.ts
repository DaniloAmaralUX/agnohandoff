import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Auditoria axe de página inteira (WCAG 2.1 A/AA) em todas as rotas, nos dois
   temas. Substitui contas de contraste feitas à mão: o veredito vem do DOM
   computado. Falha em violações 'critical' e 'serious'. */

const ROUTES = [
  "/",
  "/login",
  "/onboarding",
  "/fluxos",
  "/super-admin",
  "/dashboard",
  "/agents",
  "/agents/sofia",
  "/analytics",
  "/billing",
  "/channels",
  "/conversations",
  "/deploy",
  "/integrations",
  "/mcp",
  "/memory",
  "/playground",
  "/projects",
  "/settings",
  "/studio",
  "/tools",
  "/workspaces",
];

for (const route of ROUTES) {
  test(`axe sem violações críticas/sérias: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const blocking = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    );
    expect(
      blocking.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")),
      })),
      `Violações em ${route}`,
    ).toEqual([]);
  });
}
