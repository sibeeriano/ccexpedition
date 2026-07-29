import { readFile, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docDir = path.join(__dirname, "..", "docs", "presentacion");
const mdPath = path.join(docDir, "PRESENTACION.md");
const pdfPath = path.join(docDir, "PRESENTACION.pdf");
const htmlPath = path.join(docDir, ".presentacion-export.html");

function buildHtml(markdown) {
  const mdJson = JSON.stringify(markdown);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>ccExpedition — Presentación</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: "Segoe UI", system-ui, sans-serif;
      max-width: 920px;
      margin: 0 auto;
      padding: 2rem 2.5rem 3rem;
      color: #111827;
      line-height: 1.65;
      font-size: 14px;
    }
    h1 {
      font-size: 1.85rem;
      font-weight: 700;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 0.45rem;
      margin-bottom: 1.25rem;
      page-break-after: avoid;
    }
    h2 {
      font-size: 1.35rem;
      font-weight: 700;
      color: #1e40af;
      margin: 2rem 0 0.75rem;
      page-break-after: avoid;
    }
    h3 {
      font-size: 1.05rem;
      font-weight: 600;
      margin: 1.35rem 0 0.5rem;
      page-break-after: avoid;
    }
    p, li { margin: 0.5rem 0; }
    ul, ol { padding-left: 1.35rem; }
    img {
      display: block;
      max-width: 100%;
      height: auto;
      max-height: 420px;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      margin: 1rem auto;
      page-break-inside: avoid;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1rem 0;
      font-size: 13px;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 0.45rem 0.6rem;
      text-align: left;
      vertical-align: top;
    }
    th { background: #f3f4f6; font-weight: 600; }
    blockquote {
      border-left: 4px solid #2563eb;
      margin: 1rem 0;
      padding: 0.35rem 0 0.35rem 1rem;
      color: #374151;
      background: #f9fafb;
    }
    pre {
      background: #f3f4f6;
      padding: 0.85rem 1rem;
      overflow-x: auto;
      border-radius: 6px;
      font-size: 12px;
      page-break-inside: avoid;
    }
    code {
      background: #f3f4f6;
      padding: 0.12rem 0.35rem;
      border-radius: 4px;
      font-size: 0.92em;
      font-family: Consolas, monospace;
    }
    pre code { background: none; padding: 0; }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2rem 0;
    }
    .mermaid {
      margin: 1.25rem 0;
      text-align: center;
      page-break-inside: avoid;
    }
    strong { font-weight: 600; }
    em { color: #4b5563; }
  </style>
</head>
<body>
  <div id="content"></div>
  <script id="md-source" type="application/json">${mdJson}</script>
  <script>
    (async () => {
      const md = JSON.parse(document.getElementById("md-source").textContent);
      mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "loose" });

      marked.setOptions({ gfm: true, breaks: false });
      let html = marked.parse(md);

      html = html.replace(
        /<pre><code class="language-mermaid">([\\s\\S]*?)<\\/code><\\/pre>/g,
        (_, code) => {
          const decoded = code
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"');
          return '<div class="mermaid">' + decoded + "</div>";
        }
      );

      document.getElementById("content").innerHTML = html;

      const nodes = document.querySelectorAll(".mermaid");
      if (nodes.length > 0) {
        await mermaid.run({ nodes });
      }

      await Promise.all(
        Array.from(document.images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
        )
      );

      document.body.dataset.ready = "1";
    })().catch((error) => {
      console.error(error);
      document.body.dataset.ready = "error";
    });
  </script>
</body>
</html>`;
}

async function main() {
  const markdown = await readFile(mdPath, "utf8");
  await writeFile(htmlPath, buildHtml(markdown), "utf8");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const fileUrl = `file:///${htmlPath.replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => document.body.dataset.ready === "1", {
    timeout: 60_000,
  });
  await page.waitForTimeout(500);

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "14mm", right: "14mm" },
  });

  await browser.close();

  try {
    await unlink(htmlPath);
  } catch {
    // ignore
  }

  console.log(`PDF generado: ${pdfPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
