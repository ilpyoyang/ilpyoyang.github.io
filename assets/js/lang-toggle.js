(function () {
  var UI = {
    ko: {
      'tabs.home': '홈', 'tabs.categories': '카테고리', 'tabs.tags': '태그',
      'tabs.archives': '아카이브', 'tabs.about': '정보', 'tabs.study': '학습',
      'search.hint': '검색', 'search.cancel': '취소',
      'post.posted': '게시', 'post.pageview_measure': '조회',
      'post.read_time.unit': '분', 'post.read_time.prompt': '읽는 시간',
      'post.share': '공유하기',
      'post.button.previous': '이전 글', 'post.button.next': '다음 글',
      'copyright.brief': '일부 권리 보유',
      'panel.trending_tags': '인기 태그'
    },
    en: {
      'tabs.home': 'Home', 'tabs.categories': 'Categories', 'tabs.tags': 'Tags',
      'tabs.archives': 'Archives', 'tabs.about': 'About', 'tabs.study': 'Study',
      'search.hint': 'Search', 'search.cancel': 'Cancel',
      'post.posted': 'Posted', 'post.pageview_measure': 'views',
      'post.read_time.unit': 'min', 'post.read_time.prompt': 'read',
      'post.share': 'Share',
      'post.button.previous': 'Older', 'post.button.next': 'Newer',
      'copyright.brief': 'Some rights reserved.',
      'panel.trending_tags': 'Trending Tags'
    }
  };

  var KO_RE = /[가-힯ᄀ-ᇿ㄰-㆏]/;
  var EN_RE = /[a-zA-Z]{3,}/;

  // ── UI label swap ────────────────────────────────────────────────────────────
  function applyUILang(lang) {
    var t = UI[lang];
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!t[key]) return;
      if (el.tagName === 'INPUT') {
        el.placeholder = t[key] + '...';
      } else if (el.hasAttribute('data-i18n-upcase')) {
        el.textContent = t[key].toUpperCase();
      } else {
        el.textContent = t[key];
      }
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-aria');
      if (t[key]) el.setAttribute('aria-label', t[key]);
    });
    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = lang === 'ko' ? 'EN' : 'KO';
    document.documentElement.lang = lang === 'ko' ? 'ko-KR' : 'en';
  }

  // ── Text-node helpers ────────────────────────────────────────────────────────

  // Collect direct+deep text nodes in `el`, skipping code/pre subtrees.
  function getTextNodes(el) {
    var nodes = [];
    (function walk(node) {
      if (node.nodeType === 3 /* TEXT_NODE */) {
        if (node.textContent.trim()) nodes.push(node);
      } else if (node.nodeType === 1 /* ELEMENT_NODE */) {
        var tag = node.tagName;
        if (tag === 'CODE' || tag === 'PRE' || tag === 'SCRIPT' || tag === 'STYLE') return;
        node.childNodes.forEach(walk);
      }
    })(el);
    return nodes;
  }

  // ── Translation API ──────────────────────────────────────────────────────────

  function gtranslate(text, sl, tl) {
    var url = 'https://translate.googleapis.com/translate_a/single' +
      '?client=gtx&sl=' + sl + '&tl=' + tl + '&dt=t&q=' + encodeURIComponent(text);
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) { return d[0].map(function (x) { return x[0]; }).join(''); });
  }

  // Translate one element between sl and tl, joining text nodes with 【N】 markers.
  function translateElement(el, sl, tl) {
    var nodes = getTextNodes(el);
    if (!nodes.length) return Promise.resolve(null);

    var srcRe = sl === 'ko' ? KO_RE : EN_RE;
    var origTexts = nodes.map(function (n) { return n.textContent; });
    if (!origTexts.some(function (t) { return srcRe.test(t); })) return Promise.resolve(null);

    if (nodes.length === 1) {
      return gtranslate(origTexts[0], sl, tl).then(function (t) {
        if (t) nodes[0].textContent = t;
        return origTexts;
      });
    }

    var joined = origTexts.map(function (t, i) {
      return t + (i < origTexts.length - 1 ? '【' + i + '】' : '');
    }).join('');

    return gtranslate(joined, sl, tl).then(function (translated) {
      var parts = translated.split(/【\d+】/);
      nodes.forEach(function (n, i) {
        n.textContent = (parts[i] != null ? parts[i] : origTexts[i]);
      });
      return origTexts;
    });
  }

  // ── Block collection ─────────────────────────────────────────────────────────

  var SKIP_ZONES = ['#sidebar', '#topbar-wrapper', 'footer', 'pre',
    '.post-meta',
    '#search-result-wrapper'];

  function collectBlocks(srcLang) {
    var srcRe = srcLang === 'ko' ? KO_RE : EN_RE;
    var sel = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,td,th,.card-title,a.post-tag,a.tag,#breadcrumb span,.categories .text-muted,.license-wrapper';
    var seen = [];
    var blocks = [];

    document.querySelectorAll(sel).forEach(function (el) {
      if (seen.indexOf(el) !== -1) return;
      seen.push(el);

      for (var i = 0; i < SKIP_ZONES.length; i++) {
        if (el.closest(SKIP_ZONES[i])) return;
      }
      if (el.getAttribute('data-i18n') || el.closest('[data-i18n]')) return;
      if (el.closest('code') || el.closest('pre')) return;

      // Check whether text nodes (NOT element children) contain source-language text.
      // This correctly handles <p>Text <code>snippet</code> more text</p>.
      var nodes = getTextNodes(el);
      var hasSrc = nodes.some(function (n) { return srcRe.test(n.textContent); });
      if (!hasSrc) return;

      blocks.push(el);
    });
    return blocks;
  }

  // ── Page-level translate / restore ───────────────────────────────────────────

  var _savedHtml = null; // [{el, html}] — snapshot of content before translation

  function setLoading(on) {
    var id = 'xlate-spinner';
    if (on && !document.getElementById(id)) {
      var el = document.createElement('div');
      el.id = id;
      el.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>' +
        '<span style="margin-left:6px">Translating…</span>';
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;' +
        'display:flex;align-items:center;justify-content:center;' +
        'padding:6px 12px;font-size:0.82rem;' +
        'color:var(--text-muted-color,#888);' +
        'background:var(--topbar-bg,rgba(255,255,255,0.95));' +
        'border-bottom:1px solid var(--border-color,#e5e5e5);';
      document.body.prepend(el);
    } else if (!on) {
      var existing = document.getElementById(id);
      if (existing) existing.remove();
    }
  }

  // Core translation runner — finds blocks in `sl`, saves current HTML, translates to `tl`.
  function runTranslation(sl, tl) {
    var cacheKey = 'xlate:v2:' + window.location.pathname + ':' + tl;
    var blocks = collectBlocks(sl);
    if (!blocks.length) return Promise.resolve();

    // Snapshot original HTML for restore (once per direction — not overwritten if already set)
    if (!_savedHtml) {
      _savedHtml = blocks.map(function (el) { return { el: el, html: el.innerHTML }; });
    }

    // Apply from sessionStorage cache if available
    try {
      var raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        var cached = JSON.parse(raw);
        blocks.forEach(function (el, i) { if (cached[i]) el.innerHTML = cached[i]; });
        return Promise.resolve();
      }
    } catch (e) {}

    setLoading(true);

    var CONC = 6;
    var pending = blocks.slice();

    function worker() {
      if (!pending.length) return Promise.resolve();
      var el = pending.shift();
      return translateElement(el, sl, tl).then(function () {
        return worker();
      }).catch(function () {
        return worker();
      });
    }

    var workers = [];
    for (var w = 0; w < Math.min(CONC, blocks.length); w++) {
      workers.push(worker());
    }

    return Promise.all(workers)
      .then(function () {
        var snapshot = blocks.map(function (el) { return el.innerHTML; });
        try { sessionStorage.setItem(cacheKey, JSON.stringify(snapshot)); } catch (e) {}
      })
      .catch(function (err) { console.warn('[lang-toggle]', err); })
      .finally(function () { setLoading(false); });
  }

  function translatePage(lang) {
    if (lang === 'ko') {
      if (_savedHtml) {
        // Restore pre-translation snapshot (works for both KO→EN and EN→KO paths)
        _savedHtml.forEach(function (o) { o.el.innerHTML = o.html; });
        _savedHtml = null;
        return Promise.resolve();
      }
      // No snapshot yet. If content is Korean, it's already in KO — nothing to do.
      if (collectBlocks('ko').length) return Promise.resolve();
      // Content is English — translate EN→KO.
      return runTranslation('en', 'ko');
    }

    // lang === 'en'
    if (_savedHtml) {
      // Restore pre-translation snapshot (e.g. EN content saved before EN→KO translation)
      _savedHtml.forEach(function (o) { o.el.innerHTML = o.html; });
      _savedHtml = null;
      return Promise.resolve();
    }
    // No snapshot — translate KO→EN if content has Korean.
    return runTranslation('ko', 'en');
  }

  // ── TOC translation — handles tocbot's dynamic population ───────────────────

  var _tocSaved = null; // [{el, text}] — original text for restore

  function translateTOCLinks(tl) {
    var links = document.querySelectorAll('#toc a, #toc-popup-content a');
    if (!links.length) return;
    if (!_tocSaved) {
      _tocSaved = Array.prototype.map.call(links, function (l) {
        return { el: l, text: l.textContent };
      });
    }
    var sl = tl === 'en' ? 'ko' : 'en';
    var srcRe = sl === 'ko' ? KO_RE : EN_RE;
    links.forEach(function (link) {
      if (srcRe.test(link.textContent)) translateElement(link, sl, tl);
    });
  }

  function restoreTOCLinks() {
    if (!_tocSaved) return;
    _tocSaved.forEach(function (o) { o.el.textContent = o.text; });
  }

  function watchTOC(lang) {
    if (lang === 'ko') {
      restoreTOCLinks();
      // For English-content pages: translate TOC links EN→KO as well
      var links = document.querySelectorAll('#toc a, #toc-popup-content a');
      links.forEach(function (link) {
        if (EN_RE.test(link.textContent) && !KO_RE.test(link.textContent)) {
          translateElement(link, 'en', 'ko');
        }
      });
      return;
    }

    // Translate any links already present (tocbot may have run first)
    translateTOCLinks('en');

    // Watch all #toc / #toc-popup-content navs for dynamic population
    document.querySelectorAll('#toc, #toc-popup-content').forEach(function (nav) {
      var observer = new MutationObserver(function (mutations, obs) {
        if (!nav.querySelectorAll('a').length) return;
        obs.disconnect();
        translateTOCLinks('en');
      });
      observer.observe(nav, { childList: true, subtree: true });
    });
  }

  // ── Persistence ──────────────────────────────────────────────────────────────

  function getLang() {
    try { return localStorage.getItem('preferred-lang') || 'en'; } catch (e) { return 'en'; }
  }

  function applyLang(lang) {
    applyUILang(lang);
    try { localStorage.setItem('preferred-lang', lang); } catch (e) {}
    translatePage(lang);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    var lang = getLang();
    applyUILang(lang);
    if (lang === 'en') {
      translatePage('en');
      watchTOC('en');
    }

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        var next = getLang() === 'ko' ? 'en' : 'ko';
        applyLang(next);
        watchTOC(next);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
