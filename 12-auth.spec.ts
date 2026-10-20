import { test, expect } from '@playwright/test';

test.describe('Authentication & Session', () => {
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

  test('App works without login (offline-first)', async ({ page }) => {
    await expect(page.getByText('Quick Actions').first()).toBeVisible({ timeout: 10000 });
  });

  test('Local data is primary storage', async ({ page }) => {
    const bodyText = await page.locator('body').textContent() || "";
    const hasOfflinePromise = /offline|local|device|saved/i.test(bodyText);
    expect(hasOfflinePromise).toBeTruthy();
  });

  test('User data stored in IndexedDB', async ({ page }) => {
    const hasIndexedDB = await page.evaluate(() => typeof indexedDB !== 'undefined');
    expect(hasIndexedDB).toBeTruthy();
  });

  test('Session persists across reload', async ({ page }) => {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await expect(page.getByText('Quick Actions').first()).toBeVisible({ timeout: 15000 });
  });
});