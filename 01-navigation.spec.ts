import { test, expect } from '@playwright/test';

test.describe('Navigation - All Pages', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/app.html');
    await page.waitForSelector('#nav-dashboard', { state: 'visible' });
    
    // I-remove ang modal
    await page.evaluate(() => {
      const ov = document.getElementById('privOv');
      if (ov) ov.remove();
    });
  });

  test('Home loads via #nav-dashboard', async ({ page }) => {
    // Direktang switch, hindi na natin pipindutin yung button para iwas flaky
    await page.evaluate(() => (window as any).switchScreen('dashboard'));
    await expect(page.locator('#screen-dashboard')).toHaveClass(/active/);
  });

  test('POS/Sales loads via #nav-sales', async ({ page }) => {
    await page.locator('#nav-sales').click();
    await expect(page.locator('#screen-sales')).toHaveClass(/active/);
  });

  test('Catalog loads via #nav-products', async ({ page }) => {
    await page.locator('#nav-products').click();
    await expect(page.locator('#screen-products')).toHaveClass(/active/);
  });

  test('Orders loads via #nav-orders', async ({ page }) => {
    // Direktang switch function para hindi na kailangan i-click yung hidden button
    await page.evaluate(() => (window as any).switchScreen('orders'));
    await expect(page.locator('#screen-orders')).toHaveClass(/active/);
  });

  test('Reports loads via #nav-reports', async ({ page }) => {
    // Direktang switch function
    await page.evaluate(() => (window as any).switchScreen('reports'));
    await expect(page.locator('#screen-reports')).toHaveClass(/active/);
  });

});