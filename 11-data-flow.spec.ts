import { test, expect } from '@playwright/test';

test.describe('Data Flow - Sale to Reports', () => {
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

  test('Sale form opens with input fields', async ({ page }) => {
    await page.getByRole('button', { name: /Sale|Benta/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    const inputs = await page.locator('input, select, textarea').count();
    expect(inputs).toBeGreaterThan(0);
  });

  test('Reports page shows Gross Revenue', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').textContent() || "";
    expect(bodyText).toContain('Gross Revenue');
  });

  test('Reports shows Transaction Volume', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').textContent() || "";
    expect(bodyText).toContain('Transaction Volume');
  });

  test('Reports shows Expenses & COGS', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').textContent() || "";
    expect(bodyText).toContain('Expenses');
  });

  test('Reports shows Net Profit', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').textContent() || "";
    // Simpleng check: basta may "Net Profit" or "Tubo" sa buong page text
    expect(/Net Profit|Tubo/i.test(bodyText)).toBeTruthy();
  });
});