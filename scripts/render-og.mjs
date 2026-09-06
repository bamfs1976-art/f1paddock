#!/usr/bin/env node
// Renders public/og-image.png (1200 by 630) from scripts/og/og.html and the
// 180px and 512px PNG icons from public/favicon.svg.
//
//   npx --yes playwright-core@latest --version   # optional check
//   node scripts/render-og.mjs
//
// playwright-core is not a project dependency; install it locally when you
// need to regenerate (`npm i --no-save playwright-core`). Set CHROME_PATH to
// use an installed Chromium instead of Playwright's download.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

let chromium;
try {
  ({ chromium } = await import('playwright-core'));
} catch {
  console.error('playwright-core is not installed. Run: npm i --no-save playwright-core');
  process.exit(2);
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH || undefined,
  args: ['--no-sandbox'],
});

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(root, 'scripts', 'og', 'og.html')).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(root, 'public', 'og-image.png'), type: 'png' });
  console.log('wrote public/og-image.png');

  const svg = await readFile(join(root, 'public', 'favicon.svg'), 'utf8');
  for (const size of [180, 512]) {
    const html = `<!doctype html><html><head><style>html,body{margin:0;width:${size}px;height:${size}px;background:#0a0a0a;overflow:hidden}svg{width:${size}px;height:${size}px;display:block}</style></head><body>${svg}</body></html>`;
    const icon = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await icon.setContent(html);
    const png = await icon.screenshot({ type: 'png' });
    await writeFile(join(root, 'public', `icon-${size}.png`), png);
    await icon.close();
    console.log(`wrote public/icon-${size}.png`);
  }
} finally {
  await browser.close();
}
