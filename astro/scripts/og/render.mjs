// Renders og-image.html to public/og-image.png. Needs Playwright with Chromium installed
// (npx playwright install chromium). Run from astro/: node scripts/og/render.mjs
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('file://' + here('./og-image.html'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: here('../../public/og-image.png') });
await browser.close();
