# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Serve locally with live reload
bundle exec jekyll serve --livereload
# or via the helper script (also supports -p for production mode, -H for custom host)
bash tools/run.sh

# Build only
bundle exec jekyll build

# Build + run html-proofer (CI-style test)
bash tools/test.sh

# Lint SCSS
npm run lint:scss
npm run lint:fix:scss

# Build production JS/CSS bundles (Rollup + PurgeCSS)
npm run build
```

## Architecture

This is a **Jekyll static blog** using the [Chirpy theme](https://github.com/cotes2020/jekyll-theme-chirpy) (v7.2.2). The theme ships as a gem (`jekyll-theme-chirpy`), so most layout/include files are local overrides of the gem defaults.

### Key config
- `_config.yml` — site-wide settings. `lang: ko-KR` drives which locale file is used for UI strings.
- `_data/locales/` — YAML files keyed by lang code (`en.yml`, `ko-KR.yml`). All UI strings come from here via `site.data.locales[lang].*` in Liquid.
- `_data/origin/` — CDN/asset source definitions consumed by `_includes/js-selector.html` and `_includes/jsdelivr-combine.html`.

### Layout chain
```
_layouts/compress.html          ← outermost HTML wrapper (whitespace compression)
  └─ _layouts/default.html      ← sidebar + topbar + main + panel + footer
       ├─ _layouts/home.html     ← paginated post card list (#post-list)
       ├─ _layouts/post.html     ← individual post (article.px-1 > .content)
       └─ _layouts/page.html     ← static tabs (about, categories, tags, archives)
```

### JS pipeline
Theme JS lives in `_javascript/` and is bundled by Rollup (`rollup.config.js`) into `assets/js/dist/*.min.js`. There are per-layout bundles (`home.min.js`, `post.min.js`, `commons.min.js`, `misc.min.js`) selected at build time by `_includes/js-selector.html`.

**Do not edit `assets/js/dist/` directly** — those are compiled outputs.

### Custom EN/KO language toggle
`assets/js/lang-toggle.js` is a hand-written script (not part of the theme) included in every page via `_includes/head.html`. It provides:

- **UI translation** — elements marked `data-i18n="<key>"` (and optionally `data-i18n-upcase`) are swapped between `en.yml` and `ko-KR.yml` strings stored inline in the script.
- **Content auto-translation** — on clicking the EN button, the script walks the DOM via `getTextNodes()` (skipping `<code>`/`<pre>` subtrees), batches Korean-containing text nodes element by element, and calls the unofficial Google Translate endpoint (`translate.googleapis.com/translate_a/single?client=gtx`) with 6 concurrent workers. Results are cached in `sessionStorage` keyed by `xlate:<pathname>:en`. Restoring to KO replays saved `innerHTML` snapshots.
- **Persistence** — `localStorage` key `preferred-lang` (`ko` | `en`).

The toggle button (`#lang-toggle`) is rendered in `_includes/topbar.html`, next to the search bar. Sidebar nav labels carry `data-i18n` attributes in `_includes/sidebar.html`.

### SCSS structure
`_sass/` uses a forwarding pattern (`@forward` in `main.scss`). Custom additions go into the appropriate subdirectory (`layout/`, `components/`, etc.). The topbar toggle button style is in `_sass/layout/_topbar.scss`.

### Posts
- Filename: `YYYY-MM-DD-slug.md` under `_posts/`
- Required front matter: `title`, `date`, `categories` (array), `tags` (array)
- Optional: `pin: true`, `math: true`, `mermaid: true`, `description`
- Inline highlight conventions (used across posts):
  - Yellow `#fff5b1` = summary, Red `#FFE6E6` = important, Green `#DCFFE4` = personal question, Grey `#f0f0f0` = collapsible
- **All post content must be written in English.** This includes the `title` front matter field and all body text.

### Deployment
GitHub Pages via the `gh-pages` / `pages-deploy.yml` Actions workflow. `JEKYLL_ENV=production` enables PWA and analytics blocks.
