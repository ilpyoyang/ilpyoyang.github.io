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
      'copyright.brief': '일부 권리 보유'
    },
    en: {
      'tabs.home': 'Home', 'tabs.categories': 'Categories', 'tabs.tags': 'Tags',
      'tabs.archives': 'Archives', 'tabs.about': 'About', 'tabs.study': 'Study',
      'search.hint': 'Search', 'search.cancel': 'Cancel',
      'post.posted': 'Posted', 'post.pageview_measure': 'views',
      'post.read_time.unit': 'min', 'post.read_time.prompt': 'read',
      'post.share': 'Share',
      'post.button.previous': 'Older', 'post.button.next': 'Newer',
      'copyright.brief': 'Some rights reserved.'
    }
  };

  var KO_RE = /[가-힯ᄀ-ᇿ㄰-㆏]/;

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

  function gtranslate(text) {
    var url = 'https://translate.googleapis.com/translate_a/single' +
      '?client=gtx&sl=ko&tl=en&dt=t&q=' + encodeURIComponent(text);
    return fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (d) { return d[0].map(function (x) { return x[0]; }).join(''); });
  }

  // Translate one element: join its text nodes with 【N】 markers,
  // translate as one string, then split back — preserving inline tags (code, strong, a…).
  function translateElement(el) {
    var nodes = getTextNodes(el);
    if (!nodes.length) return Promise.resolve(null);

    var origTexts = nodes.map(function (n) { return n.textContent; });
    if (!origTexts.some(function (t) { return KO_RE.test(t); })) return Promise.resolve(null);

    // Single text node — simple case
    if (nodes.length === 1) {
      return gtranslate(origTexts[0]).then(function (t) {
        if (t) nodes[0].textContent = t;
        return origTexts;
      });
    }

    // Multiple text nodes: join with markers so they translate as one sentence
    var joined = origTexts.map(function (t, i) {
      return t + (i < origTexts.length - 1 ? '【' + i + '】' : '');
    }).join('');

    return gtranslate(joined).then(function (translated) {
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

  function collectBlocks() {
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

      // KEY FIX: check whether text nodes (NOT element children) contain Korean.
      // This correctly handles <p>Korean <code>snippet</code> more Korean</p>
      // where children.length===1 but there IS Korean text outside the code span.
      var nodes = getTextNodes(el);
      var hasKo = nodes.some(function (n) { return KO_RE.test(n.textContent); });
      if (!hasKo) return;

      blocks.push(el);
    });
    return blocks;
  }

  // ── Page-level translate / restore ───────────────────────────────────────────

  var _savedHtml = null; // [{ el, html }]

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

  function translatePage(lang) {
    if (lang === 'ko') {
      if (_savedHtml) {
        _savedHtml.forEach(function (o) { o.el.innerHTML = o.html; });
      }
      return Promise.resolve();
    }

    var cacheKey = 'xlate:v2:' + window.location.pathname + ':en';
    var blocks = collectBlocks();
    if (!blocks.length) return Promise.resolve();

    // Snapshot original HTML for KO restore (once per page load)
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

    // Translate all blocks in parallel (6 concurrent workers)
    var CONC = 6;
    var pending = blocks.slice();
    var done = 0;

    function worker() {
      if (!pending.length) return Promise.resolve();
      var el = pending.shift();
      return translateElement(el).then(function () {
        done++;
        return worker();
      }).catch(function () {
        done++;
        return worker();
      });
    }

    var workers = [];
    for (var w = 0; w < Math.min(CONC, blocks.length); w++) {
      workers.push(worker());
    }

    return Promise.all(workers)
      .then(function () {
        // Cache translated innerHTML
        var snapshot = blocks.map(function (el) { return el.innerHTML; });
        try { sessionStorage.setItem(cacheKey, JSON.stringify(snapshot)); } catch (e) {}
      })
      .catch(function (err) { console.warn('[lang-toggle]', err); })
      .finally(function () { setLoading(false); });
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
    if (lang === 'en') translatePage('en');

    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        applyLang(getLang() === 'ko' ? 'en' : 'ko');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
