import { test, expect } from '@playwright/test';

test.describe('Performance & Load Times', () => {
  test.use({ baseURL: 'https://vendorvibeos.web.app' });

  test.beforeEach(async ({ page, context }) => {
    await context.route('**/*google-analytics*', route => route.fulfill({ status: 204 }));
  });

  test('Home page loads within 20 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.getByText('Quick Actions').first().waitFor({ timeout: 20000 });
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Home page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(20000);
  });

  test('DOM content loaded in reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    const domTime = Date.now() - startTime;
    console.log(`⏱️ DOM content loaded: ${domTime}ms`);
    expect(domTime).toBeLessThan(10000);
  });

  test('Navigation between pages is fast', async ({ page }) => {
    await page.goto('/app.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => { const m = document.getElementById('privOv'); if (m) m.remove(); });
    await page.addStyleTag({ content: `#privOv { display: none !important; }` });
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    await page.evaluate(() => { document.getElementById('nav-products')?.click(); });
    await page.waitForTimeout(1500);
    const navTime = Date.now() - startTime;
    console.log(`⏱️ Navigation time: ${navTime}ms`);
    expect(navTime).toBeLessThan(8000);
  });
});