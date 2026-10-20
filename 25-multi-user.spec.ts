import { test, expect } from '@playwright/test';

test.describe('Multi-User Privacy & Data Separation', () => {
  test.use({ baseURL: 'https://vendorvibeos.web.app' });

  test('Two users have separate localStorage', async ({ browser }) => {
    const user1 = await browser.newContext();
    await user1.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const user2 = await browser.newContext();
    await user2.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    
    const page1 = await user1.newPage();
    const page2 = await user2.newPage();
    await page1.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page2.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);
    
    await page1.evaluate(() => { localStorage.setItem('user1_data', 'secret_user1'); });
    expect(await page2.evaluate(() => localStorage.getItem('user1_data'))).toBeNull();
    await user1.close();
    await user2.close();
  });

  test('Two users have separate IndexedDB', async ({ browser }) => {
    const user1 = await browser.newContext();
    await user1.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const user2 = await browser.newContext();
    await user2.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    
    const page1 = await user1.newPage();
    const page2 = await user2.newPage();
    await page1.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page2.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(2000);
    await page2.waitForTimeout(2000);
    
    await page1.evaluate(async () => {
      return new Promise<void>((resolve) => {
        const req = indexedDB.open('user_test_db', 1);
        req.onupgradeneeded = () => { req.result.createObjectStore('user_store'); };
        req.onsuccess = () => { const tx = req.result.transaction('user_store', 'readwrite'); tx.objectStore('user_store').put('user1_secret', 'user1_key'); tx.oncomplete = () => resolve(); };
      });
    });
    
    const user2Data = await page2.evaluate(async () => {
      return new Promise<string | null>((resolve) => {
        const req = indexedDB.open('user_test_db', 1);
        req.onupgradeneeded = () => { req.result.createObjectStore('user_store'); };
        req.onsuccess = () => { const getReq = req.result.transaction('user_store', 'readonly').objectStore('user_store').get('user1_key'); getReq.onsuccess = () => resolve(getReq.result || null); };
      });
    });
    expect(user2Data).toBeNull();
    await user1.close();
    await user2.close();
  });

  test('App loads fresh in new context', async ({ browser }) => {
    const context = await browser.newContext();
    await context.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const page = await context.newPage();
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect((await page.locator('body').textContent() || "").length).toBeGreaterThan(50);
    await context.close();
  });

  test('Session data isolated per context', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    await ctx1.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const ctx2 = await browser.newContext();
    await ctx2.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    
    const p1 = await ctx1.newPage();
    const p2 = await ctx2.newPage();
    await p1.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await p2.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await p1.waitForTimeout(2000);
    await p2.waitForTimeout(2000);
    
    await p1.evaluate(() => sessionStorage.setItem('ctx_test', 'ctx1'));
    expect(await p2.evaluate(() => sessionStorage.getItem('ctx_test'))).toBeNull();
    await ctx1.close();
    await ctx2.close();
  });
});