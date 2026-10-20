import { test, expect } from '@playwright/test';

test.describe('Customers & Expenses', () => {
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

  test('Expense button exists on Dashboard', async ({ page }) => {
    const expenseButton = page.getByRole('button', { name: /Expense|Gastos/i }).first();
    await expect(expenseButton).toBeVisible({ timeout: 10000 });
  });

  test('Expense form opens from Dashboard', async ({ page }) => {
    const expenseButton = page.getByRole('button', { name: /Expense|Gastos/i }).first();
    await expenseButton.click({ force: true });
    await page.waitForTimeout(2500);
    const hasForm = await page.locator('input, select, textarea').count();
    expect(hasForm).toBeGreaterThan(0);
  });

  test('Owner Draw button exists on Dashboard', async ({ page }) => {
    const drawButton = page.getByRole('button', { name: /Owner Draw|Kinuha/i }).first();
    await expect(drawButton).toBeVisible({ timeout: 10000 });
  });

  test('Owner Draw form opens from Dashboard', async ({ page }) => {
    const drawButton = page.getByRole('button', { name: /Owner Draw|Kinuha/i }).first();
    await drawButton.click({ force: true });
    await page.waitForTimeout(2500);
    const hasForm = await page.locator('input, select, textarea').count();
    expect(hasForm).toBeGreaterThan(0);
  });

  test('Order button exists on Dashboard', async ({ page }) => {
    const orderButton = page.getByRole('button', { name: /Order/i }).first();
    await expect(orderButton).toBeVisible({ timeout: 10000 });
  });

  test('Order form opens from Dashboard', async ({ page }) => {
    const orderButton = page.getByRole('button', { name: /Order/i }).first();
    await orderButton.click({ force: true });
    await page.waitForTimeout(2500);
    const hasForm = await page.locator('input, select, textarea').count();
    expect(hasForm).toBeGreaterThan(0);
  });
});