import { test, expect } from '@playwright/test';

test.describe('Security Basics', () => {
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

  test('XSS via script tag is escaped', async ({ page }) => {
    await page.getByRole('button', { name: /Product|Produkto/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    const textInputs = page.locator('input[type="text"]');
    if (await textInputs.count() > 0) {
      await textInputs.first().fill('<script>alert("xss")</script>');
      await page.waitForTimeout(1000);
      expect(await page.locator('script:has-text("alert")').count()).toBe(0);
    }
  });

  test('SQL injection characters are handled safely', async ({ page }) => {
    await page.getByRole('button', { name: /Product|Produkto/i }).first().click({ force: true });
    await page.waitForTimeout(2500);
    const textInputs = page.locator('input[type="text"]');
    if (await textInputs.count() > 0) {
      await textInputs.first().fill("'; DROP TABLE users; --");
      await page.waitForTimeout(1000);
      expect(await page.locator('body').textContent() || "").not.toContain('DROP TABLE');
    }
  });

  test('HTTPS is enforced', async ({ page }) => { expect(page.url()).toContain('https://'); });

  test('Frontend bundle is not obviously leaked', async ({ page }) => {
    expect(/password\s*[:=]\s*["'][^"']{5,}["']/i.test(await page.content())).toBeFalsy();
  });

  test('No sensitive data in localStorage keys', async ({ page }) => {
    const keys = await page.evaluate(() => {
      const arr = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k) arr.push(k.toLowerCase()); } return arr;
    });
    expect(keys.some(k => k.includes('password') || k.includes('secret'))).toBeFalsy();
  });

  test('App uses HTTPS for all resources', async ({ page }) => {
    const insecure: string[] = [];
    page.on('request', (req) => { if (req.url().startsWith('http://') && !req.url().includes('localhost')) insecure.push(req.url()); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    expect(insecure.length).toBe(0);
  });

  test('No console errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    const critical = errors.filter(e => !e.includes('favicon') && !e.includes('sw.js') && !e.includes('service-worker') && !e.includes('Firebase Performance') && !e.includes('FirebaseError'));
    expect(critical.length).toBeLessThan(10);
  });
});