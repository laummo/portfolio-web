import { html, raw, escapeHtml, SPRITE } from './html.mjs';
import * as S from './sections.mjs';

const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;

export function jsonLd(c) {
  const p = c.person;
  const cur = c.experience.find((j) => !j.end) || c.experience[0];
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    givenName: p.givenName,
    familyName: p.familyName,
    jobTitle: p.role,
    url: c.meta.url,
    image: new URL('assets/avatar.jpg', c.meta.url).href,
    email: `mailto:${p.contact.email}`,
    address: { '@type': 'PostalAddress', addressLocality: p.location.city, addressCountry: p.location.country },
    worksFor: { '@type': 'Organization', name: cur.company },
    alumniOf: c.education.map((e) => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    knowsAbout: c.skills.flatMap((g) => g.items.filter((i) => i.primary).map((i) => i.name)),
    knowsLanguage: ['es', 'en', 'fr'],
    sameAs: [p.contact.linkedin, p.contact.github]
  };
}

export function page({ c, ui, css, jsFile, imgs, year, alternates }) {
  const m = c.meta;
  const abs = (p) => new URL(p, m.url).href;
  const ld = JSON.stringify(jsonLd(c)).replace(/</g, '\\u003c');
  const uiData = JSON.stringify({ themeToDark: ui.themeToDark, themeToLight: ui.themeToLight, menuOpen: ui.menuOpen, menuClose: ui.menuClose, copied: ui.copied, form: ui.form }).replace(/</g, '\\u003c');
  return html`<!doctype html>
<html lang="${m.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${m.title}</title>
<meta name="description" content="${m.description}">
<link rel="canonical" href="${m.url}">
${alternates.map((a) => html`<link rel="alternate" hreflang="${a.lang}" href="${a.url}">`)}
<link rel="alternate" hreflang="x-default" href="${alternates[0].url}">
<meta name="theme-color" content="#FAF9F6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1C1C1E" media="(prefers-color-scheme: dark)">
<meta property="og:type" content="profile">
<meta property="profile:first_name" content="${c.person.givenName}">
<meta property="profile:last_name" content="${c.person.familyName}">
<meta property="og:title" content="${m.title}">
<meta property="og:description" content="${m.description}">
<meta property="og:url" content="${m.url}">
<meta property="og:image" content="${abs(m.ogImage)}">
<meta property="og:image:alt" content="${c.person.name} — ${c.person.role}">
<meta property="og:locale" content="${m.locale}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="manifest" href="site.webmanifest">
<link rel="preload" href="assets/fonts/Fraunces-latin.woff2" as="font" type="font/woff2" crossorigin>
<script>${raw(THEME_SCRIPT)}</script>
<style>${raw(css.inline)}</style>
${css.link ? html`<link rel="stylesheet" href="${css.link}">` : ''}
<link rel="stylesheet" href="${css.print}" media="print">
<script type="application/ld+json">${raw(ld)}</script>
</head>
<body>
${raw(SPRITE)}
<a class="skip-link" href="#main">${ui.skipLink}</a>
${S.header(c, ui)}
<main id="main" tabindex="-1">
${S.hero(c, ui, imgs)}
${S.about(c, ui)}
${S.experience(c, ui)}
${S.projects(c, ui, imgs)}
${S.skills(c, ui)}
${S.education(c, ui)}
${S.contact(c, ui)}
</main>
${S.footer(c, ui, year)}
<script type="application/json" id="ui-data">${raw(uiData)}</script>
<script type="module" src="${jsFile}"></script>
</body>
</html>
`;
}

export const notFound = ({ c, ui, css, base }) => html`<!doctype html>
<html lang="${c.meta.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>404 — ${c.person.name}</title><meta name="robots" content="noindex"><base href="${base}">
<style>${raw(css.inline)}</style></head>
<body><main class="container" style="padding-block:6rem"><h1>404</h1><p><a href="./">${escapeHtml(ui.footer.top)} — ${escapeHtml(c.person.name)}</a></p></main></body></html>
`;
