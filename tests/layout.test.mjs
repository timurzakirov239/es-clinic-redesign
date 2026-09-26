import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

test("editor: select, move, persist, export, import and reset", { timeout: 90000 }, async () => {
  const browser = process.env.TEST_CDP
    ? await chromium.connectOverCDP(process.env.TEST_CDP)
    : await chromium.launch({ headless: true, executablePath: process.env.TEST_CHROME || undefined });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const brand = 'a[aria-label="ЕС Клиника – на главную"] img';
  const pick = async selector => {
    if (!await page.locator(".editor-panel").count()) await page.locator(".editor-launcher").click();
    await page.locator(".editor-primary").click();
    await page.locator(selector).first().click();
    await page.locator(".layout-fields").waitFor();
  };

  try {
    await page.goto(process.env.TEST_URL || "http://127.0.0.1:4175", { waitUntil: "networkidle" });
    await pick(brand);
    const id = await page.locator(brand).getAttribute("data-layout-id");
    await page.getByRole("button", { name: "Вниз", exact: true }).click();
    await page.getByLabel("Масштаб, %").fill("150");
    assert.equal(await page.locator(brand).evaluate(el => getComputedStyle(el).translate), "0px 10px");
    assert.equal(await page.locator(brand).evaluate(el => getComputedStyle(el).scale), "1.5");
    await page.waitForFunction(key => JSON.parse(localStorage.getItem("es-clinic-next-document-v1") || "{}")[key]?.layout?.scale === 150, id);

    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator(brand).evaluate(el => getComputedStyle(el).scale), "1.5");
    await pick(brand);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Экспорт JSON" }).click();
    const exported = await downloadPromise;
    await page.getByRole("button", { name: "Сбросить положение и размер" }).click();
    assert.equal(await page.locator(brand).evaluate(el => getComputedStyle(el).scale), "1");
    await page.getByLabel("Импорт JSON").setInputFiles(await exported.path());
    await page.waitForFunction(() => getComputedStyle(document.querySelector('a[aria-label="ЕС Клиника – на главную"] img')).scale === "1.5");

    await pick('[data-edit-id="copy-13"]');
    await page.getByLabel("Текст", { exact: true }).fill("Тест редактора");
    assert.equal(await page.locator('[data-edit-id="copy-13"]').textContent(), "Тест редактора");
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("es-clinic-next-document-v1") || "{}")["copy-13"]?.text === "Тест редактора");
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator('[data-edit-id="copy-13"]').textContent(), "Тест редактора");
    await page.locator(".editor-launcher").click();
    page.once("dialog", dialog => dialog.accept());
    await page.getByRole("button", { name: "Сбросить все изменения" }).click();
    await page.waitForFunction(() => !JSON.parse(localStorage.getItem("es-clinic-next-document-v1") || "{}")["copy-13"]);
    await page.reload({ waitUntil: "networkidle" });
    assert.notEqual(await page.locator('[data-edit-id="copy-13"]').textContent(), "Тест редактора");
    assert.equal(await page.locator(brand).evaluate(el => getComputedStyle(el).scale), "none");
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
    await browser.close();
  }
});
