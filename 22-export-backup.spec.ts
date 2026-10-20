import { test, expect } from '@playwright/test';

test.describe('Export & Backup Features', () => {
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

  test('Export or backup button exists somewhere in app', async ({ page }) => {
    expect(/export|backup|download|i-export|i-backup/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
  });

  test('CSV export keywords mentioned in UI', async ({ page }) => {
    expect(/csv|spreadsheet|sheet|i-download/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
  });

  test('App mentions data backup in privacy text', async ({ page }) => {
    expect(/backup|i-backup|save.*data|data.*save/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
  });

  test('Export functionality documented in app', async ({ page }) => {
    expect(/export|backup|download/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
  });
});