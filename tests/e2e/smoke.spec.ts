import { test, expect } from "@playwright/test";

test("landing pública carrega", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Agentes de IA/i }),
  ).toBeVisible();
});

test("dashboard renderiza", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByText(/Bom dia/i)).toBeVisible();
});

test("tela de login existe", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
});

test("sidebar destaca exatamente a página ativa", async ({ page }) => {
  await page.goto("/agents");
  const active = page.locator(
    '[data-slot="sidebar-menu-button"][data-active="true"]',
  );
  await expect(active).toHaveCount(1);
});

test("página de fluxos lista os fluxos de teste", async ({ page }) => {
  await page.goto("/fluxos");
  await expect(page.getByText(/Fluxo 01/i)).toBeVisible();
});
