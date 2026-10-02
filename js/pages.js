/* ============================================================
   NeuraSec — renders the sections of every content page.
   Each block runs only if its container exists on the page, so
   the same script serves index, research, publications, people,
   network, news, join and contact.
   ============================================================ */
(function () {
  'use strict';
  const NS = window.NS;
  const esc = NS.esc;
  const $ = (s) => document.querySelector(s);

  NS.renderChrome();

  const active = NS.members.filter(NS.isActive);
  const countries = [...new Set(active.map((m) => m.country))];
  const peerReviewed = NS.publications.filter((p) => p.numbered).length;
  const pipeline = NS.publications.length - peerReviewed;
  const news = window.NEURASEC_NEWS || [];

  const fmtDate = (s) => {
    const [y, m] = s.split('-').map(Number);
    return m ? new Date(y, m - 1, 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' }) : String(y);
  };

  /* Fill any element marked data-count="members|papers|peer|pipeline|countries|partners" */
  const COUNTS = {
    members: active.length, papers: NS.publications.length, peer: peerReviewed,
    pipeline, countries: countries.length, partners: (window.NEURASEC_PARTNERS || []).length
  };
  document.querySelectorAll('[data-count]').forEach((el) => { el.textContent = COUNTS[el.dataset.count]; });

  /* ════════════ HOME ════════════ */

  if ($('#heroStats')) {
    const stats = [
      [active.length, 'Researchers & advisors'],
      [peerReviewed, 'Published & accepted papers'],
      [pipeline, 'Under review & submitted'],
      [countries.length, 'Countries']
    ];
    $('#heroStats').innerHTML = stats.map(([n, l]) =>
      '<div class="hero__stat"><div class="hero__stat-num" data-to="' + n + '">' + n + '</div><div class="hero__stat-label">' + l + '</div></div>').join('');

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('.hero__stat-num').forEach((el) => {
        const to = +el.dataset.to; const t0 = performance.now(); const dur = 1100;
        const step = (t) => {
          const k = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }
  }

  /* Hero neural-network canvas */
  (function heroCanvas() {
    const canvas = $('#heroCanvas');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w, h, dpr, nodes = [], running = true, raf;
    const mouse = { x: -1e4, y: -1e4 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, Math.max(28, (w * h) / 16000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .28, vy: (Math.random() - .5) * .28,
        r: Math.random() * 1.6 + .8
      }));
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const maxD = 130;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxD) {
            ctx.strokeStyle = 'rgba(143,180,255,' + (0.22 * (1 - d / maxD)) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 180) {
          ctx.strokeStyle = 'rgba(61,214,195,' + (0.45 * (1 - md / 180)) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = md < 180 ? 'rgba(61,214,195,.95)' : 'rgba(190,210,255,.75)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      if (running && !reduce) raf = requestAnimationFrame(frame);
    }

    resize(); frame();
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { resize(); if (reduce) frame(); }, 150); });
    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });
    if ('IntersectionObserver' in window && !reduce) {
      new IntersectionObserver(([en]) => {
        const was = running; running = en.isIntersecting;
        if (running && !was) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
      }).observe(hero);
    }
  })();

  /* Latest papers (home) */
  if ($('#latestPubs')) {
    const latest = NS.publications.filter((p) => p.numbered).slice(0, 4);
    $('#latestPubs').innerHTML = '<div class="pubs">' + latest.map((p) => NS.pubHTML(p, { showYear: true })).join('') + '</div>';
  }

  /* Faces wall (home) */
  if ($('#faces')) {
    $('#faces').innerHTML = active.map((m) =>
      '<a class="face reveal" href="' + NS.profileUrl(m) + '" title="' + esc(NS.displayName(m) + ' — ' + m.role) + '">' +
      NS.avatar(m, 'md') + '<span class="face__name">' + esc(NS.displayName(m)) + '</span></a>').join('');
  }

  /* ════════════ PUBLICATIONS ════════════ */

  if ($('#pubList')) {
    const params = new URLSearchParams(location.search);
    const state = { q: '', status: 'all', type: 'all', member: NS.member(params.get('member')) ? params.get('member') : '' };
    const STATUS_FILTERS = [['all', 'All'], ['published', 'Published'], ['accepted', 'Accepted'], ['review', 'Under review'], ['submitted', 'Submitted'], ['progress', 'In progress']]
      .filter(([k]) => k === 'all' || NS.publications.some((p) => p.status === k));
    const TYPE_FILTERS = [['all', 'All types'], ['journal', 'Journal'], ['conference', 'Conference']];
    const count = (fn) => NS.publications.filter(fn).length;

    $('#pubStatus').innerHTML = STATUS_FILTERS.map(([k, l]) =>
      '<button class="chip" type="button" data-k="' + k + '" aria-pressed="' + (k === 'all') + '">' + l +
      ' <span class="chip__n">' + count((p) => k === 'all' || p.status === k) + '</span></button>').join('');
    $('#pubType').innerHTML = TYPE_FILTERS.map(([k, l]) =>
      '<button class="chip" type="button" data-k="' + k + '" aria-pressed="' + (k === 'all') + '">' + l + '</button>').join('');

    const withPubs = active.filter((m) => m.pubs.length)
      .sort((a, b) => b.pubs.length - a.pubs.length || a.name.localeCompare(b.name));
    $('#pubMember').innerHTML = '<option value="">All members</option>' +
      withPubs.map((m) => '<option value="' + m.id + '">' + esc(NS.displayName(m)) + ' (' + m.pubs.length + ')</option>').join('');
    $('#pubMember').value = state.member;

    const bindChips = (el, key) => el.addEventListener('click', (e) => {
      const b = e.target.closest('.chip'); if (!b) return;
      el.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === b)));
      state[key] = b.dataset.k; renderPubs();
    });
    bindChips($('#pubStatus'), 'status');
    bindChips($('#pubType'), 'type');
    let qt;
    $('#pubSearch').addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); renderPubs(); }, 120); });
    $('#pubMember').addEventListener('change', (e) => {
      state.member = e.target.value;
      const url = new URL(location.href);
      if (state.member) url.searchParams.set('member', state.member); else url.searchParams.delete('member');
      history.replaceState(null, '', url);
      renderPubs();
    });

    const haystack = (p) => (p._hay = p._hay || [p.title, p.venue, p.details, p.code, p.year, p.lead]
      .concat(p.authors, p.keywords).filter(Boolean).join(' ').toLowerCase());

    function renderPubs() {
      const list = NS.publications.filter((p) =>
        (state.status === 'all' || p.status === state.status) &&
        (state.type === 'all' || p.type === state.type) &&
        (!state.member || p.authorMembers.some((m) => m && m.id === state.member) || (p.leadMember && p.leadMember.id === state.member)) &&
        (!state.q || state.q.split(/\s+/).every((t) => haystack(p).includes(t))));

      const filtered = state.q || state.member || state.status !== 'all' || state.type !== 'all';
      const who = state.member ? NS.member(state.member) : null;
      $('#pubNote').innerHTML = filtered
        ? 'Showing ' + list.length + ' of ' + NS.publications.length + ' papers' +
          (who ? ' by <a href="' + NS.profileUrl(who) + '">' + esc(NS.displayName(who)) + '</a>' : '') +
          ' · <button type="button" id="pubReset">Clear filters</button>'
        : NS.publications.length + ' papers · ' + peerReviewed + ' published or accepted';
      const reset = $('#pubReset');
      if (reset) reset.addEventListener('click', resetFilters);

      if (!list.length) { $('#pubList').innerHTML = '<div class="empty">No papers match these filters.</div>'; return; }

      const years = [];
      list.forEach((p) => { let y = years.find((g) => g.year === p.year); if (!y) years.push(y = { year: p.year, items: [] }); y.items.push(p); });
      $('#pubList').innerHTML = years.map((g) =>
        '<h3 class="pub-year">' + g.year + ' <small>' + g.items.length + (g.items.length === 1 ? ' paper' : ' papers') + '</small></h3>' +
        '<div class="pubs">' + g.items.map((p) => NS.pubHTML(p, { self: state.member })).join('') + '</div>').join('');
    }

    function resetFilters() {
      Object.assign(state, { q: '', status: 'all', type: 'all', member: '' });
      $('#pubSearch').value = ''; $('#pubMember').value = '';
      history.replaceState(null, '', location.pathname);
      document.querySelectorAll('#pubStatus .chip, #pubType .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.k === 'all')));
      renderPubs();
    }
    renderPubs();

    // Jump to a paper linked from another page (publications.html#pub-xyz)
    if (location.hash.startsWith('#pub-')) {
      setTimeout(() => {
        const t = document.getElementById(location.hash.slice(1));
        if (!t) return;
        window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - (window.innerHeight - t.offsetHeight) / 2, behavior: 'instant' });
        t.classList.add('flash');
      }, 80);
    }
  }

  /* ════════════ PEOPLE ════════════ */

  if ($('#teamGroups')) {
    const codesHTML = (m) => {
      const c = NS.contributions(m);
      const numbered = c.journal.concat(c.conference, c.chapter);
      if (!numbered.length && !c.ongoing.length) return '';
      return '<div class="person__codes">' +
        '<span class="person__codes-label">Contributions</span>' +
        numbered.map((p) => NS.codeChip(p, NS.profileUrl(m, p.id))).join('') +
        (c.ongoing.length ? '<span class="person__ongoing">+' + c.ongoing.length + ' under review</span>' : '') +
      '</div>';
    };

    const cardHTML = (m, featured) =>
      '<article class="person' + (m.group === 'former' ? ' person--former' : '') + ' reveal">' +
        '<div class="person__photo">' + NS.avatar(m) + '</div>' +
        '<div class="person__body">' +
        '<h4 class="person__name"><a href="' + NS.profileUrl(m) + '">' + esc(NS.displayName(m)) + '</a></h4>' +
        '<div class="person__role">' + esc(m.role) + '</div>' +
        '<p class="person__inst">' + esc(m.institution) + '</p>' +
        '<div class="person__country">' + NS.country(m) + '</div>' +
        (featured && m.expertise.length ? '<div class="person__expertise">' + m.expertise.slice(0, 5).map((k) => '<span class="kw">' + esc(k) + '</span>').join('') + '</div>' : '') +
        codesHTML(m) +
        '<div class="person__links">' + NS.socialLinks(m) + '</div>' +
      '</div></article>';

    const rowHTML = (m) => {
      const c = NS.contributions(m);
      const line = (label, items) => items.length
        ? '<div class="roster__contrib-line"><b>' + label + '</b>' + items.map((p) => NS.codeChip(p, NS.profileUrl(m, p.id))).join('') + '</div>' : '';
      const contrib = line('Journals', c.journal) + line('Conferences', c.conference) + line('Chapters', c.chapter) +
        (c.ongoing.length ? '<div class="roster__contrib-line"><b>Under review</b>' + c.ongoing.length + ' manuscript' + (c.ongoing.length > 1 ? 's' : '') + '</div>' : '');
      return '<div class="roster__row">' +
        NS.avatar(m, 'md') +
        '<div><div class="roster__name"><a href="' + NS.profileUrl(m) + '">' + esc(NS.displayName(m)) + '</a></div>' +
          '<div class="roster__role">' + esc(m.role) + '</div>' +
          '<div class="roster__inst">' + esc(m.institution) + '</div><div class="roster__inst">' + NS.country(m) + '</div></div>' +
        '<div class="roster__contrib">' + (contrib || '<span style="color:var(--muted)">—</span>') + '</div>' +
        '<div class="roster__links">' + NS.socialLinks(m) + '</div>' +
      '</div>';
    };

    // Jump links to each group
    const groupNav = $('#groupNav');
    if (groupNav) {
      groupNav.innerHTML = NS.groups.map((g) => {
        const n = NS.members.filter((m) => m.group === g.id).length;
        return n ? '<a class="chip" href="#g-' + g.id + '">' + esc(g.title) + ' <span class="chip__n">' + n + '</span></a>' : '';
      }).join('');
    }

    let view = NS.storage.get('neurasec-team-view') === 'list' ? 'list' : 'grid';
    const renderTeam = () => {
      document.querySelectorAll('.view-toggle button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
      $('#teamGroups').innerHTML = NS.groups.map((g) => {
        const people = NS.members.filter((m) => m.group === g.id);
        if (!people.length) return '';
        const featured = g.id === 'leadership' || g.id === 'advisors';
        const body = view === 'grid'
          ? '<div class="people' + (featured ? ' people--featured' : '') + (g.id === 'leadership' ? ' people--lead' : '') + '">' + people.map((m) => cardHTML(m, featured)).join('') + '</div>'
          : '<div class="roster">' + people.map(rowHTML).join('') + '</div>';
        return '<div class="group" id="g-' + g.id + '"><div class="group__head"><h2 class="group__title">' + esc(g.title) + '</h2>' +
          '<span class="group__count">' + people.length + '</span></div>' + body + '</div>';
      }).join('');
      NS.reveal($('#teamGroups'));
    };
    document.querySelector('.view-toggle').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b || b.dataset.view === view) return;
      view = b.dataset.view; NS.storage.set('neurasec-team-view', view); renderTeam();
    });
    renderTeam();
  }

  /* ════════════ GLOBAL REACH ════════════ */

  if ($('#countryList')) {
    const byCountry = {};
    active.forEach((m) => { byCountry[m.country] = byCountry[m.country] || { flag: m.flag, n: 0 }; byCountry[m.country].n++; });
    $('#countryList').innerHTML = Object.entries(byCountry).sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]))
      .map(([c, v]) => '<span class="country">' + NS.country({ flag: v.flag, country: c }) + ' <b>' + v.n + '</b></span>').join('');
  }

  if ($('#leafletMap')) (function map() {
    const el = $('#leafletMap');
    const places = new Map();
    active.forEach((m) => {
      if (!m.location) return;
      // One pin per country (placed at the average of its members' cities) keeps the map readable.
      if (!places.has(m.country)) places.set(m.country, { country: m.country, flag: m.flag, people: [] });
      places.get(m.country).people.push(m);
    });
    places.forEach((pl) => {
      pl.lat = pl.people.reduce((s, m) => s + m.location.lat, 0) / pl.people.length;
      pl.lng = pl.people.reduce((s, m) => s + m.location.lng, 0) / pl.people.length;
    });
    const cityCount = new Set(active.filter((m) => m.location).map((m) => m.location.city + '|' + m.country)).size;
    if ($('#mapSub')) $('#mapSub').textContent = active.length + ' people in ' + cityCount + ' cities across ' + countries.length + ' countries. Select a pin to see who works there.';

    if (typeof L === 'undefined') { el.parentElement.hidden = true; return; }

    const map = L.map(el, { center: [24, 60], zoom: 2, minZoom: 2, maxZoom: 12, scrollWheelZoom: false, worldCopyJump: true });
    el.addEventListener('click', () => map.scrollWheelZoom.enable());
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    const bounds = [];
    places.forEach((pl) => {
      const adv = pl.people.filter((m) => m.group === 'advisors').length;
      const mem = pl.people.length - adv;
      const bg = adv && mem ? 'linear-gradient(135deg,#1d4ed8 50%,#0e9f8e 50%)' : adv ? '#0e9f8e' : '#1d4ed8';
      const size = Math.min(44, 24 + pl.people.length * 3);
      const icon = L.divIcon({
        className: '',
        html: '<div class="ns-pin" style="width:' + size + 'px;height:' + size + 'px;background:' + bg + '">' + pl.people.length + '</div>',
        iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2]
      });
      const html = '<div class="popup__title">' + NS.country({ flag: pl.flag, country: pl.country }) +
        '<small style="font-weight:500;color:var(--muted);margin-left:auto">' + pl.people.length + '</small></div>' +
        '<div class="popup__list">' + pl.people.map((m) =>
          '<a class="popup__row" href="' + NS.profileUrl(m) + '">' + NS.avatar(m, 'sm') +
          '<span><strong>' + esc(NS.displayName(m)) + '</strong><small>' + esc(m.role) + ' · ' + esc(m.location.city) + '</small></span></a>').join('') + '</div>';
      L.marker([pl.lat, pl.lng], { icon, title: pl.country, riseOnHover: true }).bindPopup(html, { maxWidth: 300 }).addTo(map);
      bounds.push([pl.lat, pl.lng]);
    });
    const fit = () => { map.invalidateSize(); if (bounds.length) map.fitBounds(bounds, { padding: [36, 36], maxZoom: 3 }); };
    fit();
    setTimeout(fit, 300);
  })();

  if ($('#partnerList')) {
    const mono = (name) => name.replace(/[,&]/g, ' ').split(/\s+/)
      .filter((w) => w && !/^(of|the|and|for)$/i.test(w)).map((w) => w[0]).join('').toUpperCase().slice(0, 4);
    $('#partnerList').innerHTML = (window.NEURASEC_PARTNERS || []).map((p) =>
      '<div class="partner reveal"><span class="partner__mono" aria-hidden="true">' + esc(mono(p.name)) + '</span>' +
      '<div><div class="partner__name">' + esc(p.name) + '</div><div class="partner__meta">' + esc(p.kind) + ' · ' + esc(p.country) + '</div></div></div>').join('');
  }

  /* ════════════ NEWS (full list, or the latest few with data-limit) ════════════ */

  if ($('#newsList')) {
    const limit = +$('#newsList').dataset.limit || news.length;
    $('#newsList').innerHTML = news.slice(0, limit).map((n) => {
      const people = (n.members || []).map(NS.member).filter(Boolean);
      const pubs = (n.publications || (n.publication ? [n.publication] : [])).map(NS.publication).filter(Boolean);
      return '<div class="tl reveal"><div class="tl__date">' + fmtDate(n.date) + '</div><div class="tl__body">' +
        '<div class="tl__tag">' + esc(n.tag) + '</div><div class="tl__text">' + esc(n.text) + '</div>' +
        (people.length || pubs.length ? '<div class="tl__people">' +
          people.map((m) => '<a class="tl__person" href="' + NS.profileUrl(m) + '">' + NS.avatar(m, 'xs') + esc(NS.displayName(m)) + '</a>').join('') +
          pubs.map((pub) => '<a class="tl__person" style="padding-left:.6rem" href="publications.html#pub-' + esc(pub.id) + '">' + (pub.code ? pub.code + ' · ' : '') + 'View paper</a>').join('') +
        '</div>' : '') +
      '</div></div>';
    }).join('');
  }

  /* ════════════ RESEARCH: tools ════════════ */

  if ($('#toolList')) {
    $('#toolList').innerHTML = (window.NEURASEC_TOOLS || []).map((t) => {
      const by = (t.authors || []).map(NS.member).filter(Boolean);
      return '<div class="tool reveal"><div class="tool__name">' + esc(t.name) + '</div><div class="tool__tag">' + esc(t.tagline) + '</div>' +
        '<p class="tool__desc">' + esc(t.description) + '</p><div class="tool__foot">' +
        (by.length ? '<span class="tool__by">' + by.map((m) => NS.avatar(m, 'xs') + 'by <a href="' + NS.profileUrl(m) + '">' + esc(NS.displayName(m)) + '</a>').join(', ') + '</span>' : '<span></span>') +
        '<a class="btn btn--accent" href="' + esc(t.url) + '" target="_blank" rel="noopener">Launch tool ' + NS.icon.arrowRight + '</a></div></div>';
    }).join('');
  }

  /* ════════════ JOIN: tabs ════════════ */

  const tabs = [...document.querySelectorAll('[role="tablist"] [role="tab"]')];
  tabs.forEach((tab) => tab.addEventListener('click', () => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.setAttribute('aria-pressed', String(on));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }));

  NS.reveal();
})();
