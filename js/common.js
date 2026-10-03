/* ============================================================
   NeuraSec — shared data index, helpers and page chrome.
   Builds the member ↔ publication links from data/*.js.
   ============================================================ */
(function () {
  'use strict';

  const NS = (window.NS = {});
  const MEMBERS = window.NEURASEC_MEMBERS || [];
  const PUBS = window.NEURASEC_PUBLICATIONS || [];
  const GROUPS = window.NEURASEC_GROUPS || [];

  /* ── Small helpers ── */
  NS.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const normName = (s) => String(s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/^(dr|prof)\.?\s+/, '')
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  NS.storage = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } }
  };

  /* ── Labels ── */
  NS.STATUS = {
    published: { label: 'Published', cls: 'st-published' },
    accepted:  { label: 'Accepted · In Press', cls: 'st-accepted' },
    review:    { label: 'Under Review', cls: 'st-review' },
    submitted: { label: 'Submitted', cls: 'st-submitted', short: 'SUB' },
    progress:  { label: 'In Progress', cls: 'st-progress', short: 'IP' }
  };
  NS.TYPE = {
    journal:    { label: 'Journal', prefix: 'J' },
    conference: { label: 'Conference', prefix: 'C' },
    chapter:    { label: 'Book Chapter', prefix: 'B' }
  };
  const STATUS_RANK = { published: 0, accepted: 1, review: 2, submitted: 3, progress: 4 };
  NS.STATUS.review.short = 'UR';

  /* ── Member index ── */
  const byId = new Map();
  const byName = new Map();
  MEMBERS.forEach((m, i) => {
    m._order = i;
    m.links = m.links || {};
    m.expertise = m.expertise || [];
    m.tags = m.tags || [];
    m.pubs = [];
    m.led = [];
    byId.set(m.id, m);
    [m.name].concat(m.aliases || []).forEach((n) => byName.set(normName(n), m));
  });

  NS.members = MEMBERS;
  NS.groups = GROUPS;
  NS.member = (id) => byId.get(id) || null;
  NS.findMember = (name) => byName.get(normName(name)) || null;
  NS.displayName = (m) => (m.prefix ? m.prefix + ' ' : '') + m.name;
  NS.isActive = (m) => m.group !== 'former';
  NS.profileUrl = (m, pubId) => 'member.html?id=' + encodeURIComponent(m.id) + (pubId ? '#pub-' + pubId : '');

  NS.initials = (m) => {
    const parts = m.name.normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(Boolean);
    return ((parts[0] || '')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  };
  const hue = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360; return h; };

  /* ── Publication index + global numbering (J1, C1 … oldest first) ── */
  PUBS.forEach((p, i) => {
    p._order = i;
    p.keywords = p.keywords || [];
    p.authorMembers = p.authors.map(NS.findMember);
    p.leadMember = p.lead ? NS.findMember(p.lead) : null;
    p.numbered = (p.status === 'published' || p.status === 'accepted') && !!NS.TYPE[p.type];
  });

  const counters = {};
  PUBS.filter((p) => p.numbered)
    .sort((a, b) => a.year - b.year || STATUS_RANK[a.status] - STATUS_RANK[b.status] || b._order - a._order)
    .forEach((p) => {
      const pre = NS.TYPE[p.type].prefix;
      counters[pre] = (counters[pre] || 0) + 1;
      p.code = pre + counters[pre];
      p._seq = counters[pre];
    });

  // Newest first: year, then status, then code number descending.
  NS.sortPubs = (list) => list.slice().sort((a, b) =>
    b.year - a.year ||
    STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
    (b._seq || 0) - (a._seq || 0) ||
    a._order - b._order);

  NS.publications = NS.sortPubs(PUBS);
  NS.publication = (id) => PUBS.find((p) => p.id === id) || null;

  PUBS.forEach((p) => {
    const seen = new Set();
    p.authorMembers.forEach((m) => { if (m && !seen.has(m.id)) { seen.add(m.id); m.pubs.push(p); } });
    if (p.leadMember && !seen.has(p.leadMember.id)) p.leadMember.led.push(p);
  });
  MEMBERS.forEach((m) => { m.pubs = NS.sortPubs(m.pubs); m.led = NS.sortPubs(m.led); });

  /** Contribution score: published/accepted papers count 2, under review/submitted 1. */
  NS.contributionScore = (m) => m.pubs.reduce((n, p) => n + (p.numbered ? 2 : 1), 0);

  // Order members by group; groups flagged sortByContribution put the biggest
  // contributors first (ties: more peer-reviewed papers, then data-file order).
  const groupIdx = new Map(GROUPS.map((g, i) => [g.id, i]));
  const sortedGroups = new Set(GROUPS.filter((g) => g.sortByContribution).map((g) => g.id));
  const peer = (m) => m.pubs.filter((p) => p.numbered).length;
  MEMBERS.sort((a, b) =>
    (groupIdx.get(a.group) ?? 99) - (groupIdx.get(b.group) ?? 99) ||
    (sortedGroups.has(a.group) ? NS.contributionScore(b) - NS.contributionScore(a) || peer(b) - peer(a) : 0) ||
    a._order - b._order);
  MEMBERS.forEach((m, i) => { m._order = i; });

  /** Numbered papers of a member split by type, oldest first (J1, J4, …). */
  NS.contributions = (m) => {
    const out = { journal: [], conference: [], chapter: [], ongoing: [] };
    m.pubs.forEach((p) => {
      if (p.numbered) out[p.type].push(p);
      else out.ongoing.push(p);
    });
    out.journal.sort((a, b) => a._seq - b._seq);
    out.conference.sort((a, b) => a._seq - b._seq);
    out.chapter.sort((a, b) => a._seq - b._seq);
    return out;
  };

  /** Members (other than m) who co-authored with m, most shared papers first. */
  NS.collaborators = (m) => {
    const tally = new Map();
    m.pubs.concat(m.led).forEach((p) => {
      p.authorMembers.concat([p.leadMember]).forEach((o) => {
        if (o && o.id !== m.id) tally.set(o.id, (tally.get(o.id) || 0) + 1);
      });
    });
    return [...tally.entries()]
      .sort((a, b) => b[1] - a[1] || byId.get(a[0])._order - byId.get(b[0])._order)
      .map(([id, n]) => ({ member: byId.get(id), count: n }));
  };

  /* ── Icons (inline SVG, inherit currentColor) ── */
  const svg = (d, vb) => '<svg viewBox="' + (vb || '0 0 24 24') + '" aria-hidden="true" focusable="false">' + d + '</svg>';
  NS.icon = {
    linkedin: svg('<path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1v5.45h-4v-4.83c0-1.15-.02-2.64-1.6-2.64-1.62 0-1.86 1.26-1.86 2.56v4.91h-4z"/>'),
    scholar: svg('<path fill="currentColor" d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3zm-6.5 9.6v3.9L12 20l6.5-3.5v-3.9L12 16.1l-6.5-3.5z"/>'),
    globe: svg('<g fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.9 3.8 5.9 3.8 9s-1.2 6.1-3.8 9c-2.6-2.9-3.8-5.9-3.8-9S9.4 5.9 12 3z"/></g>'),
    mail: svg('<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/></g>'),
    external: svg('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></g>'),
    doc: svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></g>'),
    search: svg('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></g>'),
    sun: svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></g>'),
    moon: svg('<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    arrowUp: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7"/>'),
    arrowRight: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6"/>'),
    arrowLeft: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 12H5M11 6l-6 6 6 6"/>'),
    menu: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/>'),
    pin: svg('<g fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></g>'),
    grid: svg('<g fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></g>'),
    list: svg('<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>'),
    shield: svg('<path fill="currentColor" d="M12 2 4 6v6c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6l-8-4zm-1 13-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>')
  };

  /* ── Reusable HTML fragments ── */
  NS.avatar = (m, size) => {
    const cls = 'avatar' + (size ? ' avatar--' + size : '') + (m.group === 'former' ? ' avatar--muted' : '');
    const img = m.photo
      ? '<img src="images/members/' + NS.esc(m.photo) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">'
      : '';
    return '<span class="' + cls + '" style="--h:' + hue(m.id) + '" aria-hidden="true"><span>' +
      NS.esc(NS.initials(m)) + '</span>' + img + '</span>';
  };

  /** Country label with a flag image (Windows can't draw flag emoji, so the
      emoji in the data is turned into its ISO code and loaded from flagcdn). */
  NS.country = (m) => {
    const cps = [...(m.flag || '')].map((ch) => ch.codePointAt(0) - 0x1F1E6);
    const iso = cps.length === 2 && cps.every((n) => n >= 0 && n < 26)
      ? String.fromCharCode(97 + cps[0], 97 + cps[1]) : '';
    return (iso ? '<img class="flag" src="https://flagcdn.com/w40/' + iso + '.png" alt="" width="20" height="15" loading="lazy">' : '') +
      NS.esc(m.country);
  };

  NS.socialLinks = (m, opts) => {
    opts = opts || {};
    const name = NS.esc(NS.displayName(m));
    const out = [];
    if (m.links.linkedin) out.push(['linkedin', m.links.linkedin, 'LinkedIn']);
    if (m.links.scholar) out.push(['scholar', m.links.scholar, 'Google Scholar']);
    if (m.links.website) out.push(['globe', m.links.website, 'Website']);
    if (opts.email && m.email) out.push(['mail', 'mailto:' + m.email, 'Email']);
    return out.map(([ic, href, label]) =>
      '<a class="icon-btn" href="' + NS.esc(href) + '"' + (ic === 'mail' ? '' : ' target="_blank" rel="noopener"') +
      ' title="' + label + '" aria-label="' + name + ' — ' + label + '">' + NS.icon[ic] + '</a>').join('');
  };

  /** Author list with members linked; `self` (a member id) is highlighted. */
  NS.authorsHTML = (p, self) => p.authors.map((a, i) => {
    const m = p.authorMembers[i];
    if (!m) return '<span class="author">' + NS.esc(a) + '</span>';
    const me = m.id === self;
    return '<a class="author author--member' + (me ? ' author--self' : '') + '" href="' + NS.profileUrl(m) + '"' +
      ' title="' + NS.esc(NS.displayName(m) + ' — ' + m.role) + '">' + NS.esc(a) + '</a>';
  }).join('<span class="sep">, </span>');

  NS.codeChip = (p, href) => '<a class="code code--' + p.type + '" href="' + href + '" title="' + NS.esc(p.title + ' (' + p.year + ')') + '">' + p.code + '</a>';

  NS.pubHTML = (p, opts) => {
    opts = opts || {};
    const st = NS.STATUS[p.status];
    const type = NS.TYPE[p.type];
    const left = p.code
      ? '<span class="pub__code code--' + p.type + '">' + p.code + '</span>'
      : '<span class="pub__code pub__code--none" title="' + st.label + '">' + (st.short || '—') + '</span>';
    const venue = [p.venue, p.details].filter(Boolean).map(NS.esc).join(' · ');
    const lead = p.lead
      ? '<span class="pub__lead">Lead: ' + (p.leadMember
        ? '<a href="' + NS.profileUrl(p.leadMember) + '">' + NS.esc(NS.displayName(p.leadMember)) + '</a>'
        : NS.esc(p.lead)) + '</span>'
      : '';
    const actions = [];
    if (p.doi) actions.push('<a class="pub__link" href="https://doi.org/' + NS.esc(p.doi) + '" target="_blank" rel="noopener">' + NS.icon.external + 'DOI</a>');
    else if (p.url) actions.push('<a class="pub__link" href="' + NS.esc(p.url) + '" target="_blank" rel="noopener">' + NS.icon.external + 'Publisher</a>');
    if (p.doi && p.url) actions.push('<a class="pub__link" href="' + NS.esc(p.url) + '" target="_blank" rel="noopener">' + NS.icon.external + 'Publisher</a>');
    if (p.pdf) actions.push('<a class="pub__link" href="' + NS.esc(p.pdf) + '" target="_blank" rel="noopener">' + NS.icon.doc + 'Full text</a>');
    if (p.abstract) actions.push('<button class="pub__link pub__abs-btn" type="button" aria-expanded="false">Abstract</button>');

    return '<article class="pub" id="pub-' + NS.esc(p.id) + '" data-status="' + p.status + '" data-type="' + p.type + '">' +
      left +
      '<div class="pub__body">' +
        '<h3 class="pub__title">' + NS.esc(p.title) + '</h3>' +
        '<p class="pub__authors">' + NS.authorsHTML(p, opts.self) + '</p>' +
        (venue ? '<p class="pub__venue">' + venue + (opts.showYear && !/\b(19|20)\d{2}\b/.test(venue) ? ' · ' + p.year : '') + '</p>' : '') +
        '<div class="pub__meta">' +
          '<span class="pill ' + st.cls + '">' + st.label + '</span>' +
          (type && p.numbered ? '<span class="pill pill--plain">' + type.label + '</span>' : '') +
          (p.metrics ? '<span class="pill pill--metric">' + NS.esc(p.metrics) + '</span>' : '') +
          lead +
          (actions.length ? '<span class="pub__actions">' + actions.join('') + '</span>' : '') +
        '</div>' +
        (p.abstract ? '<div class="pub__abstract" hidden><p>' + NS.esc(p.abstract) + '</p></div>' : '') +
        (p.keywords.length ? '<div class="kws">' + p.keywords.map((k) => '<span class="kw">' + NS.esc(k) + '</span>').join('') + '</div>' : '') +
      '</div>' +
    '</article>';
  };

  // One delegated handler for every abstract toggle on the page.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pub__abs-btn');
    if (!btn) return;
    const abs = btn.closest('.pub').querySelector('.pub__abstract');
    const open = abs.hidden;
    abs.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('is-open', open);
  });

  /* ── Page chrome: header, footer, theme, back-to-top ── */
  // [page id (body data-page), file, label]
  const NAV = [
    ['research', 'research.html', 'Research'],
    ['publications', 'publications.html', 'Publications'],
    ['people', 'people.html', 'People'],
    ['network', 'network.html', 'Global Reach'],
    ['news', 'news.html', 'News'],
    ['join', 'join.html', 'Join Us'],
    ['contact', 'contact.html', 'Contact']
  ];

  NS.renderChrome = () => {
    const page = document.body.dataset.page || '';
    const header = document.getElementById('site-header');
    if (header) {
      header.innerHTML =
        '<nav class="nav" aria-label="Main navigation"><div class="nav__inner">' +
          '<a class="brand" href="index.html" aria-label="NeuraSec home">' +
            '<span class="brand__logo"><img src="images/logo.png" alt="" width="34" height="34"></span>' +
            '<span class="brand__text"><span class="brand__name">NeuraSec</span><span class="brand__sub">Research Group</span></span>' +
          '</a>' +
          '<ul class="nav__links" id="navLinks">' +
            NAV.map(([id, href, label]) => '<li><a href="' + href + '"' +
              (id === page ? ' class="active" aria-current="page"' : '') + '>' + label + '</a></li>').join('') +
          '</ul>' +
          '<div class="nav__actions">' +
            '<button class="icon-btn icon-btn--ghost" id="themeToggle" type="button" aria-label="Toggle dark mode"></button>' +
            '<button class="icon-btn icon-btn--ghost nav__toggle" id="navToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">' + NS.icon.menu + '</button>' +
          '</div>' +
        '</div></nav>';

      const toggle = document.getElementById('navToggle');
      const links = document.getElementById('navLinks');
      toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      links.addEventListener('click', (e) => {
        if (e.target.closest('a')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
      });
    }

    const footer = document.getElementById('site-footer');
    if (footer) {
      footer.innerHTML =
        '<div class="container footer__inner">' +
          '<div class="footer__brand"><span class="brand__logo"><img src="images/logo.png" alt="" width="34" height="34"></span>' +
            '<div><strong>NeuraSec Research Group</strong><span>Advancing AI Security and Intelligent Systems</span></div></div>' +
          '<nav class="footer__nav" aria-label="Site map">' +
            '<a href="index.html">Home</a>' +
            NAV.map(([, href, label]) => '<a href="' + href + '">' + label + '</a>').join('') +
          '</nav>' +
          '<div class="footer__links">' +
            '<a href="mailto:neurasec1@gmail.com">' + NS.icon.mail + 'neurasec1@gmail.com</a>' +
            '<a href="https://www.linkedin.com/company/neurasec-research-group/" target="_blank" rel="noopener">' + NS.icon.linkedin + 'LinkedIn</a>' +
          '</div>' +
          '<p class="footer__copy">© 2024–' + new Date().getFullYear() + ' NeuraSec Research Group</p>' +
        '</div>';
    }

    // Theme
    const themeBtn = document.getElementById('themeToggle');
    const root = document.documentElement;
    const isDark = () => root.dataset.theme
      ? root.dataset.theme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    const paintThemeBtn = () => {
      if (!themeBtn) return;
      themeBtn.innerHTML = isDark() ? NS.icon.sun : NS.icon.moon;
      themeBtn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
    };
    paintThemeBtn();
    if (themeBtn) themeBtn.addEventListener('click', () => {
      const next = isDark() ? 'light' : 'dark';
      root.dataset.theme = next;
      NS.storage.set('neurasec-theme', next);
      paintThemeBtn();
      document.dispatchEvent(new CustomEvent('ns:theme', { detail: next }));
    });

    // Back to top
    const top = document.createElement('button');
    top.className = 'to-top';
    top.type = 'button';
    top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = NS.icon.arrowUp;
    document.body.appendChild(top);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const onScroll = () => {
      top.classList.toggle('visible', window.scrollY > 500);
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.toggle('nav--scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  };

  /** Reveal-on-scroll for elements with .reveal */
  NS.reveal = (root) => {
    const els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  };
})();
