import { test, expect } from "@playwright/test";

/* Guardião mobile — cada rota do grupo (app) precisa caber em 390px de
   largura (iPhone 12/13/14). Falha se a página cria scroll horizontal.
   Roda em modo demo (mock), como o smoke. */

const APP_ROUTES = [
  "/dashboard",
  "/agents",
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
  // rota dinâmica: o mock resolve qualquer id para o seed
  "/agents/sofia",
];

test.use({ viewport: { width: 390, height: 844 } });

for (const route of APP_ROUTES) {
  test(`sem overflow horizontal em 390px: ${route}`, async ({ page }) => {
    await page.goto(route);
    // Espera o conteúdo assentar (skeletons do modo demo são síncronos).
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
      };
    });
    expect(
      overflow.scrollWidth,
      `scrollWidth ${overflow.scrollWidth}px > viewport ${overflow.clientWidth}px em ${route}`,
    ).toBeLessThanOrEqual(overflow.clientWidth);
  });
}

test("menu móvel fecha ao navegar e devolve o foco ao gatilho", async ({
  page,
}) => {
  await page.goto("/dashboard");
  const trigger = page.locator('[data-slot="sidebar-trigger"]');
  await trigger.click();
  const sheet = page.locator('[data-slot="sidebar"][data-mobile="true"]');
  await expect(sheet).toBeVisible();
  await page
    .locator('[data-slot="sidebar-menu-button"]', { hasText: "Agentes" })
    .first()
    .click();
  await expect(sheet).toBeHidden();
  await expect(page).toHaveURL(/\/agents/);
  await expect(trigger).toBeFocused();
});
