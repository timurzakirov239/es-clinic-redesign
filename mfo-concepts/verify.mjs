import { chromium } from '../node_modules/@playwright/test/index.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:5176/',{waitUntil:'networkidle'});
  if(await page.locator('.process-block').count()!==6)throw Error('Expected reference + five variants');
  if(await page.locator('.reference .stage-card').count()!==8)throw Error('Reference stage count');
  await page.locator('.reference .stage-card').first().locator('summary').click();
  if(!(await page.locator('.reference .stage-card').first().evaluate(el=>el.open)))throw Error('Reference disclosure');
  await page.locator('.thread [data-step="6"]').click();
  if(await page.locator('.thread [data-title]').innerText()!=='Подключаем внешнюю экспертизу')throw Error('Thread selection');
  await page.locator('.depth .flip-card').first().click();
  if(await page.locator('.depth .flip-card').first().getAttribute('aria-pressed')!=='true')throw Error('3D flip');
  await page.locator('.dossier [data-step="7"]').click();
  if(await page.locator('.dossier [data-title]').innerText()!=='Сохраняем непрерывность')throw Error('Dossier selection');
  await page.locator('.ribbon [data-next]').click();
  if(await page.locator('.ribbon [data-small-number]').first().innerText()!=='02')throw Error('Ribbon next');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  console.log(JSON.stringify({name,overflow,errors}));
  await page.close();
}
await browser.close();
