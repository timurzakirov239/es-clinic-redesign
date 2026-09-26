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
