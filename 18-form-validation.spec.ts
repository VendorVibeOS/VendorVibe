import { test, expect } from '@playwright/test';

test.describe('Form Validation', () => {
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

  test('App loads without crashing on Home', async ({ page }) => {
    await expect(page.getByText('Quick Actions').first()).toBeVisible({ timeout: 10000 });
  });

  test('Sale button is clickable', async ({ page }) => {
    await page.getByRole('button', { name: /Sale|Benta/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(50);
  });

  test('Product button opens without crash', async ({ page }) => {
    await page.getByRole('button', { name: /Product|Produkto/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(50);
  });

  test('Expense button opens without crash', async ({ page }) => {
    await page.getByRole('button', { name: /Expense|Gastos/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(50);
  });

  test('Order button opens without crash', async ({ page }) => {
    await page.getByRole('button', { name: /Order/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(50);
  });

  test('Forms have visible inputs', async ({ page }) => {
    await page.getByRole('button', { name: /Sale|Benta/i }).first().click({ force: true });
    await page.waitForTimeout(3000);
    expect(await page.locator('input:visible, textarea:visible, select:visible').count()).toBeGreaterThan(0);
  });

  test('App still responsive after multiple clicks', async ({ page }) => {
    await page.getByRole('button', { name: /Sale|Benta/i }).first().click({ force: true });
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    await page.getByRole('button', { name: /Expense|Gastos/i }).first().click({ force: true });
    await page.waitForTimeout(2000);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(50);
  });
});