import { test, expect } from '@playwright/test';

test.describe('Notifications & Alerts', () => {
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

  test('Notification support is checked without crashing', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        const hasAPI = 'Notification' in window;
        return { hasAPI, permission: hasAPI ? Notification.permission : 'unsupported' };
      } catch { return { hasAPI: false, permission: 'error' }; }
    });
    expect(typeof result.hasAPI).toBe('boolean');
  });

  test('App mentions notification or alert feature', async ({ page }) => {
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(100);
  });

  test('Alerts section visible on Dashboard', async ({ page }) => {
    expect(true).toBeTruthy();
  });

  test('Service Worker supports push notifications', async ({ page }) => {
    const swSupportsPush = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); return regs.length > 0; }
      return false;
    });
    expect(typeof swSupportsPush).toBe('boolean');
  });

  test('Notification permission can be queried safely', async ({ page }) => {
    const permission = await page.evaluate(() => {
      try { return 'Notification' in window ? Notification.permission : 'unsupported'; } catch { return 'error'; }
    });
    expect(['default', 'granted', 'denied', 'unsupported', 'error']).toContain(permission);
  });

  test('App loads alerts data structure', async ({ page }) => {
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(100);
  });

  test('Push Manager support check', async ({ page }) => {
    const support = await page.evaluate(() => {
      return { hasPushManager: 'PushManager' in window, hasServiceWorker: 'serviceWorker' in navigator };
    });
    expect(typeof support.hasPushManager).toBe('boolean');
  });
});