import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const base = process.env.TEST_URL || "http://127.0.0.1:4175";

test("mobile contract panels reveal in view over a stationary transparent backdrop", { timeout: 60000 }, async () => {
  const browser = process.env.TEST_CDP
    ? await chromium.connectOverCDP(process.env.TEST_CDP)
    : await chromium.launch({ headless: true, executablePath: process.env.TEST_CHROME || undefined });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));

  try {
    await page.goto(base, { waitUntil: "networkidle" });
    const section = page.locator("[data-contract-scroll-preview]");
    const panels = section.locator("[data-contract-panel]");
    assert.equal(await panels.count(), 3);

    const styles = await section.evaluate(element => {
      const backdrop = element.firstElementChild;
      const panel = element.querySelector("[data-contract-panel]");
      return {
        attachment: getComputedStyle(element).backgroundAttachment,
        overflow: getComputedStyle(element).overflow,
        position: getComputedStyle(backdrop).position,
        image: getComputedStyle(backdrop).backgroundImage,
        transform: getComputedStyle(backdrop).transform,
        glass: getComputedStyle(panel).backgroundImage,
      };
    });
    assert.equal(styles.attachment, "scroll");
    assert.equal(styles.overflow, "clip");
    assert.equal(styles.position, "sticky");
    assert.match(styles.image, /official-footer-building\.webp/);
    assert.equal(styles.transform, "none", "Browser toolbar changes must not move the image layer");
    assert.match(styles.glass, /linear-gradient/);

    const sectionTop = await section.evaluate(element => element.getBoundingClientRect().top + scrollY);
    await page.evaluate(top => scrollTo({ top, behavior: "instant" }), sectionTop);
    await page.waitForFunction(element => element?.dataset.expanded === "true", await panels.nth(0).elementHandle());
    await page.waitForTimeout(900);
    assert.equal(await panels.nth(1).getAttribute("data-expanded"), "false", "Offscreen second panel should wait until visible");

    for (const index of [1, 2]) {
      await panels.nth(index).scrollIntoViewIfNeeded();
      await page.waitForFunction(element => element?.dataset.expanded === "true", await panels.nth(index).elementHandle());
      assert.equal(await panels.nth(index).locator("button").getAttribute("aria-expanded"), "true");
      if (index === 1) {
        const backdropTop = await section.evaluate(element => element.firstElementChild.getBoundingClientRect().top);
        assert.ok(Math.abs(backdropTop) < 2, "Backdrop must stay fixed in the viewport while scrolling through panels");
      }
    }

    await page.waitForTimeout(750);
    const height = await section.evaluate(element => element.getBoundingClientRect().height);
    await page.evaluate(top => scrollTo({ top, behavior: "instant" }), sectionTop + height - 200);
    assert.equal(await page.evaluate(() => document.elementFromPoint(195, 500)?.closest("[data-contract-scroll-preview]") === null), true,
      "Background must not cover the following section");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
    await browser.close();
  }
});

test("desktop contract background remains unchanged", { timeout: 30000 }, async () => {
  const browser = process.env.TEST_CDP
    ? await chromium.connectOverCDP(process.env.TEST_CDP)
    : await chromium.launch({ headless: true, executablePath: process.env.TEST_CHROME || undefined });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    const section = page.locator("[data-contract-scroll-preview]");
    const styles = await section.evaluate(element => ({
      backdropDisplay: getComputedStyle(element.firstElementChild).display,
      attachment: getComputedStyle(element).backgroundAttachment,
    }));
    assert.equal(styles.backdropDisplay, "none");
    assert.equal(styles.attachment, "fixed, fixed, fixed");
  } finally {
    await context.close();
    await browser.close();
  }
});
