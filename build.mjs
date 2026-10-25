import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { page, notFound } from './templates/layout.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const write = (p, data) => { const f = join(DIST, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, data); };
const hash = (s) => createHash('sha1').update(s).digest('hex').slice(0, 8);

// ---------- Validación del contenido ----------
function validate(c, lang) {
  const errs = [];
  const need = (cond, msg) => { if (!cond) errs.push(msg); };
  const url = (u, w) => need(/^https:\/\//.test(u), `${w}: URL no https (${u})`);
  ['title', 'description', 'url', 'lang', 'locale'].forEach((k) => need(c.meta?.[k], `meta.${k} obligatorio`));
  ['name', 'role', 'tagline'].forEach((k) => need(c.person?.[k], `person.${k} obligatorio`));
  need(c.person?.avatar?.alt, 'person.avatar.alt obligatorio');
  need(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.person?.contact?.email || ''), 'person.contact.email inválido');
  url(c.person?.contact?.linkedin, 'linkedin'); url(c.person?.contact?.github, 'github');
  need(c.about?.stats?.length === 3, 'about.stats debe tener 3 elementos');
  need(c.experience?.length > 0, 'experience vacío');
  c.experience?.forEach((j) => {
    ['id', 'company', 'role', 'start'].forEach((k) => need(j[k], `experience.${j.id}.${k} obligatorio`));
    need(/^\d{4}-\d{2}$/.test(j.start) && (j.end === null || /^\d{4}-\d{2}$/.test(j.end)), `experience.${j.id}: fechas deben ser YYYY-MM`);
    need(j.achievements?.length > 0 && j.achievements.length <= 4, `experience.${j.id}: 1-4 logros`);
    j.achievements?.forEach((a) => need(/\d/.test(a), `experience.${j.id}: logro sin cifra: "${a}"`));
  });
  c.projects?.forEach((p) => { need(p.alt, `projects.${p.id}.alt obligatorio`); url(p.links?.demo, p.id); url(p.links?.code, p.id); });
  c.certifications?.forEach((x) => url(x.url, x.title));
  if (JSON.stringify(c).match(/lorem ipsum/i)) errs.push('lorem ipsum detectado');
  if (errs.length) { console.error(`✖ Contenido inválido (${lang}):\n - ${errs.join('\n - ')}`); process.exit(1); }
}

// ---------- CSS ----------
const minify = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').replace(/\) and \(/g, ')and(').trim();
function buildCss() {
  const dark = minify(read('src/css/tokens.dark.css'));
  const tokens = read('src/css/tokens.css').replaceAll('@@DARK@@', dark);
  const screen = ['base', 'layout', 'components', 'motion'].map((n) => read(`src/css/${n}.css`));
  const inline = minify([tokens, ...screen].join('\n')).replaceAll('url("fonts/', 'url("assets/fonts/');
  const print = minify(read('src/css/print.css'));
  return { inline, print };
}

// ---------- Imágenes SVG ilustrativas (placeholders de ejemplo) ----------
const avatarSvg = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="Laura Martín">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#DCE6D8"/><stop offset="1" stop-color="#A9BFA6"/></linearGradient></defs>
<rect width="800" height="1000" fill="url(#g)"/>
<circle cx="640" cy="170" r="110" fill="#fff" opacity=".35"/>
<path d="M120 1000c0-210 120-330 280-330s280 120 280 330z" fill="#1C1C1E"/>
<path d="M330 640h140v90c0 30-30 50-70 50s-70-20-70-50z" fill="#D9A98B"/>
<ellipse cx="400" cy="440" rx="150" ry="180" fill="#E8B896"/>
<path d="M240 430c-10-170 90-250 170-250 110 0 170 90 150 250-30-80-60-120-110-140-50 40-130 60-210 140z" fill="#4A2F22"/>
<path d="M255 450c0 120 20 190 40 200-60-30-90-110-40-200z" fill="#4A2F22"/>
<circle cx="350" cy="455" r="9" fill="#1C1C1E"/><circle cx="450" cy="455" r="9" fill="#1C1C1E"/>
<path d="M355 540q45 35 90 0" stroke="#8A4A3A" stroke-width="8" fill="none" stroke-linecap="round"/>
<text x="400" y="900" text-anchor="middle" font-family="Georgia,serif" font-size="64" fill="#9DBF9E" letter-spacing="8">LM</text>
</svg>`;

const projectSvg = (p) => {
  const h = p.hue;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" role="img" aria-label="${p.title}">
<rect width="1600" height="1000" fill="hsl(${h} 25% 92%)"/>
<rect x="160" y="120" width="1280" height="760" rx="28" fill="#fff" stroke="hsl(${h} 15% 80%)" stroke-width="3"/>
<rect x="160" y="120" width="1280" height="70" rx="28" fill="hsl(${h} 20% 94%)"/>
<circle cx="215" cy="155" r="10" fill="hsl(${h} 30% 70%)"/><circle cx="250" cy="155" r="10" fill="hsl(${h} 30% 78%)"/><circle cx="285" cy="155" r="10" fill="hsl(${h} 30% 85%)"/>
<rect x="160" y="190" width="260" height="690" fill="hsl(${h} 25% 30%)"/>
<rect x="200" y="240" width="180" height="20" rx="10" fill="hsl(${h} 30% 75%)"/>
<rect x="200" y="300" width="140" height="14" rx="7" fill="hsl(${h} 20% 55%)"/><rect x="200" y="340" width="160" height="14" rx="7" fill="hsl(${h} 20% 55%)"/><rect x="200" y="380" width="120" height="14" rx="7" fill="hsl(${h} 20% 55%)"/>
<text x="480" y="270" font-family="Georgia,serif" font-size="56" fill="hsl(${h} 25% 25%)">${p.title}</text>
<polyline points="480,700 640,620 800,660 960,520 1120,560 1280,430 1400,470" fill="none" stroke="hsl(${h} 38% 38%)" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<rect x="480" y="740" width="440" height="60" rx="12" fill="hsl(${h} 25% 92%)"/><rect x="960" y="740" width="440" height="60" rx="12" fill="hsl(${h} 25% 92%)"/>
<rect x="480" y="320" width="280" height="110" rx="14" fill="hsl(${h} 30% 94%)"/><rect x="800" y="320" width="280" height="110" rx="14" fill="hsl(${h} 30% 94%)"/><rect x="1120" y="320" width="280" height="110" rx="14" fill="hsl(${h} 30% 94%)"/>
</svg>`;
};

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><style>rect{fill:#4F6F52}text{fill:#fff}@media(prefers-color-scheme:dark){rect{fill:#9DBF9E}text{fill:#1C1C1E}}</style><rect width="64" height="64" rx="14"/><text x="32" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="32" font-weight="600">LM</text></svg>`;
const ogSvg = (c) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#FAF9F6"/><rect x="0" y="0" width="14" height="630" fill="#4F6F52"/><text x="90" y="130" font-family="Arial,sans-serif" font-size="26" letter-spacing="4" fill="#5E5A55">${c.person.role.toUpperCase()}</text><text x="90" y="320" font-family="Georgia,serif" font-size="120" fill="#1C1C1E">${c.person.name}</text><text x="90" y="400" font-family="Georgia,serif" font-size="36" fill="#4F6F52">${c.person.tagline.slice(0, 52)}…</text><text x="90" y="560" font-family="Arial,sans-serif" font-size="28" fill="#5E5A55">${c.meta.url.replace('https://', '')}</text></svg>`;

// ---------- Build ----------
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const css = buildCss();
const js = read('src/js/main.js');
const jsFile = `assets/main.${hash(js)}.js`;
const printFile = `assets/print.${hash(css.print)}.css`;
write(jsFile, js);
write(printFile, css.print);
cpSync(join(ROOT, 'src/fonts'), join(DIST, 'assets/fonts'), { recursive: true });

const langs = readdirSync(join(ROOT, 'content')).filter((f) => /^[a-z]{2}\.json$/.test(f)).map((f) => f.slice(0, 2));
langs.sort((a, b) => (a === 'es' ? -1 : b === 'es' ? 1 : a.localeCompare(b)));
const data = Object.fromEntries(langs.map((l) => {
  const c = JSON.parse(read(`content/${l}.json`));
  validate(c, l);
  return [l, { c, ui: JSON.parse(read(`content/ui.${l}.json`)) }];
}));
const alternates = langs.map((l) => ({ lang: l, url: data[l].c.meta.url + (l === langs[0] ? '' : `${l}/`) }));
const base = data[langs[0]].c;
const year = new Date().getFullYear();

const imgs = { avatar: 'assets/avatar.svg', projects: Object.fromEntries(base.projects.map((p) => [p.id, `assets/projects/${p.id}.svg`])) };
write('assets/avatar.svg', avatarSvg());
base.projects.forEach((p) => write(`assets/projects/${p.id}.svg`, projectSvg(p)));
write('favicon.svg', faviconSvg);
write('assets/og-image.svg', ogSvg(base));
const ogPng = join(ROOT, 'src/img/og-image.png');
if (existsSync(ogPng)) cpSync(ogPng, join(DIST, 'assets/og-image.png'));
if (existsSync(join(ROOT, 'src/img/cv.pdf'))) cpSync(join(ROOT, 'src/img/cv.pdf'), join(DIST, 'assets/cv-laura-martin-es.pdf'));

langs.forEach((l, i) => {
  const { c, ui } = data[l];
  if (existsSync(ogPng)) c.meta.ogImage = 'assets/og-image.png';
  let out = String(page({ c, ui, css: { inline: css.inline, print: printFile }, jsFile, imgs, year, alternates }));
  if (i > 0) out = out.replace(/(href|src)="(assets\/|favicon\.svg|site\.webmanifest)/g, '$1="../$2').replace(/url\("assets\//g, 'url("../assets/');
  write(i === 0 ? 'index.html' : `${l}/index.html`, out);
});

write('404.html', String(notFound({ c: base, ui: data[langs[0]].ui, css: { inline: css.inline }, base: base.meta.url })).replaceAll('url("assets/', `url("${base.meta.url}assets/`));
write('site.webmanifest', JSON.stringify({ name: base.person.name, short_name: base.person.givenName, start_url: '/', display: 'browser', background_color: '#FAF9F6', theme_color: '#4F6F52', icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }] }, null, 2));
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base.meta.url}sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${alternates.map((a) => `<url><loc>${a.url}</loc>${alternates.map((b) => `<xhtml:link rel="alternate" hreflang="${b.lang}" href="${b.url}"/>`).join('')}</url>`).join('\n')}\n</urlset>\n`);

console.log(`✔ Build OK · idiomas: ${langs.join(', ')} · CSS inline ${(css.inline.length / 1024).toFixed(1)} KB`);
