import { test, expect } from '@playwright/test';

test.describe('Data Entry & Validation', () => {
  test.use({ baseURL: 'https://vendorvibeos.web.app' });

  test.beforeEach(async ({ page, context }) => {
    await context.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => {
      const modal = document.getElementById('privOv');
      if (modal) modal.remove();
      document.body.style.overflow = 'auto';
    });
    await page.addStyleTag({ content: `#privOv { display: none !important; }` });
    await page.waitForTimeout(2000);
  });

  test('Sale button exists on Dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Sale|Benta/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Expense button exists on Dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Expense|Gastos/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Product button exists on Dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Product|Produkto/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Order button exists on Dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Order/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Owner Draw button exists on Dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Owner Draw|Kinuha/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Stock/Return button exists on Dashboard', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Stock|Bilangin/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Reports page displays numeric values', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    expect(/₱|\d+/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
  });

  test('Dashboard shows peso currency', async ({ page }) => {
    expect(/₱|PHP/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
  });

  test('Sale form opens and has inputs', async ({ page }) => {
    await page.getByRole('button', { name: /Sale|Benta/i }).first().click({ force: true });
    await page.waitForTimeout(3000);
    expect(await page.locator('input, select, textarea').count()).toBeGreaterThan(0);
  });
});