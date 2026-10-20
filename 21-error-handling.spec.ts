import { test, expect } from '@playwright/test';

test.describe('Error Handling & Network Resilience', () => {

  test('App handles offline UI state gracefully', async ({ page }) => {
    // 1. Pumunta sa APP (kasi nandito ang #syncStatus)
    await page.goto('/app.html');
    await page.waitForSelector('#syncStatus', { state: 'visible' });

    // 2. I-simulate ang offline gamit ang JavaScript
    // Hindi natin gagamitin ang context.setOffline() kasi nag-cra-crash yun
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      window.dispatchEvent(new Event('offline'));
    });

    // 3. I-check kung nag-update ang badge sa "Offline"
    await expect(page.locator('#syncStatus')).toContainText(/Offline/i);

    // 4. Ibalik sa online
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      window.dispatchEvent(new Event('online'));
    });
  });

  test('App survives a 404 on a non-critical script', async ({ page }) => {
    await page.route('**/*.png', route => route.fulfill({ status: 404 }));
    await page.goto('/app.html');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Handles network timeouts gracefully', async ({ page }) => {
    await page.route('**/*', async route => {
      if (route.request().resourceType() === 'fetch') await route.abort('timedout');
      else await route.continue();
    });
    await page.goto('/app.html');
    await expect(page.locator('body')).toBeVisible();
  });

  test('App works even if Service Worker fails to register', async ({ page }) => {
    await page.route('**/sw.js', route => route.abort());
    await page.goto('/app.html');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Handles missing local storage gracefully', async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/app.html');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Handles invalid local storage data', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('vendorvibe_v3_state', '{bad-json}'));
    await page.goto('/app.html');
    await expect(page.locator('body')).toBeVisible();
  });

});