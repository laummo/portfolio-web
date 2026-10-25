const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const ui = JSON.parse($('#ui-data')?.textContent || '{}');
root.classList.add('js');

function effectiveDark() {
  const t = root.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}

function initTheme() {
  const btn = $('.theme-toggle');
  if (!btn) return;
  const metas = $$('meta[name="theme-color"]');
  const sync = () => {
    const dark = effectiveDark();
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? ui.themeToLight : ui.themeToDark);
    if (root.dataset.theme) {
      metas.forEach((m) => { m.removeAttribute('media'); m.content = dark ? '#1C1C1E' : '#FAF9F6'; });
    }
  };
  btn.hidden = false;
  btn.addEventListener('click', () => {
    root.classList.add('theme-transition');
    const next = effectiveDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    sync();
    setTimeout(() => root.classList.remove('theme-transition'), 300);
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', sync);
  sync();
}

function initMenu() {
  const btn = $('.menu-btn');
  const nav = $('#site-nav');
  if (!btn || !nav) return;
  const mq = matchMedia('(max-width: 56.24em)');
  const focusables = () => [btn, ...$$('a', nav)];
  const set = (open) => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? ui.menuClose : ui.menuOpen);
    if (mq.matches) nav.inert = !open;
  };
  const sync = () => { nav.inert = mq.matches; set(false); nav.inert = mq.matches; };
  btn.addEventListener('click', () => set(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => {
    if (!nav.classList.contains('is-open')) return;
    if (e.key === 'Escape') { set(false); btn.focus(); }
    if (e.key === 'Tab') {
      const f = focusables();
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  mq.addEventListener('change', sync);
  sync();
}

function initActiveNav() {
  const links = new Map($$('.nav-list a').map((a) => [a.hash.slice(1), a]));
  const sections = $$('main section[id]').filter((s) => links.has(s.id));
  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
      const a = links.get(e.target.id);
      a.classList.add('is-active');
      a.setAttribute('aria-current', 'location');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
}

function initAnchors() {
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', () => {
    const t = document.getElementById(a.hash.slice(1));
    if (t) { if (!t.hasAttribute('tabindex')) t.tabIndex = -1; setTimeout(() => t.focus({ preventScroll: true }), 0); }
  }));
}

function initReveal() {
  const els = $$('[data-reveal]');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => io.observe(el));
}

function initScroll() {
  const bar = $('.progress');
  const header = $('.site-header');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  const update = () => {
    const y = scrollY;
    const max = root.scrollHeight - innerHeight;
    if (bar && !reduce.matches) bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    header?.classList.toggle('is-scrolled', y > 8);
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  requestAnimationFrame(update);
}

function initCopy() {
  const btn = $('.copy-btn');
  const live = $('#copy-status');
  if (!btn || !navigator.clipboard) return;
  btn.hidden = false;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      live.textContent = ui.copied;
      setTimeout(() => { live.textContent = ''; }, 2000);
    } catch {}
  });
}

function initForm() {
  const form = $('#contact-form');
  if (!form) return;
  const status = $('#form-status');
  const summary = $('#form-summary');
  const f = ui.form;
  form.noValidate = true;
  const fields = $$('input:not(.hp input), select, textarea', form).filter((el) => el.name && el.name !== 'website');

  const message = (el) => {
    const v = el.validity;
    if (v.valueMissing) return f.errors.valueMissing;
    if (v.typeMismatch) return f.errors.typeMismatch;
    if (v.tooShort) return f.errors.tooShort;
    return el.validationMessage;
  };
  const validate = (el) => {
    const err = $(`#err-${el.name}`);
    const ok = el.checkValidity();
    el.setAttribute('aria-invalid', String(!ok));
    if (err) err.textContent = ok ? '' : message(el);
    return ok;
  };
  fields.forEach((el) => {
    el.addEventListener('blur', () => validate(el));
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    summary.hidden = true;
    const invalid = fields.filter((el) => !validate(el));
    if (invalid.length) {
      summary.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = f.summary;
      const ul = document.createElement('ul');
      invalid.forEach((el) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${el.id}`;
        a.textContent = $(`label[for="${el.id}"]`).textContent.replace('*', '').trim();
        a.addEventListener('click', (ev) => { ev.preventDefault(); el.focus(); });
        li.append(a);
        ul.append(li);
      });
      summary.append(p, ul);
      summary.hidden = false;
      invalid[0].focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    if (data.website) return;
    delete data.website;
    const endpoint = form.dataset.endpoint;
    if (endpoint) {
      status.textContent = f.sending;
      try {
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error(res.status);
        status.textContent = f.success;
        form.reset();
        fields.forEach((el) => el.removeAttribute('aria-invalid'));
      } catch {
        status.textContent = `${f.failure} ${form.dataset.email}`;
      }
    } else {
      const subject = encodeURIComponent(data.subject || data.name);
      const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
      location.href = `mailto:${form.dataset.email}?subject=${subject}&body=${body}`;
      status.textContent = f.success;
    }
  });
}

initTheme();
initMenu();
initActiveNav();
initAnchors();
initReveal();
initScroll();
initCopy();
initForm();
