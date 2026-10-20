import { test, expect } from '@playwright/test';

test.describe('Cloud Sync & Multi-Device', () => {
  test.use({ baseURL: 'https://vendorvibeos.web.app' });

  test('App mentions cloud sync feature', async ({ browser }) => {
    const context = await browser.newContext();
    await context.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const page = await context.newPage();
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { const m = document.getElementById('privOv'); if (m) m.remove(); });
    expect(/cloud|firebase|sync|sync.*data/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
    await context.close();
  });

  test('Cloud sync is optional (privacy-first)', async ({ browser }) => {
    const context = await browser.newContext();
    await context.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const page = await context.newPage();
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await page.evaluate(() => { const m = document.getElementById('privOv'); if (m) m.remove(); });
    expect(/privacy|optional|turn.*on|naka-off|disabled/i.test(await page.locator('body').textContent() || "")).toBeTruthy();
    await context.close();
  });

  test('Two contexts can load app independently', async ({ browser }) => {
    const context1 = await browser.newContext();
    await context1.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const context2 = await browser.newContext();
    await context2.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    await page1.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page2.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(2500);
    await page2.waitForTimeout(2500);
    expect((await page1.locator('body').textContent() || "").length).toBeGreaterThan(50);
    expect((await page2.locator('body').textContent() || "").length).toBeGreaterThan(50);
    await context1.close();
    await context2.close();
  });

  test('Data isolation between contexts', async ({ browser }) => {
    const context1 = await browser.newContext();
    await context1.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    const context2 = await browser.newContext();
    await context2.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
    
    const page1 = await context1.newPage();
    await page1.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page1.waitForTimeout(2000);
    await page1.evaluate(() => { localStorage.setItem('vv_context_test', 'context1_data'); });
    
    const page2 = await context2.newPage();
    await page2.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page2.waitForTimeout(2000);
    expect(await page2.evaluate(() => localStorage.getItem('vv_context_test'))).toBeNull();
    await context1.close();
    await context2.close();
  });
});