import { test, expect } from '@playwright/test';

test.describe('AI Coach (Coach VeVi)', () => {
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

  test('AI Coach card is visible on Dashboard', async ({ page }) => {
    await expect(page.getByText('AI Vendor Coach').first()).toBeVisible({ timeout: 10000 });
  });

  test('Coach card shows profile description', async ({ page }) => {
    const desc = page.getByText(/Your current numbers|The coach adapts|Offline coach/i).first();
    await expect(desc).toBeVisible({ timeout: 10000 });
  });

  test('Talk to Coach button exists', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Talk to Coach|Magtanong/i }).first()).toBeVisible({ timeout: 10000 });
  });

  test('Talk to Coach button opens chat', async ({ page }) => {
    const talkButton = page.getByRole('button', { name: /Talk to Coach|Magtanong/i }).first();
    await talkButton.click({ force: true });
    await page.waitForTimeout(3000);
    const chatInput = page.getByPlaceholder(/Ask anything|Magtanong/i).first();
    await expect(chatInput).toBeVisible({ timeout: 12000 });
  });

  test('Coach conversation shows "Coach VeVi" not "Sonia"', async ({ page }) => {
    const talkButton = page.getByRole('button', { name: /Talk to Coach|Magtanong/i }).first();
    await talkButton.click({ force: true });
    await page.waitForTimeout(3000);
    const bodyText = await page.locator('body').textContent() || "";
    expect(bodyText).toContain('Coach VeVi');
    expect(bodyText).not.toContain('Sonia');
  });
});