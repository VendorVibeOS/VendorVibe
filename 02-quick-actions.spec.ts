import { test, expect } from '@playwright/test';

test.describe('Quick Actions - All Buttons', () => {
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

  const actions = [
    { texts: ['Sale', 'Benta'], label: 'Sale' },
    { texts: ['Expense', 'Gastos'], label: 'Expense' },
    { texts: ['Product', 'Produkto'], label: 'Product' },
    { texts: ['Order'], label: 'Order' },
    { texts: ['Owner Draw', 'Kinuha'], label: 'Owner Draw' },
    { texts: ['Stock', 'Bilangin'], label: 'Stock/Return' },
  ];

  for (const action of actions) {
    test(`${action.label} button opens form`, async ({ page }) => {
      let clicked = false;
      for (const text of action.texts) {
        const button = page.getByRole('button', { name: new RegExp(text, 'i') }).first();
        if (await button.isVisible({ timeout: 2000 }).catch(() => false)) {
          await button.click({ force: true });
          clicked = true;
          break;
        }
      }
      expect(clicked).toBeTruthy();
      await page.waitForTimeout(2500);
      const hasForm = await page.locator('input, select, textarea').count();
      expect(hasForm).toBeGreaterThan(0);
    });
  }
});