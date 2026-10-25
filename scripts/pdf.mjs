// Genera el PDF del CV (print.css) y la imagen OG con Chrome/Edge headless.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) { console.error('✖ No se encontró Chrome/Edge. Define CHROME_PATH. Fallback: botón de impresión del navegador.'); process.exit(1); }

const index = pathToFileURL(join(ROOT, 'dist', 'index.html')).href;
mkdirSync(join(ROOT, 'src/img'), { recursive: true });
const pdf = join(ROOT, 'src/img/cv.pdf');
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--run-all-compositor-stages-before-draw', '--virtual-time-budget=3000', `--print-to-pdf=${pdf}`, index], { stdio: 'ignore' });

const og = join(ROOT, 'src/img/og-image.png');
const ogHtml = join(ROOT, 'dist/assets/og-image.svg');
execFileSync(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--window-size=1200,630', `--screenshot=${og}`, pathToFileURL(ogHtml).href], { stdio: 'ignore' });

mkdirSync(join(ROOT, 'dist/assets'), { recursive: true });
copyFileSync(pdf, join(ROOT, 'dist/assets/cv-laura-martin-es.pdf'));
copyFileSync(og, join(ROOT, 'dist/assets/og-image.png'));
console.log('✔ PDF y og-image.png generados. Ejecuta `npm run build` para que el HTML apunte a og-image.png.');
