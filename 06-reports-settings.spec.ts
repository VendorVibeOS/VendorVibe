import { test, expect } from '@playwright/test';

test.describe('Reports & Settings', () => {
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

  test('Reports page loads via #nav-reports', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    await expect(page.getByText(/Gross Revenue|Kabuuang Kita/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Reports page shows Transaction Volume', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    await expect(page.getByText('Transaction Volume').first()).toBeVisible({ timeout: 15000 });
  });

  test('Home page shows Alerts section', async ({ page }) => {
    await expect(page.getByText('Alerts').first()).toBeVisible({ timeout: 10000 });
  });

  test('Home page shows Quick Actions section', async ({ page }) => {
    await expect(page.getByText('Quick Actions').first()).toBeVisible({ timeout: 10000 });
  });

  test('Reports page shows Revenue and Expenses', async ({ page }) => {
    await page.evaluate(() => { document.getElementById('nav-reports')?.click(); });
    await page.waitForTimeout(3000);
    await expect(page.getByText(/Gross Revenue|Kabuuang Kita/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Expenses & COGS').first()).toBeVisible({ timeout: 10000 });
  });
});