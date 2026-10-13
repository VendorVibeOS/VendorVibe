import { test, expect } from '@playwright/test';

const URL = 'http://127.0.0.1:8080';
const KEY = 'vendorvibe_v3_state';

const BASE_SEED = {
  consent: { v: 2, cloud: false, ai: false, push: false, at: '2026-10-01T00:00:00.000Z' },
  settings: { setup: true, tourDone: true, bizType: 'Food', owner: 'Aling Nena', businessName: 'Nena Store', lang: 'en' },
};

const SALE_SEED = {
  ...BASE_SEED,
  products: [{ id: 'p_t1', name: 'Turon', cost: 5, price: 15, stock: 20, low: 5, category: 'Food', track: true }],
  sales: [{ id: 's_t1', date: '2026-10-09', productId: 'p_t1', productName: 'Turon', qty: 2, unitPrice: 15, total: 30, cogs: 10, payment: 'Cash', receipt: '', promo: false }],
};

async function seed(page, state) {
  await page.addInitScript(([k, s]) => {
    try {
      if (!localStorage.getItem('__vv_seeded')) {
        localStorage.setItem('__vv_seeded', '1');
        localStorage.setItem(k, JSON.stringify(s));
      }
    } catch (e) {}
  }, [KEY, state]);
}

function watchErrors(page) {
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (/Failed to load resource/i.test(t)) return; // network 404 noise, not app logic
    errs.push('console: ' + t);
  });
  return errs;
}

test.describe('VendorVibe v11.11 upgrade block', () => {

  test('boots clean: upgrade UI initializes with zero errors', async ({ page }) => {
    const errs = watchErrors(page);
    await seed(page, BASE_SEED);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.rpg-stat').first()).toBeVisible();
    expect(await page.locator('.rpg-stat').count()).toBe(5);
    expect(await page.locator('.rpg-stat svg.spk').count()).toBe(5);
    await expect(page.locator('#rpgDelta')).toContainText('This week');
    await expect(page.locator('#storageBadge')).toContainText('Saved locally');
    expect(await page.locator('#tplBox').innerHTML()).not.toBe('');
    expect(await page.locator('#rpgRewards .rw-chip').count()).toBeGreaterThanOrEqual(5);
    expect(errs).toEqual([]);
  });

  test('Floor/Vibe toggle applies and persists across reload', async ({ page }) => {
    await seed(page, BASE_SEED);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();

    await page.click('#segFloor');
    await expect(page.locator('body')).toHaveClass(/floor/);
    await expect(page.locator('#floorBar')).toBeVisible();
    expect(await page.getAttribute('#segFloor', 'aria-pressed')).toBe('true');

    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('#segFloor')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('body')).toHaveClass(/floor/);
    await expect(page.locator('#floorBar')).toBeVisible();
    await expect(page.locator('#rpgCard')).toBeHidden();

    await page.click('#segVibe');
    await expect(page.locator('body')).not.toHaveClass(/floor/);
    await expect(page.locator('.rpg-stat').first()).toBeVisible();
  });

  test('tapping an attribute opens the stat pop-up with a fix action', async ({ page }) => {
    await seed(page, BASE_SEED);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();

    await page.locator('.rpg-stat').first().click();
    await expect(page.locator('#statModal')).toHaveClass(/show/);
    await expect(page.locator('#statBody .statbig b')).toContainText('%');
    await expect(page.locator('#statBody')).toContainText('How this is measured');
    await expect(page.locator('#statBody')).toContainText('practical fix');
    await expect(page.locator('#statGo')).toBeVisible();
    expect((await page.locator('#statGo').innerText()).trim().length).toBeGreaterThan(3);
  });

  test('sales feed: void moved into options sheet, list stays clean', async ({ page }) => {
    await seed(page, SALE_SEED);
    page.on('dialog', (d) => d.accept());
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();

    await page.evaluate(() => switchScreen('sales'));
    const row = page.locator('#salesList .item[data-sid="s_t1"]');
    await expect(row).toBeVisible();
    expect(await page.locator('#salesList button:has-text("Void")').count()).toBe(0);

    await row.locator('button[aria-label="Sale options"]').click();
    await expect(page.locator('#saleSheet')).toHaveClass(/show/);
    await expect(page.locator('#saleSheetBody')).toContainText('Turon');
    await expect(page.locator('#saleVoidBtn')).toBeVisible();

    await page.click('#saleVoidBtn');
    await expect(page.locator('#saleSheet')).not.toHaveClass(/show/);
    await expect(page.locator('#salesList .item[data-sid="s_t1"]')).toHaveCount(0);
  });

  test('CSV import from phone merges locally (no server)', async ({ page }) => {
    await seed(page, BASE_SEED);
    page.on('dialog', (d) => d.accept());
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();

    const csv = 'Date,Product,Qty,Price,Total,Payment\n2026-10-01,Turon,2,15,30,Cash\n2026-10-02,Pandesal,10,4,40,GCash\n';
    await page.setInputFiles('#importFile', { name: 'past.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });

    await expect
      .poll(async () => page.evaluate(() => (typeof state !== 'undefined' ? state.sales.length : -1)))
      .toBe(2);
    expect(await page.evaluate(() => state.sales.every((s) => s.productName && s.total > 0))).toBe(true);
    expect(await page.evaluate(() => state.products.length)).toBe(2);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();
    expect(await page.evaluate(() => state.sales.length)).toBe(2);
  });

  test('analytics: period filter bar drives the core metric cards', async ({ page }) => {
    const errs = watchErrors(page);
    const d = (n) => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
    const mk = (id, date, total, cogs, qty) => ({ id, date, productId: 'p_t1', productName: 'Turon', qty, unitPrice: total / qty, total, cogs, payment: 'Cash', receipt: 'r_' + id });
    await seed(page, {
      ...BASE_SEED,
      products: SALE_SEED.products,
      expenses: [{ id: 'e1', date: d(0), name: 'Ice', amount: 20, category: 'Supplies', notes: '' }],
      sales: [mk('s_now', d(0), 100, 40, 5), mk('s_20', d(20), 60, 24, 3), mk('s_400', d(400), 30, 12, 2)],
    });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();
    await page.evaluate(() => switchScreen('reports'));

    expect(await page.locator('#reportRange option').count()).toBe(10);
    const labels = (await page.locator('#reportRange option').allInnerTexts()).join('|');
    for (const want of ['Daily', 'Weekly', '15 Days', '1 Month', '3 Months', '6 Months', '1 Year', '5 Years', '10 Years']) {
      expect(labels).toContain(want);
    }

    await page.selectOption('#reportRange', 'all');
    await expect(page.locator('#rGrossRev')).toContainText('190');
    await expect(page.locator('#rTotExp')).toContainText('96');
    await expect(page.locator('#rTxns')).toHaveText('3');
    await expect(page.locator('#rMargin')).toContainText('% net margin');
    await expect(page.locator('#rKept')).not.toHaveText('₱0');

    await page.selectOption('#reportRange', 'week');
    await expect(page.locator('#rTxns')).toHaveText('1');
    await page.selectOption('#reportRange', 'm3');
    await expect(page.locator('#rTxns')).toHaveText('2');
    await page.selectOption('#reportRange', 'y1');
    await expect(page.locator('#rTxns')).toHaveText('2');
    await page.selectOption('#reportRange', 'y10');
    await expect(page.locator('#rTxns')).toHaveText('3');
    expect(errs).toEqual([]);
  });

  test('POS: catalog search, cash tendered change, digital receipt', async ({ page }) => {
    const errs = watchErrors(page);
    await seed(page, {
      ...BASE_SEED,
      products: [
        { id: 'p_t1', name: 'Turon', cost: 5, price: 15, stock: 20, low: 5, category: 'Food', track: true },
        { id: 'p_p1', name: 'Pandesal', cost: 2, price: 4, stock: 50, low: 10, category: 'Food', track: true },
      ],
    });
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();

    await page.evaluate(() => openSale());
    await expect(page.locator('#saleModal')).toHaveClass(/show/);
    expect(await page.locator('#saleProduct option').count()).toBe(2);

    await page.fill('#saleSearch', 'pande');
    expect(await page.locator('#saleProduct option').count()).toBe(1);
    await expect(page.locator('#saleProduct option').first()).toContainText('Pandesal');
    await page.fill('#saleSearch', 'zzz');
    await expect(page.locator('#saleSearchHint')).toBeVisible();

    await page.fill('#saleSearch', '');
    await page.selectOption('#saleProduct', 'p_t1');
    await page.fill('#saleQty', '4');
    await expect(page.locator('#saleTotal')).toContainText('60');
    await page.fill('#saleCash', '100');
    await expect(page.locator('#saleChange')).toContainText('40');
    expect(await page.locator('#saleQuickCash .chip').count()).toBeGreaterThan(0);

    await page.click('#saleModal button:has-text("Save Sale")');
    await expect(page.locator('#receiptModal')).toHaveClass(/show/);
    await expect(page.locator('#receiptBody')).toContainText('NENA STORE');
    await expect(page.locator('#receiptBody')).toContainText('Turon x4');
    await expect(page.locator('#receiptBody')).toContainText('CHANGE');
    expect(await page.evaluate(() => state.sales.length)).toBe(1);
    expect(await page.evaluate(() => state.sales[0].cash)).toBe(100);
    expect(await page.evaluate(() => state.sales[0].change)).toBe(40);
    expect(await page.evaluate(() => state.products.find((p) => p.id === 'p_t1').stock)).toBe(16);
    expect(errs).toEqual([]);
  });

  test('bottom nav is 4 clean tabs and every screen stays reachable', async ({ page }) => {
    const errs = watchErrors(page);
    await seed(page, BASE_SEED);
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.rpg-stat').first().waitFor();

    const tabs = page.locator('.navgrid button');
    expect(await tabs.count()).toBe(4);
    expect(await tabs.allInnerTexts()).toEqual(['⌂\nHome', '🛒\nPOS', '▣\nCatalog', '📊\nReports']);

    await page.click('#nav-reports');
    await expect(page.locator('#screen-reports')).toHaveClass(/active/);
    await expect(page.locator('#nav-reports')).toHaveClass(/active/);
    await page.click('#nav-products');
    await expect(page.locator('#screen-products')).toHaveClass(/active/);
    await page.click('#nav-sales');
    await expect(page.locator('#screen-sales')).toHaveClass(/active/);

    await page.evaluate(() => switchScreen('dashboard'));
    await page.click('#screen-dashboard .actions button:has-text("⋯ More")');
    await expect(page.locator('#screen-more')).toHaveClass(/active/);
    await page.click('#screen-more .actions button:has-text("Utang Ledger")');
    await expect(page.locator('#screen-utang')).toHaveClass(/active/);
    expect(errs).toEqual([]);
  });

});
