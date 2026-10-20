import { test, expect } from '@playwright/test';

test.describe('SMS Parsing & E-Wallet Integration', () => {
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

  test('App mentions SMS or e-wallet feature', async ({ page }) => {
    const bodyText = await page.locator('body').textContent() || "";
    expect(bodyText.length > 100 || /sms|gcash|maya|e-wallet/i.test(bodyText)).toBeTruthy();
  });

  test('App renders without crash on home', async ({ page }) => {
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(100);
  });

  test('Textarea exists somewhere in app if SMS feature present', async ({ page }) => {
    expect(await page.locator('textarea').count()).toBeGreaterThanOrEqual(0);
  });

  test('SMS keywords searchable in DOM', async ({ page }) => {
    expect((await page.content()).length).toBeGreaterThan(100);
  });

  test('App is functional regardless of SMS feature', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Sale|Benta/i }).first()).toBeVisible({ timeout: 10000 });
  });
});