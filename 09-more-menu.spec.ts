import { test, expect } from '@playwright/test';

test.describe('Dashboard Features', () => {
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

  test('Daily Business Dilemma section exists', async ({ page }) => {
    const hasSection = await page.getByText(/Daily Business Dilemma|Business Dilemma/i).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasSection).toBeTruthy();
  });

  test('Entrepreneur Character Sheet exists', async ({ page }) => {
    await expect(page.getByText(/ENTREPRENEUR CHARACTER SHEET/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Expansion Loan Reward section exists', async ({ page }) => {
    const hasSection = await page.getByText(/Expansion Loan Reward/i).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasSection).toBeTruthy();
  });

  test('Daily Cashflow Encoder section exists', async ({ page }) => {
    const hasSection = await page.getByText(/Daily Cashflow Encoder/i).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasSection).toBeTruthy();
  });

  test('Business Habits Score exists', async ({ page }) => {
    const hasScore = await page.getByText(/Business Habits Score|Habits Score/i).first().isVisible({ timeout: 10000 }).catch(() => false);
    expect(hasScore).toBeTruthy();
  });
});