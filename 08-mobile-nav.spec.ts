import { test, expect } from '@playwright/test';

test.describe('Mobile-Specific Features', () => {
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

  test('Mobile viewport shows bottom navigation', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    const bottomNav = page.locator('.nav, nav, [role="navigation"]').last();
    await expect(bottomNav).toBeVisible({ timeout: 10000 });
  });

  test('Mobile bottom nav has all 4 buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    for (const id of ['nav-dashboard', 'nav-sales', 'nav-products', 'nav-reports']) {
      const count = await page.locator(`#${id}`).count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('Mobile navigation works via #nav-products', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { document.getElementById('nav-products')?.click(); });
    await page.waitForTimeout(3000);
    const heading = page.locator('h1, h2, h3').filter({ hasText: /Products|Produkto/i }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('Ask Coach feature accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(2000);
    const bodyText = await page.locator('body').textContent() || "";
    const hasAskCoach = /ask coach|magtanong|talk to coach/i.test(bodyText);
    expect(hasAskCoach).toBeTruthy();
  });
});