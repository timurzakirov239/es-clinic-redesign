import { chromium } from '../node_modules/@playwright/test/index.mjs';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const [name, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:5177/', { waitUntil: 'networkidle' });
  if (await page.locator('.story').count() !== 3) throw Error(`${name}: expected three stories`);
  const after = await page.locator('.answer').allInnerTexts();
  const before = await page.locator('.context p').allInnerTexts();
  if (after.some(text => !text) || before.some(text => !text)) throw Error(`${name}: missing text`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (overflow !== 0 || errors.length) throw Error(`${name}: overflow ${overflow}; errors ${errors.join(', ')}`);
  console.log(`${name}: three complete pairs visible without interaction`);
  await page.close();
}
await browser.close();
