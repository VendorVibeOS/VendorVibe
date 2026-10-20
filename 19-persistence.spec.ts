import { test, expect } from '@playwright/test';

test.describe('Data Persistence Across Reloads', () => {
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

  test('IndexedDB persists across reload', async ({ page }) => {
    await page.evaluate(async () => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.open('test_persistence_db', 1);
        req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains('test_store')) req.result.createObjectStore('test_store'); };
        req.onsuccess = () => {
          const tx = req.result.transaction('test_store', 'readwrite');
          tx.objectStore('test_store').put('test_value', 'test_key');
          tx.oncomplete = () => resolve();
        };
      });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const value = await page.evaluate(async () => {
      return new Promise<string | null>((resolve) => {
        const req = indexedDB.open('test_persistence_db', 1);
        req.onsuccess = () => {
          const getReq = req.result.transaction('test_store', 'readonly').objectStore('test_store').get('test_key');
          getReq.onsuccess = () => resolve(getReq.result);
        };
      });
    });
    expect(value).toBe('test_value');
  });

  test('LocalStorage persists across reload', async ({ page }) => {
    await page.evaluate(() => localStorage.setItem('vv_persist_test', 'hello_world'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => localStorage.getItem('vv_persist_test'))).toBe('hello_world');
    await page.evaluate(() => localStorage.removeItem('vv_persist_test'));
  });

  test('SessionStorage behaves as expected', async ({ page }) => {
    await page.evaluate(() => sessionStorage.setItem('vv_session_test', 'session_value'));
    expect(await page.evaluate(() => sessionStorage.getItem('vv_session_test'))).toBe('session_value');
  });

  test('App state survives browser refresh', async ({ page }) => {
    await page.evaluate(() => { const m = document.getElementById('privOv'); if (m) m.remove(); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(100);
  });

  test('Multiple reloads do not break app', async ({ page }) => {
    for (let i = 0; i < 3; i++) { await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(2000); }
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(100);
  });
});