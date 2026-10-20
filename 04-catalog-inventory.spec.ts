import { test, expect } from '@playwright/test';

test.describe('Catalog & Inventory', () => {
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

  test('Catalog page loads via #nav-products', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-products')?.click(); });
    await page.waitForTimeout(3000);
    const heading = page.locator('h1, h2, h3').filter({ hasText: /Products|Produkto/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('Add Product button exists on Catalog', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-products')?.click(); });
    await page.waitForTimeout(3000);
    const addButton = page.getByRole('button', { name: /Add|Idagdag|Magdagdag/i }).first();
    await expect(addButton).toBeVisible({ timeout: 10000 });
  });

  test('Product form opens from Dashboard', async ({ page }) => {
    const productButton = page.getByRole('button', { name: /Product|Produkto/i }).first();
    await expect(productButton).toBeVisible({ timeout: 10000 });
    await productButton.click({ force: true });
    await page.waitForTimeout(2500);
    const hasForm = await page.locator('input, select, textarea').count();
    expect(hasForm).toBeGreaterThan(0);
  });

  test('Stock / Return button exists on Dashboard', async ({ page }) => {
    const stockButton = page.getByRole('button', { name: /Stock|Bilangin/i }).first();
    await expect(stockButton).toBeVisible({ timeout: 10000 });
  });
});