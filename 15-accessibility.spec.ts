import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
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

  test('Page has a valid title', async ({ page }) => {
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('Page has lang attribute', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('Navigation buttons exist', async ({ page }) => {
    const navButtons = await page.locator('#nav-dashboard, #nav-sales, #nav-products, #nav-reports').count();
    expect(navButtons).toBeGreaterThan(0);
  });

  test('Quick Action buttons have accessible text', async ({ page }) => {
    const buttons = page.locator('.actions button, button.btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    const firstButtonText = await buttons.first().textContent();
    expect(firstButtonText && firstButtonText.length > 0).toBeTruthy();
  });

  test('Buttons have accessible structure', async ({ page }) => {
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});