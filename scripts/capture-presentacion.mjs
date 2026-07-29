import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "docs", "presentacion", "assets");
const BASE = "http://localhost:5173";
const DEMO = `${BASE}/demo`;

async function waitForApp(page) {
  await page.goto(DEMO, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-tour="consolidated-table"]', {
    timeout: 30_000,
  });
}

async function save(page, name) {
  await page.screenshot({
    path: path.join(outDir, name),
    fullPage: false,
  });
  console.log(`  ✓ ${name}`);
}

async function openProfileSection(page, sectionLabel) {
  await page.goto(`${DEMO}/perfil`, { waitUntil: "networkidle" });
  await page
    .getByRole("navigation", { name: /Secciones de configuración/i })
    .getByRole("button", { name: sectionLabel })
    .click();
}

async function applyThemeForScreenshot(page, themeValue) {
  await openProfileSection(page, /Apariencia/i);
  await page.locator("#settings-appearance-visual-theme").selectOption(themeValue);
  await page.waitForTimeout(500);
  await page.getByRole("tab", { name: /Mi futuro/i }).click();
  await page.waitForSelector('[data-tour="consolidated-table"]');
  await page.waitForTimeout(400);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1360, height: 900 },
    deviceScaleFactor: 2,
  });

  console.log("Capturando presentación…");

  await waitForApp(page);
  await save(page, "01-vista-consolidada.png");

  await page.locator('[data-tour="budget-alert"]').scrollIntoViewIfNeeded();
  await save(page, "02-limite-gasto-saldo.png");

  await page.getByRole("button", { name: /Visa BBVA/i }).first().click();
  await page.locator('[data-tour="card-expense-list"]').waitFor();
  await page.waitForTimeout(300);
  await save(page, "03-detalle-tarjeta.png");

  await page.locator('[data-tour="add-expense"]').click();
  await page.getByRole("heading", { name: /Agregar gasto/i }).waitFor();
  await page.waitForTimeout(400);
  await save(page, "04-agregar-gasto.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  await page.getByRole("tab", { name: /Mi futuro/i }).click();
  await page.waitForSelector('[data-tour="consolidated-table"]');
  await page.getByRole("button", { name: /Super Efectivo/i }).first().click();
  await page.locator('[data-tour="add-expense"]').click();
  await page.getByRole("heading", { name: /Agregar gasto/i }).waitFor();
  await page.waitForTimeout(400);
  await save(page, "05-gasto-variable-formulario.png");
  await page.keyboard.press("Escape");

  await page.goto(`${DEMO}/tablero`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Tablero/i }).waitFor();
  await page.waitForTimeout(500);
  await save(page, "06-tablero-categorias.png");

  await openProfileSection(page, /Apariencia/i);
  await page.locator("#settings-appearance-visual-theme").waitFor();
  await page.waitForTimeout(300);
  await save(page, "07-perfil-apariencia.png");

  await openProfileSection(page, /Preferencias/i);
  await page.locator('[data-tour="currency"]').waitFor();
  await page.waitForTimeout(300);
  await save(page, "08-perfil-preferencias-usd.png");

  await openProfileSection(page, /Tarjetas/i);
  await page.waitForTimeout(300);
  await save(page, "09-perfil-tarjetas.png");

  await page.goto(`${DEMO}/novedades`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: /Novedades/i }).waitFor();
  await page.waitForTimeout(300);
  await save(page, "10-novedades.png");

  const themes = [
    ["expedition", "11-tema-expedicion.png"],
    ["win95", "12-tema-win95.png"],
    ["neobrutalism", "13-tema-neobrutalism.png"],
    ["liquidGlass", "14-tema-liquid-glass.png"],
  ];

  for (const [value, file] of themes) {
    await applyThemeForScreenshot(page, value);
    await save(page, file);
  }

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("heading", { level: 1 }).waitFor({ timeout: 15_000 });
  await page.waitForTimeout(400);
  await save(page, "15-landing.png");

  await browser.close();
  console.log(`\nListo → docs/presentacion/assets/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
