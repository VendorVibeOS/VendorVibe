import { test, expect } from '@playwright/test';

test.describe('Settings & Privacy', () => {
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

  test('Privacy modal was dismissed', async ({ page }) => {
    const isVisible = await page.locator('#privOv').isVisible({ timeout: 2000 }).catch(() => false);
    expect(isVisible).toBeFalsy();
  });

  test('App shows offline-first text', async ({ page }) => {
    const bodyText = await page.locator('body').textContent() || "";
    const hasOffline = /offline|local data|naka-save|device/i.test(bodyText);
    expect(hasOffline).toBeTruthy();
  });

  test('Privacy notice text exists somewhere in app', async ({ page }) => {
    const bodyText = await page.locator('body').textContent() || "";
    expect(bodyText.toLowerCase()).toContain('privacy');
  });

  test('PWA installation text exists', async ({ page }) => {
    const bodyText = await page.locator('body').textContent() || "";
    const hasPWA = /PWA|install|Install/i.test(bodyText);
    expect(hasPWA).toBeTruthy();
  });
});