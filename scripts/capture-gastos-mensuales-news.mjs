import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "news");
const baseUrl = "http://localhost:5173/demo";

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-tour="budget-alert"]', { timeout: 30_000 });

  await page.screenshot({
    path: path.join(outDir, "gastos-mensuales-grilla.png"),
    fullPage: false,
  });

  await page.locator('[data-tour="add-card"]').last().click();
  await page.getByRole("heading", { name: /Agregar ítem|Add item/i }).waitFor();
  await page
    .getByRole("checkbox", { name: /Gastos variables|Variable spending/i })
    .check();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, "gastos-mensuales-agregar-item.png"),
    fullPage: false,
  });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);

  await page.getByRole("button", { name: /Super Efectivo/i }).first().click();
  await page.locator('[data-tour="add-expense"]').click();
  await page.getByRole("heading", { name: /Agregar gasto|Add expense/i }).waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(outDir, "gastos-mensuales-agregar-gasto.png"),
    fullPage: false,
  });

  await browser.close();
  console.log("Screenshots saved to public/news/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
