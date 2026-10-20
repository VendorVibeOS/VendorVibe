import { test, expect } from '@playwright/test';

test.describe('API & Service Worker Integration', () => {
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

  test('Online status indicator visible', async ({ page }) => {
    const onlineIndicator = page.getByText(/Online/i).first();
    const isVisible = await onlineIndicator.isVisible({ timeout: 8000 }).catch(() => false);
    expect(isVisible).toBeTruthy();
  });

  test('Service Worker registered', async ({ page }) => {
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        return regs.length > 0;
      }
      return false;
    });
    expect(swRegistered).toBeTruthy();
  });

  test('IndexedDB is available', async ({ page }) => {
    const hasIndexedDB = await page.evaluate(() => typeof indexedDB !== 'undefined');
    expect(hasIndexedDB).toBeTruthy();
  });

  test('LocalStorage works', async ({ page }) => {
    const storageWorks = await page.evaluate(() => {
      try {
        localStorage.setItem('vv_test_key', 'test_value');
        const val = localStorage.getItem('vv_test_key');
        localStorage.removeItem('vv_test_key');
        return val === 'test_value';
      } catch { return false; }
    });
    expect(storageWorks).toBeTruthy();
  });

  test('coachBrain object exists', async ({ page }) => {
    const hasCoachBrain = await page.evaluate(() => typeof (window as any).coachBrain !== 'undefined');
    expect(hasCoachBrain).toBeTruthy();
  });
});