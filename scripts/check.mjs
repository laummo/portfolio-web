// Comprobaciones rápidas sobre dist/: presupuesto de peso, estructura y enlaces ancla.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (!existsSync(join(dist, 'index.html'))) { console.error('✖ Ejecuta `npm run build` primero.'); process.exit(1); }
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const gz = (s) => gzipSync(s).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
let fail = 0;
const check = (ok, msg) => { console.log(`${ok ? '✔' : '✖'} ${msg}`); if (!ok) fail++; };

check(gz(html) <= 30 * 1024, `HTML gzip ${kb(gz(html))} (≤ 30 KB)`);
const js = readdirSync(join(dist, 'assets')).find((f) => f.startsWith('main.') && f.endsWith('.js'));
check(gz(readFileSync(join(dist, 'assets', js))) <= 4 * 1024, `JS gzip ${kb(gz(readFileSync(join(dist, 'assets', js))))} (≤ 4 KB)`);
check((html.match(/<h1[ >]/g) || []).length === 1, 'Un único h1');
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const broken = [...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]).filter((id) => !ids.has(id));
check(broken.length === 0, `Anclas internas válidas${broken.length ? ': faltan ' + broken.join(', ') : ''}`);
check(!/lorem ipsum/i.test(html), 'Sin lorem ipsum');
check([...html.matchAll(/<img\b[^>]*>/g)].every((m) => /\balt="[^"]+"/.test(m[0]) && /\bwidth=/.test(m[0]) && /\bheight=/.test(m[0])), 'Todas las imágenes con alt, width y height');
check(existsSync(join(dist, 'assets/cv-laura-martin-es.pdf')), 'PDF del CV presente (npm run pdf)');
process.exit(fail ? 1 : 0);
