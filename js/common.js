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
  // The build adds <meta name="ns-static"> and generates people/<id>.html; opened locally those files don't exist.
  NS.staticProfiles = !!document.querySelector('meta[name="ns-static"]');
  NS.profileUrl = (m, pubId) => (NS.staticProfiles
    ? 'people/' + encodeURIComponent(m.id) + '.html'
    : 'member.html?id=' + encodeURIComponent(m.id)) + (pubId ? '#pub-' + pubId : '');

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

  // DOIs that Crossref does not know (yet) are listed in data/doi-status.js by the build.
  // Their links would say "DOI not found", so they are not shown until the DOI is registered.
  const unregisteredDois = new Set(((window.NEURASEC_DOI_STATUS || {}).unregistered) || []);
  NS.doiLive = (p) => !!p.doi && !unregisteredDois.has(p.doi);

  // Set showEmails: false in NEURASEC_SETTINGS (data/site.js) to hide every personal email address.
  NS.showEmails = (window.NEURASEC_SETTINGS || {}).showEmails !== false;

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
    orcid: svg('<circle cx="12" cy="12" r="10" fill="currentColor"/><g fill="#fff"><circle cx="8.35" cy="7.4" r="1.05"/><rect x="7.4" y="9.5" width="1.9" height="7.6" rx=".3"/><path fill-rule="evenodd" d="M11.2 9.5h3.1c2.7 0 4.1 1.75 4.1 3.8S17 17.1 14.3 17.1h-3.1zm1.85 1.65v4.3h1.15c1.55 0 2.3-.95 2.3-2.15s-.75-2.15-2.3-2.15z"/></g>'),
    cite: svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 7H7a3 3 0 0 0-3 3v3a2 2 0 0 0 2 2h4v-5.5M20 7h-3a3 3 0 0 0-3 3v3a2 2 0 0 0 2 2h4v-5.5"/></g>'),
    check: svg('<path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4.5 4.5L19 7.5"/>'),
    close: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6 6 18"/>'),
    corner: svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M19 6v6a2 2 0 0 1-2 2H6m0 0 4-4m-4 4 4 4"/>'),
    page: svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5" stroke-linecap="round"/></g>'),
    code: svg('<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></g>'),
    data: svg('<g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/></g>'),
    shield: svg('<path fill="currentColor" d="M12 2 4 6v6c0 5.25 3.4 10.15 8 11.5 4.6-1.35 8-6.25 8-11.5V6l-8-4zm-1 13-3-3 1.41-1.41L11 12.17l4.59-4.58L17 9l-6 6z"/>')
  };

  /* ── Reusable HTML fragments ── */
  // Image fallbacks without inline handlers (so a strict Content-Security-Policy can be used):
  //   data-hide  -> remove a broken image;  data-fb="TEXT" -> replace a broken image with TEXT.
  document.addEventListener('error', (e) => {
    const t = e.target;
    if (!t || t.tagName !== 'IMG') return;
    if (t.hasAttribute('data-fb')) t.replaceWith(document.createTextNode(t.getAttribute('data-fb')));
    else if (t.hasAttribute('data-hide')) t.remove();
  }, true);

  NS.avatar = (m, size) => {
    const cls = 'avatar' + (size ? ' avatar--' + size : '') + (m.group === 'former' ? ' avatar--muted' : '');
    const img = m.photo
      ? '<img src="images/members/' + NS.esc(m.photo) + '" alt="" loading="lazy" decoding="async" data-hide>'
      : '';
    return '<span class="' + cls + '" style="--h:' + hue(m.id) + '" aria-hidden="true"><span>' +
      NS.esc(NS.initials(m)) + '</span>' + img + '</span>';
  };

  /** Country label with a flag image (Windows can't draw flag emoji, so the emoji in the
      data is turned into its ISO code and loaded from images/flags/; see tools/fetch_flags.py). */
  NS.country = (m) => {
    const cps = [...(m.flag || '')].map((ch) => ch.codePointAt(0) - 0x1F1E6);
    const iso = cps.length === 2 && cps.every((n) => n >= 0 && n < 26)
      ? String.fromCharCode(97 + cps[0], 97 + cps[1]) : '';
    return (iso ? '<img class="flag" src="images/flags/' + iso + '.png" alt="" width="20" height="15" loading="lazy" data-hide>' : '') +
      NS.esc(m.country);
  };

  NS.socialLinks = (m, opts) => {
    opts = opts || {};
    const name = NS.esc(NS.displayName(m));
    const out = [];
    if (m.links.linkedin) out.push(['linkedin', m.links.linkedin, 'LinkedIn']);
    if (m.links.scholar) out.push(['scholar', m.links.scholar, 'Google Scholar']);
    if (m.orcid) out.push(['orcid', 'https://orcid.org/' + m.orcid, 'ORCID iD ' + m.orcid]);
    if (m.links.website) out.push(['globe', m.links.website, 'Website']);
    if (opts.email && m.email) out.push(['mail', 'mailto:' + m.email, 'Email']);
    return out.map(([ic, href, label]) =>
      '<a class="icon-btn' + (ic === 'orcid' ? ' icon-btn--orcid' : '') + '" href="' + NS.esc(href) + '"' + (ic === 'mail' ? '' : ' target="_blank" rel="noopener"') +
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
    const doi = NS.doiLive(p);
    if (doi) actions.push('<a class="pub__link" href="https://doi.org/' + NS.esc(p.doi) + '" target="_blank" rel="noopener">' + NS.icon.external + 'DOI</a>');
    else if (p.url) actions.push('<a class="pub__link" href="' + NS.esc(p.url) + '" target="_blank" rel="noopener">' + NS.icon.external + 'Publisher</a>');
    if (doi && p.url) actions.push('<a class="pub__link" href="' + NS.esc(p.url) + '" target="_blank" rel="noopener">' + NS.icon.external + 'Publisher</a>');
    if (p.pdf) actions.push('<a class="pub__link" href="' + NS.esc(p.pdf) + '" target="_blank" rel="noopener">' + NS.icon.doc + 'Full text</a>');
    if (p.repo) actions.push('<a class="pub__link" href="' + NS.esc(p.repo) + '" target="_blank" rel="noopener">' + NS.icon.code + 'Code</a>');
    if (p.dataset) actions.push('<a class="pub__link" href="' + NS.esc(p.dataset) + '" target="_blank" rel="noopener">' + NS.icon.data + 'Data</a>');
    if (p.abstract) actions.push('<button class="pub__link pub__abs-btn" type="button" aria-expanded="false">Abstract</button>');
    if (p.numbered) actions.push('<button class="pub__link pub__cite-btn" type="button" data-cite="' + NS.esc(p.id) + '" aria-haspopup="menu" aria-expanded="false" title="Copy a citation">' + NS.icon.cite + '<span>Cite</span></button>');

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

  /* ── Citation formats ── */
  const bibEsc = (t) => String(t).replace(/([&%$#_])/g, '\\$1').replace(/—/g, '---').replace(/–/g, '--');
  const ascii = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]/g, '');

  /** One BibTeX entry. `key` can be passed in to keep keys unique when exporting several. */
  NS.bibtex = (p, key) => {
    const first = (p.authors[0] || 'anon').trim().split(/\s+/).pop();
    const word = (p.title.match(/[A-Za-z]{4,}/) || ['paper'])[0];
    key = key || ascii(first).toLowerCase() + p.year + ascii(word).toLowerCase();
    const d = p.details || '';
    const vol = (d.match(/Vol\.\s*(\d+)/i) || [])[1];
    const num = (d.match(/No\.\s*(\d+)/i) || [])[1];
    const pages = (d.match(/pp\.\s*([\d–-]+)/i) || [])[1];
    const place = p.type === 'conference' ? (d.split('·')[0] || '').trim() : '';
    const unpublished = !p.numbered;
    const note = { accepted: 'Accepted for publication', review: 'Under review', submitted: 'Submitted', progress: 'In preparation' }[p.status] || '';
    const rows = unpublished ? [
      ['author', p.authors.map(bibEsc).join(' and ')],
      ['title', '{' + bibEsc(p.title) + '}'],
      ['note', note + (p.venue ? ' (' + bibEsc(p.venue) + ')' : '')],
      ['year', p.year]
    ] : [
      ['author', p.authors.map(bibEsc).join(' and ')],
      ['title', '{' + bibEsc(p.title) + '}'],
      [p.type === 'conference' ? 'booktitle' : 'journal', bibEsc(p.venue || '')],
      ['year', p.year],
      ['volume', vol], ['number', num], ['pages', pages && pages.replace(/[–-]/, '--')],
      ['address', place && !/^(Vol|Emerald|Springer|IEEE|Wiley)/i.test(place) ? bibEsc(place) : ''],
      ['doi', NS.doiLive(p) ? p.doi : ''],
      ['note', p.status === 'accepted' ? note : '']
    ];
    return '@' + (unpublished ? 'unpublished' : p.type === 'conference' ? 'inproceedings' : 'article') + '{' + key + ',\n' +
      rows.filter(([, v]) => v !== undefined && v !== '' && v !== null).map(([k, v]) => '  ' + k + ' = {' + v + '}').join(',\n') + '\n}';
  };

  /** Several entries with unique keys. */
  NS.bibtexMany = (list) => {
    const used = new Set();
    return list.map((p) => {
      const first = (p.authors[0] || 'anon').trim().split(/\s+/).pop();
      const word = (p.title.match(/[A-Za-z]{4,}/) || ['paper'])[0];
      const base = ascii(first).toLowerCase() + p.year + ascii(word).toLowerCase();
      let key = base, n = 0;
      while (used.has(key)) key = base + String.fromCharCode(97 + n++);
      used.add(key);
      return NS.bibtex(p, key);
    }).join('\n\n') + '\n';
  };

  /** IEEE reference style (plain text). */
  NS.ieee = (p) => {
    const ini = (name) => {
      const parts = name.trim().split(/\s+/);
      const last = parts.pop();
      return parts.map((x) => x.replace(/\.$/, '')[0].toUpperCase() + '.').join(' ') + (parts.length ? ' ' : '') + last;
    };
    const a = p.authors.map(ini);
    const authors = a.length > 6 ? a[0] + ' et al.' : a.length > 2 ? a.slice(0, -1).join(', ') + ', and ' + a[a.length - 1] : a.join(' and ');
    const d = p.details || '';
    const vol = (d.match(/Vol\.\s*(\d+)/i) || [])[1];
    const num = (d.match(/No\.\s*(\d+)/i) || [])[1];
    const pages = (d.match(/pp\.\s*([\d–-]+)/i) || [])[1];
    const head = authors + ', "' + p.title + ',"';
    const bits = [p.venue];
    if (p.type === 'conference') {
      const place = (d.split('·')[0] || '').trim();
      if (place && !/^(Vol|Emerald|Springer|IEEE|Wiley)/i.test(place)) bits.push(place);
    } else {
      if (vol) bits.push('vol. ' + vol);
      if (num) bits.push('no. ' + num);
      if (pages) bits.push('pp. ' + pages.replace('-', '–'));
    }
    if (!p.numbered) bits.push(p.status === 'review' ? 'under review' : p.status === 'submitted' ? 'submitted' : 'unpublished');
    else if (p.status === 'accepted') bits.push('to be published');
    bits.push(String(p.year));
    if (NS.doiLive(p)) bits.push('doi: ' + p.doi);
    return head + ' ' + bits.filter(Boolean).join(', ') + '.';
  };

  /* ── Toast ── */
  let toastTimer;
  NS.toast = (msg) => {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    t.innerHTML = NS.icon.check + '<span></span>';
    t.lastChild.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  };

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) { /* fall through */ }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta);
    ta.select(); let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove(); return ok;
  };

  /* Cite menu: one small floating menu shared by every "Cite" button */
  let citeMenu = null, citeBtn = null;
  const closeCite = (refocus) => {
    if (!citeMenu) return;
    citeMenu.remove(); citeMenu = null;
    if (citeBtn) { citeBtn.setAttribute('aria-expanded', 'false'); if (refocus) citeBtn.focus(); }
    citeBtn = null;
  };
  const copyDone = (btn, label) => {
    NS.toast(label + ' copied to clipboard');
    btn.classList.add('is-done');
    setTimeout(() => btn.classList.remove('is-done'), 1600);
  };
  const openCite = (btn) => {
    closeCite();
    citeBtn = btn;
    btn.setAttribute('aria-expanded', 'true');
    citeMenu = document.createElement('div');
    citeMenu.className = 'cite-menu'; citeMenu.setAttribute('role', 'menu');
    citeMenu.innerHTML = '<button type="button" role="menuitem" data-fmt="bibtex">BibTeX</button><button type="button" role="menuitem" data-fmt="ieee">IEEE</button>';
    document.body.appendChild(citeMenu);
    const r = btn.getBoundingClientRect(), mw = citeMenu.offsetWidth;
    citeMenu.style.top = Math.round(r.bottom + 6) + 'px';
    citeMenu.style.left = Math.round(Math.min(Math.max(8, r.left), innerWidth - mw - 8)) + 'px';
    citeMenu.firstChild.focus();
  };

  document.addEventListener('click', async (e) => {
    const item = e.target.closest('.cite-menu [data-fmt]');
    if (item) {
      const p = NS.publication(citeBtn && citeBtn.dataset.cite);
      const btn = citeBtn, fmt = item.dataset.fmt;
      closeCite(true);
      if (!p) return;
      const text = fmt === 'ieee' ? NS.ieee(p) : NS.bibtex(p);
      if (await copyText(text)) copyDone(btn, fmt === 'ieee' ? 'IEEE reference' : 'BibTeX');
      else window.prompt('Copy the citation (Ctrl+C):', text);
      return;
    }
    const btn = e.target.closest('.pub__cite-btn');
    if (btn) { if (citeBtn === btn) closeCite(); else openCite(btn); return; }
    if (citeMenu && !e.target.closest('.cite-menu')) closeCite();
  });
  document.addEventListener('keydown', (e) => {
    if (!citeMenu) return;
    const items = [...citeMenu.querySelectorAll('button')], i = items.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); closeCite(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    else if (e.key === 'Tab') closeCite();
  });
  window.addEventListener('scroll', () => closeCite(), { passive: true });

  /** Download a set of papers as a .bib file */
  NS.downloadBib = (list, filename) => {
    const blob = new Blob([NS.bibtexMany(list)], { type: 'application/x-bibtex;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename || 'neurasec-publications.bib';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  /* ── Animations on/off (WCAG 2.2.2: moving content needs a way to stop it) ── */
  NS.build = window.NEURASEC_BUILD || null;
  NS.motionOff = () => {
    const stored = NS.storage.get('neurasec-motion');
    return stored === 'off' || (stored === null && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  NS.paintMotionToggle = () => {
    const b = document.getElementById('motionToggle');
    if (!b) return;
    const off = NS.motionOff();
    b.setAttribute('aria-pressed', String(off));
    b.textContent = off ? 'Animations: off' : 'Pause animations';
  };
  NS.setMotionOff = (off) => {
    NS.storage.set('neurasec-motion', off ? 'off' : 'on');
    document.documentElement.classList.toggle('motion-off', off);
    NS.paintMotionToggle();
    document.dispatchEvent(new CustomEvent('ns:motion', { detail: off }));
  };
  if (NS.motionOff()) document.documentElement.classList.add('motion-off');

  /* ── Visible notice if something breaks (instead of a silently empty page) ── */
  window.addEventListener('error', (e) => {
    if (e.target && e.target !== window) return;             // resource errors are handled per element
    if (document.querySelector('.site-error')) return;
    const bar = document.createElement('div');
    bar.className = 'site-error'; bar.setAttribute('role', 'alert');
    bar.innerHTML = 'Something went wrong while loading this page. Please refresh, or <a href="mailto:neurasec1@gmail.com">tell us</a> if it keeps happening.';
    document.body.prepend(bar);
  });

  /* ── Page chrome: header, footer, theme, search, back-to-top ── */
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
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  /* ── Search palette (Ctrl/⌘+K or "/") ── */
  const search = { el: null, input: null, list: null, items: [], idx: 0, last: null, index: null };

  const searchIndex = () => search.index || (search.index = [
    ...NAV.map(([, href, label]) => ({ kind: 'Pages', icon: 'page', title: label, sub: href.replace('.html', ''), href, hay: label.toLowerCase() })),
    ...NS.members.map((m) => ({
      kind: 'People', member: m, title: NS.displayName(m), sub: m.role + ' · ' + m.country, href: NS.profileUrl(m),
      hay: [NS.displayName(m), m.role, m.institution, m.country, m.expertise.join(' '), (m.aliases || []).join(' ')].join(' ').toLowerCase()
    })),
    ...NS.publications.map((p) => ({
      kind: 'Papers', pub: p, title: p.title, sub: (p.code ? p.code + ' · ' : '') + NS.STATUS[p.status].label + ' · ' + (p.venue || p.year),
      href: 'publications.html#pub-' + p.id, hay: [p.title, p.venue, p.code, p.keywords.join(' '), p.authors.join(' ')].join(' ').toLowerCase()
    }))
  ]);

  const runSearch = (q) => {
    const idx = searchIndex();
    q = q.trim().toLowerCase();
    if (!q) return [...idx.filter((r) => r.kind === 'Pages'), ...idx.filter((r) => r.kind === 'People').slice(0, 4)];
    const terms = q.split(/\s+/);
    const scored = [];
    idx.forEach((r) => {
      if (!terms.every((t) => r.hay.includes(t))) return;
      const t = r.title.toLowerCase();
      scored.push([r, (t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2) + (r.kind === 'People' ? 0 : r.kind === 'Pages' ? -0.5 : 0.3)]);
    });
    scored.sort((a, b) => a[1] - b[1]);
    const per = { Pages: 0, People: 0, Papers: 0 }, cap = { Pages: 3, People: 6, Papers: 8 };
    const out = scored.map((x) => x[0]).filter((r) => per[r.kind]++ < cap[r.kind]);
    // group order: People, Papers, Pages
    const order = { People: 0, Papers: 1, Pages: 2 };
    return out.sort((a, b) => order[a.kind] - order[b.kind]);
  };

  const select = (i) => {
    search.idx = i;
    search.list.querySelectorAll('.sp__item').forEach((a, n) => a.setAttribute('aria-selected', String(n === i)));
    const cur = search.list.querySelector('.sp__item[aria-selected="true"]');
    if (cur) { cur.scrollIntoView({ block: 'nearest' }); search.input.setAttribute('aria-activedescendant', cur.id); }
  };

  const paintSearch = () => {
    const q = search.input.value;
    search.items = runSearch(q);
    search.idx = 0;
    if (!search.items.length) {
      search.list.innerHTML = '<div class="sp__empty">No matches for “' + NS.esc(q) + '”.<br><small>Try a name, a topic or a paper title.</small></div>';
      return;
    }
    let html = '', last = '';
    search.items.forEach((r, i) => {
      if (r.kind !== last) { html += '<div class="sp__group">' + (!q.trim() && r.kind === 'Pages' ? 'Go to' : r.kind) + '</div>'; last = r.kind; }
      const lead = r.member
        ? NS.avatar(r.member, 'sm')
        : r.pub
          ? '<span class="sp__code ' + (r.pub.code ? 'code--' + r.pub.type : '') + '">' + (r.pub.code || NS.STATUS[r.pub.status].short || '·') + '</span>'
          : '<span class="sp__icon">' + NS.icon[r.icon] + '</span>';
      html += '<a class="sp__item" role="option" id="sp-' + i + '" href="' + NS.esc(r.href) + '" data-i="' + i + '" aria-selected="' + (i === 0) + '">' +
        lead + '<span class="sp__text"><span class="sp__title">' + NS.esc(r.title) + '</span><span class="sp__sub">' + NS.esc(r.sub) + '</span></span>' +
        '<span class="sp__go">' + NS.icon.corner + '</span></a>';
    });
    search.list.innerHTML = html;
  };

  NS.closeSearch = () => {
    if (!search.el || search.el.hidden) return;
    search.el.hidden = true;
    document.documentElement.classList.remove('no-scroll');
    if (search.last && search.last.focus) search.last.focus();
  };

  NS.openSearch = () => {
    if (!search.el) {
      const el = document.createElement('div');
      el.className = 'sp'; el.hidden = true;
      el.innerHTML =
        '<div class="sp__scrim" data-close></div>' +
        '<div class="sp__panel" role="dialog" aria-modal="true" aria-label="Search the site">' +
          '<div class="sp__bar">' + NS.icon.search +
            '<input class="sp__input" type="text" role="combobox" aria-expanded="true" aria-controls="spList" placeholder="Search people, papers and pages…" autocomplete="off" spellcheck="false" />' +
            '<button class="sp__esc" type="button" data-close aria-label="Close search">esc</button>' +
          '</div>' +
          '<div class="sp__list" id="spList" role="listbox"></div>' +
          '<div class="sp__foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>' +
        '</div>';
      document.body.appendChild(el);
      search.el = el; search.input = el.querySelector('.sp__input'); search.list = el.querySelector('.sp__list');
      el.addEventListener('click', (e) => { if (e.target.closest('[data-close]') || e.target.closest('.sp__item')) NS.closeSearch(); });
      search.list.addEventListener('mousemove', (e) => {
        const a = e.target.closest('.sp__item');
        if (a && +a.dataset.i !== search.idx) select(+a.dataset.i);
      });
      search.input.addEventListener('input', paintSearch);
      search.input.addEventListener('keydown', (e) => {
        const n = search.items.length;
        if (e.key === 'ArrowDown') { e.preventDefault(); if (n) select((search.idx + 1) % n); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); if (n) select((search.idx - 1 + n) % n); }
        else if (e.key === 'Enter') { const it = search.items[search.idx]; if (it) { e.preventDefault(); NS.closeSearch(); location.href = it.href; } }
        else if (e.key === 'Tab') {
          e.preventDefault();
          const close = search.el.querySelector('.sp__esc');
          (document.activeElement === search.input ? close : search.input).focus();
        }
      });
    }
    search.last = document.activeElement;
    search.el.hidden = false;
    document.documentElement.classList.add('no-scroll');
    search.input.value = ''; paintSearch(); search.input.focus();
  };

  document.addEventListener('keydown', (e) => {
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '') || e.target.isContentEditable;
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (search.el && !search.el.hidden) NS.closeSearch(); else NS.openSearch();
    } else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault(); NS.openSearch();
    } else if (e.key === 'Escape') NS.closeSearch();
  });

  NS.renderChrome = () => {
    const page = document.body.dataset.page || '';

    // Skip link + main landmark target
    const main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'main';
      const skip = document.createElement('a');
      skip.className = 'skip'; skip.href = location.pathname + location.search + '#' + main.id; skip.textContent = 'Skip to content';
      document.body.prepend(skip);
    }

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
            '<button class="nav__search" id="searchBtn" type="button" aria-label="Search the site" aria-keyshortcuts="Control+K Meta+K">' + NS.icon.search +
              '<span class="nav__search-label">Search</span><kbd>' + (isMac ? '⌘' : 'Ctrl') + ' K</kbd></button>' +
            '<button class="icon-btn icon-btn--ghost" id="themeToggle" type="button" aria-label="Toggle dark mode"></button>' +
            '<button class="icon-btn icon-btn--ghost nav__toggle" id="navToggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navLinks">' + NS.icon.menu + '</button>' +
          '</div>' +
        '</div><div class="nav__progress" aria-hidden="true"></div></nav>';

      const toggle = document.getElementById('navToggle');
      const links = document.getElementById('navLinks');
      const setMenu = (open) => {
        links.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.innerHTML = open ? NS.icon.close : NS.icon.menu;
        document.documentElement.classList.toggle('no-scroll', open);
      };
      toggle.addEventListener('click', () => setMenu(!links.classList.contains('open')));
      links.addEventListener('click', (e) => { if (e.target.closest('a') || e.target === links) setMenu(false); });
      window.addEventListener('resize', () => { if (innerWidth > 1020 && links.classList.contains('open')) setMenu(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && links.classList.contains('open')) setMenu(false); });
      document.getElementById('searchBtn').addEventListener('click', () => NS.openSearch());
    }

    const footer = document.getElementById('site-footer');
    if (footer) {
      const lead = NS.member('hassan-ahmed');
      const link = (h, l) => '<a href="' + h + '">' + l + '</a>';
      footer.innerHTML =
        '<div class="container footer__grid">' +
          '<div class="footer__about">' +
            '<div class="footer__brand"><span class="brand__logo"><img src="images/logo.png" alt="" width="34" height="34"></span>' +
              '<div><strong>NeuraSec Research Group</strong><span>Advancing AI Security and Intelligent Systems</span></div></div>' +
            '<p class="footer__blurb">An international research community working on cybersecurity, deep learning, NLP and explainable AI.</p>' +
            '<div class="footer__social">' +
              '<a class="icon-btn" href="mailto:neurasec1@gmail.com" aria-label="Email NeuraSec" title="Email">' + NS.icon.mail + '</a>' +
              '<a class="icon-btn" href="https://www.linkedin.com/company/neurasec-research-group/" target="_blank" rel="noopener" aria-label="NeuraSec on LinkedIn" title="LinkedIn">' + NS.icon.linkedin + '</a>' +
              (lead && lead.links.scholar ? '<a class="icon-btn" href="' + NS.esc(lead.links.scholar) + '" target="_blank" rel="noopener" aria-label="Google Scholar" title="Google Scholar">' + NS.icon.scholar + '</a>' : '') +
            '</div>' +
          '</div>' +
          '<nav class="footer__col" aria-label="Explore"><h2 class="footer__h">Explore</h2>' + link('index.html', 'Home') +
            NAV.slice(0, 4).map(([, h, l]) => link(h, l)).join('') + '</nav>' +
          '<nav class="footer__col" aria-label="Community"><h2 class="footer__h">Community</h2>' +
            NAV.slice(4).map(([, h, l]) => link(h, l)).join('') + '</nav>' +
          '<div class="footer__col"><h2 class="footer__h">Get in touch</h2>' +
            '<a href="mailto:neurasec1@gmail.com">neurasec1@gmail.com</a>' +
            '<span class="footer__note">FAST-NUCES, Chiniot-Faisalabad Campus, Pakistan</span>' +
            '<button class="footer__kbd" type="button" id="footerSearch">' + NS.icon.search + 'Search the site <kbd>/</kbd></button>' +
          '</div>' +
        '</div>' +
        '<div class="container footer__bottom"><span>© 2024–' + new Date().getFullYear() + ' NeuraSec Research Group' +
          (NS.build && NS.build.date ? ' · Updated ' + new Date(NS.build.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '') + '</span>' +
          '<span class="footer__legal"><a href="privacy.html">Privacy</a>' +
          (NS.staticProfiles ? '<a href="feed.xml">News feed (RSS)</a>' : '') +
          '<button type="button" id="motionToggle" class="footer__motion" aria-pressed="false"></button></span></div>';
      NS.paintMotionToggle();
      document.getElementById('motionToggle').addEventListener('click', () => NS.setMotionOff(!NS.motionOff()));
      document.getElementById('footerSearch').addEventListener('click', () => NS.openSearch());
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

    // Back to top, with a reading-progress ring
    const top = document.createElement('button');
    top.className = 'to-top';
    top.type = 'button';
    top.setAttribute('aria-label', 'Back to top');
    top.innerHTML = '<svg class="to-top__ring" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" pathLength="100"/></svg>' + NS.icon.arrowUp;
    document.body.appendChild(top);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    const ring = top.querySelector('circle');
    const bar = document.querySelector('.nav__progress');
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      const frac = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      top.classList.toggle('visible', scrollY > 500);
      ring.style.strokeDashoffset = String(100 - frac * 100);
      if (bar) bar.style.transform = 'scaleX(' + frac + ')';
      const nav = document.querySelector('.nav');
      if (nav) nav.classList.toggle('nav--scrolled', scrollY > 8);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    // Cursor spotlight on cards
    if (window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('pointermove', (e) => {
        const c = e.target.closest && e.target.closest('.tile,.area,.person,.tool,.offer,.contact__card,.stat,.partner');
        if (!c) return;
        const r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  };

  /** Reveal-on-scroll for elements with .reveal (siblings entering together are staggered) */
  NS.reveal = (root) => {
    const els = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('in', 'settled'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const sibs = en.target.parentElement ? [...en.target.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
        const i = Math.max(0, sibs.indexOf(en.target));
        en.target.style.transitionDelay = Math.min(i % 6, 5) * 55 + 'ms';
        en.target.classList.add('in');
        const el = en.target;
        setTimeout(() => { el.classList.add('settled'); el.style.transitionDelay = ''; }, 1100);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  };
})();
