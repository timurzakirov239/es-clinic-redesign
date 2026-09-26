import { chromium } from '@playwright/test';
const browser=await chromium.launch({channel:'msedge',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.goto('http://127.0.0.1:5175/');
const rail=page.locator('.reviews-carousel');await rail.scrollIntoViewIfNeeded();
await rail.hover();let before=await rail.evaluate(e=>e.scrollLeft);await page.waitForTimeout(400);let after=await rail.evaluate(e=>e.scrollLeft);if(after===before)throw Error('Hover stopped autoplay');
await page.emulateMedia({reducedMotion:'reduce'}); await rail.scrollIntoViewIfNeeded(); await page.waitForTimeout(200);
const box=await rail.boundingBox();
for(const direction of [1,-1]){
 for(let i=0;i<12;i++){
  const x=direction===1?200:1100;const y=box.y+120;
  await page.mouse.move(x,y);await page.mouse.down();
  const start=await rail.evaluate(e=>e.scrollLeft);
  const cycle=await rail.locator('.reviews-group').first().evaluate(e=>e.getBoundingClientRect().width);
  await page.mouse.move(x+direction*800,y,{steps:12});await page.mouse.up();
  const end=await rail.evaluate(e=>e.scrollLeft);const expected=((start-direction*800)%cycle+cycle)%cycle;
  if(Math.abs(end-expected)>3)throw Error(`Drag seam failed ${start} ${end} ${expected}`);
 }
}
await page.emulateMedia({reducedMotion:'no-preference'});before=await rail.evaluate(e=>e.scrollLeft);await page.waitForTimeout(1500);after=await rail.evaluate(e=>e.scrollLeft);if(after!==before)throw Error('Release pause failed');await page.waitForTimeout(1800);after=await rail.evaluate(e=>e.scrollLeft);if(after===before)throw Error('Delayed resume failed');
console.log('Hover autoplay, 24 bidirectional drags across seams, two-second release pause and smooth resume: OK');await browser.close();



