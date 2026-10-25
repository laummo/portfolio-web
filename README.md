# CV web — Laura Moreno

Página única, generada desde JSON con un script Node **sin dependencias**. HTML semántico, CSS moderno y JS vanilla (≈3 KB gzip) como mejora progresiva.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run build` | Valida `content/*.json` y genera `dist/` |
| `npm run dev` | Build + servidor estático en http://localhost:5173 |
| `npm run pdf` | Genera `src/img/cv.pdf` y `og-image.png` con Chrome/Edge headless (`CHROME_PATH` opcional); luego ejecuta `npm run build` para incluirlos |
| `npm run check` | Presupuesto de peso, h1 único, anclas e imágenes |

## Editar contenido

- Datos del CV: `content/es.json` (separados de la presentación). Fechas `YYYY-MM`; cada logro debe llevar una cifra (el build lo valida).
- Literales de interfaz y errores del formulario: `content/ui.es.json`.
- Cambia `meta.url` por tu dominio real: todas las URLs absolutas (canonical, OG, JSON-LD, sitemap) salen de ahí.

## Añadir inglés (i18n)

Crea `content/en.json` y `content/ui.en.json` con la misma estructura. El build genera `dist/en/index.html`, los `hreflang` y el sitemap con alternates.

## Formulario de contacto

Por defecto usa validación nativa + JS accesible y abre `mailto:`. Para enviar a un servicio (Formspree, etc.) pon su URL en `contactForm.endpoint` de `es.json`; se enviará por `fetch` (JSON) con alternativa `action` sin JS.

## Notas

- Imágenes: avatar y mockups de proyectos son SVG ilustrativos generados en `build.mjs`. Sustitúyelos por fotos reales (AVIF/WebP + `srcset`) cuando existan.
- Fuentes: Fraunces e Inter variables, autoalojadas en `src/fonts` (subset latin, de `@fontsource-variable`, licencia OFL).
- Caché recomendada: `assets/*` con hash → `Cache-Control: public, max-age=31536000, immutable`; HTML → `no-cache`.
- Estructura: `templates/` (plantillas con escape HTML por defecto), `src/css`, `src/js`, `scripts/`.
