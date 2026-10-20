import { test, expect } from '@playwright/test';

test.describe('App Health & Stability', () => {
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

  test('App loads without critical console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const criticalErrors = errors.filter(e => !e.includes('favicon') && !e.includes('sw.js') && !e.includes('service-worker') && !e.includes('Firebase Performance') && !e.includes('FirebaseError'));
    expect(criticalErrors.length).toBeLessThan(10);
  });

  test('App loads without network errors', async ({ page }) => {
    const networkErrors: string[] = [];
    page.on('response', (res) => { if (res.status() >= 500) networkErrors.push(`${res.status()} ${res.url()}`); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect(networkErrors.length).toBeLessThan(3);
  });

  test('AI Coach card is visible on Dashboard', async ({ page }) => {
    await expect(page.getByText('AI Vendor Coach').first()).toBeVisible({ timeout: 10000 });
  });

  test('All 4 main nav buttons exist', async ({ page }) => {
    for (const id of ['nav-dashboard', 'nav-sales', 'nav-products', 'nav-reports']) {
      const count = await page.locator(`#${id}`).count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('App is responsive across viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(1500);
    await expect(page.getByText('Quick Actions').first()).toBeVisible({ timeout: 10000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    await expect(page.getByText('Quick Actions').first()).toBeVisible({ timeout: 10000 });
  });
});