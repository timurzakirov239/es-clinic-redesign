import { chromium } from '../node_modules/@playwright/test/index.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5180/', { waitUntil: 'networkidle' });
  if (await page.locator('.concept').count() !== 5) throw Error(`${name}: expected five concepts`);
  for (const selector of ['.clock-stop', '.thread-item', '.map-stop', '.dossier-sheet', '.film-frame']) {
    if (await page.locator(selector).count() !== 8) throw Error(`${name}: ${selector} should contain eight stages`);
  }
  await page.locator('.thread-card').first().locator('summary').click();
  if (!(await page.locator('.thread-card').first().evaluate(el => el.open))) throw Error(`${name}: thread detail did not open`);
  await page.locator('[data-map-step="5"]').click();
  if (!(await page.locator('[data-map-title]').innerText()).startsWith('Решаем')) throw Error(`${name}: map did not select stage 6`);
  await page.locator('.dossier-sheet').nth(4).locator('summary').click();
  if (!(await page.locator('.dossier-sheet').nth(4).evaluate(el => el.open))) throw Error(`${name}: dossier did not open`);
  await page.locator('[data-film-next]').click();
  await page.waitForTimeout(800);
  if ((await page.locator('[data-film-count]').innerText()) === '01 / 08') throw Error(`${name}: film did not advance`);
  await page.locator('[data-clock-step="3"]').click();
  await page.waitForTimeout(850);
  if (!(await page.locator('[data-clock-title]').innerText()).startsWith('Формируем')) throw Error(`${name}: clock did not advance`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow || errors.length) throw Error(`${name}: overflow ${overflow}; errors ${errors.join(', ')}`);
  if (process.env.CAPTURE === '1') {
    for (let i = 1; i <= 5; i++) {
      await page.locator(`#variant-${i}`).screenshot({ path: join(tmpdir(), `mfo-${name}-${i}.png`) });
    }
  }
  console.log(`${name}: five variants, eight stages each, interactions and viewport OK`);
  await page.close();
}
await browser.close();
