import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const base = process.env.TEST_URL || "http://127.0.0.1:4175";

test("current landing: content, navigation, consultation, media and responsive layout", { timeout: 120000 }, async () => {
  const browser = process.env.TEST_CDP
    ? await chromium.connectOverCDP(process.env.TEST_CDP)
    : await chromium.launch({ headless: true, executablePath: process.env.TEST_CHROME || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  const failed = [];
  const videoRequests = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", request => {
    if (request.url().includes(".mp4")) videoRequests.push(request.url());
  });

  try {
    const response = await page.goto(base, { waitUntil: "networkidle" });
    assert.equal(response.status(), 200);
    assert.equal(await page.locator("h1").count(), 1);
    for (const id of ["system", "application", "responsibility", "process", "team", "contract", "faq", "contacts"])
      assert.equal(await page.locator(`#${id}`).count(), 1, `Section #${id}`);
    assert.equal(await page.locator('[data-hero-version="rebuilt"]').getAttribute("data-hero-ready"), "true");
    assert.equal(videoRequests.length, 0, "Video must remain deferred before interaction");
    assert.equal(Math.round((await page.locator(".video-card").boundingBox()).width), 403);

    await page.getByRole("button", { name: "Открыть меню" }).click();
    assert.equal(await page.locator("#rebuilt-menu[open]").count(), 1);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => !document.querySelector("#rebuilt-menu")?.open);
    assert.equal(await page.getByRole("button", { name: "Открыть меню" }).count(), 1);

    await page.getByRole("button", { name: "Получить консультацию" }).first().click();
    assert.equal(await page.locator(".contact-dialog[open]").count(), 1);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator(".contact-dialog[open]").count(), 0);

    await page.getByRole("textbox", { name: "Ваше имя" }).fill("Тестовый пациент");
    await page.getByRole("textbox", { name: "Ваш номер телефона" }).fill("+79990000000");
    await page.locator(".consultation-lead-checkmark").click();
    assert.equal(await page.getByRole("checkbox").isChecked(), true);
    await page.locator(".consultation-lead-submit").click();
    assert.match(await page.getByRole("status").textContent(), /заявк.*Telegram|заявк.*позвоните/i);

    await page.getByRole("button", { name: "Смотреть видео с Дарьей Тишиной" }).click();
    assert.ok(videoRequests.length > 0, "Video is requested after Play");
    assert.equal(await page.locator(".video-card").getAttribute("data-mode"), "engaged");
    assert.equal(await page.locator(".video-card video").evaluate(video => video.controls), false);
    await page.locator("video").evaluate(video => video.pause());

    await page.locator("#faq summary").first().click();
    assert.equal(await page.locator("#faq details[open]").count(), 1);

    await page.locator(".prefooter-photo").scrollIntoViewIfNeeded();
    await page.locator(".prefooter-photo img").evaluate(image => image.decode());
    assert.ok(await page.locator(".prefooter-photo img").evaluate(image => image.naturalWidth > 0));

    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No overflow at ${width}px`);
    }
    assert.deepEqual(errors, [], "Browser exceptions");
    assert.deepEqual(failed, [], "Failed HTTP resources");
  } finally {
    await context.close();
    await browser.close();
  }
});

test("mobile video pauses and resumes by tapping the frame after launch", { timeout: 60000 }, async () => {
  const browser = process.env.TEST_CDP
    ? await chromium.connectOverCDP(process.env.TEST_CDP)
    : await chromium.launch({ headless: true, executablePath: process.env.TEST_CHROME || undefined });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  try {
    await page.goto(base, { waitUntil: "networkidle" });
    const card = page.locator(".video-card");
    await card.scrollIntoViewIfNeeded();
    assert.ok((await card.boundingBox()).width <= 360);
    await page.getByRole("button", { name: "Смотреть видео с Дарьей Тишиной" }).tap();
    await page.waitForFunction(() => !document.querySelector(".video-card video")?.paused);
    assert.equal(await page.locator(".video-card video").evaluate(video => video.controls), false);

    await page.locator(".video-card video").tap({ position: { x: 40, y: 80 } });
    await page.waitForFunction(() => document.querySelector(".video-card video")?.paused);
    await page.locator(".video-card video").tap({ position: { x: 180, y: 280 } });
    await page.waitForFunction(() => !document.querySelector(".video-card video")?.paused);
    await page.locator(".video-card video").evaluate(video => video.pause());
  } finally {
    await context.close();
    await browser.close();
  }
});

test("mobile comparison cards expand independently without scrolling the page", { timeout: 90000 }, async () => {
  const browser = process.env.TEST_CDP
    ? await chromium.connectOverCDP(process.env.TEST_CDP)
    : await chromium.launch({ headless: true, executablePath: process.env.TEST_CHROME || undefined });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  const openComparison = async (pair) => {
    await pair.scrollIntoViewIfNeeded();
    await page.waitForFunction(element => element?.dataset.revealed === "true", await pair.elementHandle());
    await page.waitForTimeout(650);
    const button = pair.locator("button[aria-label='Показать сравнение']");
    await button.scrollIntoViewIfNeeded();
    const clinicTopBefore = await pair.locator("[data-after-card]").evaluate(element => element.getBoundingClientRect().top);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    await button.click();
    await page.waitForFunction(element => element?.dataset.comparing === "true", await pair.elementHandle());
    await page.waitForTimeout(650);
    assert.equal(await page.evaluate(() => window.scrollY), scrollBefore, "Opening a card must not force page scrolling");
    const clinicTopAfter = await pair.locator("[data-after-card]").evaluate(element => element.getBoundingClientRect().top);
    assert.ok(Math.abs(clinicTopAfter - clinicTopBefore) < 2, "The selected clinic card must stay anchored while opening");
  };

  try {
    await page.goto(process.env.TEST_URL || "http://127.0.0.1:4175", { waitUntil: "networkidle" });
    const root = page.locator("[data-comparison-root]");
    const pairs = root.locator("[data-comparison-pair]");
    const first = pairs.nth(0);
    const second = pairs.nth(1);
    const titleTopBefore = await root.locator(".intro-title").evaluate(element => element.getBoundingClientRect().top + window.scrollY);

    await openComparison(first);
    const firstBeforeTextTop = await first.locator("[data-before-text]").evaluate(element => element.getBoundingClientRect().top);
    const firstClinicBottom = await first.locator("[data-after-card]").evaluate(element => element.getBoundingClientRect().bottom);
    assert.ok(firstBeforeTextTop > firstClinicBottom, "The self-care card must emerge below the stationary clinic card");
    assert.equal(await root.locator(".intro-title").evaluate(element => element.getBoundingClientRect().top + window.scrollY), titleTopBefore, "Opening a comparison must not move the heading");
    await openComparison(second);
    assert.equal(await first.getAttribute("data-comparing"), "true");
    assert.equal(await second.getAttribute("data-comparing"), "true", "A second comparison must not close the first");
    assert.equal(await first.locator("button").getAttribute("aria-expanded"), "true");
    assert.equal(await second.locator("button").getAttribute("aria-expanded"), "true");

    const collectivePicture = root.locator("[data-after-card] p").filter({ hasText: "Команда собирает целостную картину" }).locator("xpath=../../..");
    assert.equal(await collectivePicture.count(), 1);
    const upperTopBefore = await pairs.nth(2).evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    const lowerTopBefore = await pairs.nth(4).evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    await openComparison(collectivePicture);
    assert.equal(await collectivePicture.getAttribute("data-comparing"), "true");
    const upperTopAfter = await pairs.nth(2).evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    const lowerTopAfter = await pairs.nth(4).evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    assert.ok(Math.abs(upperTopAfter - upperTopBefore) < 1, "Opening a lower comparison must not visibly shift cards above it");
    assert.ok(lowerTopAfter > lowerTopBefore, "The section must reserve space below the opened comparison");
    const previousContentBottom = await page.locator("#comparison").evaluate(element => Math.max(...[...element.previousElementSibling.children].map(child => child.getBoundingClientRect().bottom)));
    const titleTop = await root.locator(".intro-title").evaluate(element => element.getBoundingClientRect().top);
    assert.ok(titleTop >= previousContentBottom, "The title must stay below the preceding section");
  } finally {
    await context.close();
    await browser.close();
  }
});
