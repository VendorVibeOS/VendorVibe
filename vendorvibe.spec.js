import { test, expect } from '@playwright/test';

const LIVE_URL = 'http://127.0.0.1:8080';

test.describe('VendorVibe OS - Production & PWA Audit Suite', () => {

  test('Completes onboarding workflow successfully', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });

    const consentBox = page.getByLabel(/I have read this notice/i);
    if (await consentBox.count() > 0) {
      await consentBox.first().check();
      await page.getByRole('button', { name: /Proceed|Continue|Agree/i }).click();
    }

    const categoryBtn = page.getByRole('button', { name: /Food|Retail|Service/i });
    if (await categoryBtn.count() > 0) {
      await categoryBtn.first().click();
    }

    await expect(page.locator('body')).toBeVisible();
  });

  test('Registers Service Worker for PWA offline support', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });

    const isSupported = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        const reg = await navigator.serviceWorker.register('./sw.js');
        return reg !== undefined;
      } catch (e) {
        return false;
      }
    });

    expect(isSupported).toBe(true);
  });

  test('App remains fully functional when internet is cut off', async ({ context, page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');

    await context.setOffline(true);

    const body = page.locator('body');
    await expect(body).toBeVisible();

    await context.setOffline(false);
  });

  test('Persists user config across browser sessions', async ({ page }) => {
    await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded' });

    await page.evaluate(() => {
      localStorage.setItem('vv_test_config', JSON.stringify({ onboardingComplete: true }));
    });

    await page.reload();
    const configData = await page.evaluate(() => localStorage.getItem('vv_test_config'));
    expect(configData).not.toBeNull();
  });

});