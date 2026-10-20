import { test, expect } from '@playwright/test';

test.describe('POS & Sales Flow', () => {
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

  test('POS/Sales page loads via #nav-sales', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-sales')?.click(); });
    await page.waitForTimeout(3000);
    const heading = page.locator('h1, h2, h3').filter({ hasText: /Sales|Benta|Total Sales/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('Record Sale button exists on Sales page', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-sales')?.click(); });
    await page.waitForTimeout(3000);
    await expect(page.getByRole('button', { name: /Record Sale/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Sale form opens from Dashboard', async ({ page }) => {
    const saleButton = page.getByRole('button', { name: /Sale|Benta/i }).first();
    await expect(saleButton).toBeVisible({ timeout: 10000 });
    await saleButton.click({ force: true });
    await page.waitForTimeout(2500);
    const hasForm = await page.locator('input, select, textarea').count();
    expect(hasForm).toBeGreaterThan(0);
  });
});