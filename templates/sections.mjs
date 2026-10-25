import { html, raw, icon, formatMonth } from './html.mjs';

const chips = (items, cls = '') => html`<ul class="chips" role="list">${items.map((t) => html`<li class="chip ${cls}">${t}</li>`)}</ul>`;
const title = (id, num, text) => html`<h2 class="section-title" id="${id}-title"><span class="num" aria-hidden="true">${num}</span>${text}</h2>`;
const ext = (ui) => html`<span class="visually-hidden"> ${ui.newTab}</span>`;

export function header(c, ui) {
  return html`<header class="site-header">
  <div class="container header-inner">
    <a class="logo" href="#inicio" aria-label="${c.person.name} — ${ui.home}">${c.person.givenName} ${c.person.familyName}</a>
    <nav class="nav" id="site-nav" aria-label="${ui.navLabel}">
      <ul class="nav-list" role="list">${ui.nav.map((n) => html`<li><a href="#${n.id}">${n.label}</a></li>`)}</ul>
    </nav>
    <button class="icon-btn theme-toggle" type="button" aria-pressed="false" aria-label="${ui.themeToDark}" hidden>${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}</button>
    <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="${ui.menuOpen}">${icon('menu')}</button>
  </div>
  <div class="progress" aria-hidden="true"></div>
</header>`;
}

export function hero(c, ui, img) {
  const p = c.person;
  return html`<section class="section hero" id="inicio" aria-labelledby="hero-title">
  <div class="container grid hero-grid">
    <div class="hero-text">
      <p class="eyebrow">${p.role}</p>
      <h1 id="hero-title">${p.name}</h1>
      <p class="tagline">${p.tagline}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${p.cv}" download>${icon('download')}${ui.downloadCv}</a>
        <a class="btn btn-ghost" href="#contacto">${ui.contactCta}${icon('arrow')}</a>
      </div>
      <p class="meta-line">${p.location.city} · ${p.location.mode}</p>
    </div>
    <div class="hero-photo">
      <img class="avatar" src="${img.avatar}" alt="${p.avatar.alt}" width="${p.avatar.width}" height="${p.avatar.height}" fetchpriority="high" decoding="async">
    </div>
  </div>
</section>`;
}

export function about(c, ui) {
  return html`<section class="section" id="sobre-mi" aria-labelledby="about-title">
  <div class="container split">
    <div class="split-head">${title('about', '01', ui.sections.about)}</div>
    <div class="split-body" data-reveal>
      <p class="prose">${c.about.body}</p>
      <dl class="stats">${c.about.stats.map((s) => html`<div class="stat"><dt>${s.label}</dt><dd>${s.value}</dd></div>`)}</dl>
    </div>
  </div>
</section>`;
}

export function experience(c, ui) {
  const lang = c.meta.lang;
  return html`<section class="section" id="experiencia" aria-labelledby="experience-title">
  <div class="container split">
    <div class="split-head">${title('experience', '02', ui.sections.experience)}</div>
    <ol class="split-body timeline" role="list">${c.experience.map((j, i) => html`
      <li class="job" data-reveal style="--i:${i % 4}">
        <p class="job-dates"><time datetime="${j.start}">${formatMonth(j.start, lang)}</time> — ${j.end ? html`<time datetime="${j.end}">${formatMonth(j.end, lang)}</time>` : ui.present}</p>
        <article class="job-main">
          <h3>${j.role}</h3>
          <p class="job-co"><a href="${j.url}" target="_blank" rel="noopener noreferrer">${j.company}${ext(ui)}</a> · ${j.location}</p>
          <ul class="bullets" role="list">${j.achievements.map((a) => html`<li>${a}</li>`)}</ul>
          ${chips(j.tech)}
        </article>
      </li>`)}
    </ol>
  </div>
</section>`;
}

export function projects(c, ui, img) {
  return html`<section class="section" id="proyectos" aria-labelledby="projects-title">
  <div class="container">
    ${title('projects', '03', ui.sections.projects)}
    <ul class="cards" role="list">${c.projects.map((p, i) => html`
      <li class="card ${p.featured ? 'is-featured' : ''}" data-reveal style="--i:${i % 4}">
        <div class="card-media"><img src="${img.projects[p.id]}" alt="${p.alt}" width="1600" height="1000" loading="lazy" decoding="async"></div>
        <article class="card-body">
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
          ${chips(p.tech)}
          <div class="card-links">
            <a href="${p.links.demo}" target="_blank" rel="noopener noreferrer">${ui.demo}<span class="visually-hidden"> ${p.title} ${ui.newTab}</span></a>
            <a href="${p.links.code}" target="_blank" rel="noopener noreferrer">${ui.code}<span class="visually-hidden"> ${p.title} ${ui.newTab}</span></a>
          </div>
        </article>
      </li>`)}
    </ul>
  </div>
</section>`;
}

export function skills(c, ui) {
  return html`<section class="section" id="habilidades" aria-labelledby="skills-title">
  <div class="container split">
    <div class="split-head">${title('skills', '04', ui.sections.skills)}</div>
    <div class="split-body" data-reveal>
      <div class="skill-groups">${c.skills.map((g) => html`
        <div><h3>${g.category}</h3>
          <ul class="chips" role="list">${g.items.map((s) => html`<li class="chip ${s.primary ? 'is-primary' : ''}">${s.name}${s.primary ? html`<span class="visually-hidden"> (${ui.primary})</span>` : ''}</li>`)}</ul>
        </div>`)}
      </div>
      <p class="langs"><strong>${ui.languagesTitle}:</strong> ${c.languages.map((l) => `${l.name} (${l.level})`).join(' · ')}</p>
    </div>
  </div>
</section>`;
}

export function education(c, ui) {
  const lang = c.meta.lang;
  return html`<section class="section" id="formacion" aria-labelledby="education-title">
  <div class="container split">
    <div class="split-head">${title('education', '05', ui.sections.education)}</div>
    <div class="split-body edu-cols" data-reveal>
      <div><h3>${ui.educationTitle}</h3>
        <ul class="entries" role="list">${c.education.map((e) => html`<li><p class="entry-title">${e.title}</p><p class="entry-sub">${e.institution} · ${e.start} — ${e.end}</p></li>`)}</ul>
      </div>
      <div><h3>${ui.certTitle}</h3>
        <ul class="entries" role="list">${c.certifications.map((e) => html`<li><p class="entry-title">${e.title}</p><p class="entry-sub">${e.issuer} · <time datetime="${e.date}">${formatMonth(e.date, lang)}</time> · <a href="${e.url}" target="_blank" rel="noopener noreferrer">${ui.verify}${ext(ui)}</a></p></li>`)}</ul>
      </div>
    </div>
  </div>
</section>`;
}

export function contact(c, ui) {
  const p = c.person;
  const f = ui.form;
  const ep = c.contactForm.endpoint;
  const err = (n) => html`<p class="field-error" id="err-${n}"></p>`;
  return html`<section class="section" id="contacto" aria-labelledby="contact-title">
  <div class="container contact-grid">
    <div class="contact-info" data-reveal>
      ${title('contact', '06', ui.sections.contact)}
      <p class="prose contact-cta">${ui.contactIntro}</p>
      <address><ul class="contact-links" role="list">
        <li>${icon('mail', 'btn-ico')}<a href="mailto:${p.contact.email}">${p.contact.email}</a><button class="btn btn-ghost btn-sm copy-btn" type="button" data-copy="${p.contact.email}" hidden>${ui.copy}</button></li>
        <li>${icon('linkedin', 'btn-ico')}<a href="${p.contact.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn${ext(ui)}</a></li>
        <li>${icon('github', 'btn-ico')}<a href="${p.contact.github}" target="_blank" rel="noopener noreferrer">GitHub${ext(ui)}</a></li>
      </ul></address>
      <p class="visually-hidden" id="copy-status" role="status" aria-live="polite"></p>
    </div>
    <form class="form" id="contact-form" data-reveal method="post" action="${ep || `mailto:${p.contact.email}`}" ${ep ? '' : raw('enctype="text/plain"')} data-endpoint="${ep}" data-email="${p.contact.email}" aria-describedby="form-note">
      <p class="form-note" id="form-note">${f.note}</p>
      <div class="form-summary" id="form-summary" role="alert" tabindex="-1" hidden></div>
      <div class="field"><label for="f-name">${f.name} *</label><input id="f-name" name="name" type="text" autocomplete="name" required aria-describedby="err-name">${err('name')}</div>
      <div class="field"><label for="f-email">${f.email} *</label><input id="f-email" name="email" type="email" autocomplete="email" required aria-describedby="err-email">${err('email')}</div>
      <div class="field"><label for="f-subject">${f.subject}</label><select id="f-subject" name="subject">${c.contactForm.subjects.map((s) => html`<option>${s}</option>`)}</select></div>
      <div class="field"><label for="f-message">${f.message} *</label><textarea id="f-message" name="message" rows="6" required minlength="20" maxlength="2000" aria-describedby="err-message"></textarea>${err('message')}</div>
      <div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>
      <button class="btn btn-primary" type="submit">${f.send}${icon('arrow')}</button>
      <p class="form-status" id="form-status" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`;
}

export function footer(c, ui, year) {
  return html`<footer class="site-footer">
  <div class="container footer-inner">
    <p>© ${year} ${c.person.name}. ${ui.footer.rights}</p>
    <p class="no-print">${ui.footer.built}</p>
    <p class="no-print"><a href="#inicio">${ui.footer.top} ↑</a></p>
  </div>
</footer>`;
}
