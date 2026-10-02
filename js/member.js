/* ============================================================
   NeuraSec — member profile page (member.html?id=<member-id>)
   ============================================================ */
(function () {
  'use strict';
  const NS = window.NS;
  const esc = NS.esc;
  const root = document.getElementById('profile');

  NS.renderChrome();

  const id = new URLSearchParams(location.search).get('id');
  const m = id && NS.member(id);

  if (!m) {
    document.title = 'Member not found · NeuraSec';
    root.innerHTML = '<div class="container notfound"><h1>Member not found</h1>' +
      '<p>We couldn\'t find a profile for “' + esc(id || '') + '”.</p>' +
      '<a class="btn btn--accent" href="people.html">' + NS.icon.arrowLeft + ' Back to the team</a></div>';
    return;
  }

  const name = NS.displayName(m);
  document.title = name + ' · NeuraSec Research Group';
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = name + ' — ' + m.role + ', NeuraSec Research Group. Publications and collaborators.';

  const group = NS.groups.find((g) => g.id === m.group);
  const c = NS.contributions(m);
  const collaborators = NS.collaborators(m);
  const review = c.ongoing.filter((p) => p.status === 'review');
  const submitted = c.ongoing.filter((p) => p.status === 'submitted');
  const progress = c.ongoing.filter((p) => p.status === 'progress');

  /* ── Header card ── */
  const facts = [];
  facts.push('<span>' + NS.country(m) + '</span>');
  if (m.location && m.location.city) facts.push('<span>' + NS.icon.pin + esc(m.location.city) + '</span>');
  if (m.email) facts.push('<a href="mailto:' + esc(m.email) + '">' + NS.icon.mail + esc(m.email) + '</a>');

  const tags = m.tags.map((t) => '<span class="kw kw--strong">' + esc(t) + '</span>')
    .concat(m.expertise.map((t) => '<span class="kw">' + esc(t) + '</span>')).join('');

  const stats = [
    [c.journal.length, 'Journal articles'],
    [c.conference.length, 'Conference papers'],
    [c.ongoing.length + m.led.length, 'Under review & submitted'],
    [collaborators.length, 'NeuraSec co-authors']
  ];

  /* ── Contribution summary (J1, J4 … like a CV index) ── */
  const chipLine = (label, items) => items.length
    ? '<div class="contrib-line"><dt>' + label + '</dt><dd>' + items.map((p) => NS.codeChip(p, '#pub-' + p.id)).join('') + '</dd></div>' : '';
  const countLine = (label, items) => items.length
    ? '<div class="contrib-line"><dt>' + label + '</dt><dd>' + items.length + ' manuscript' + (items.length > 1 ? 's' : '') + '</dd></div>' : '';
  const summary = chipLine('Journal publications', c.journal) + chipLine('Conference proceedings', c.conference) +
    chipLine('Book chapters', c.chapter) + countLine('Under review', review) + countLine('Submitted', submitted) + countLine('In progress', progress) +
    (m.led.length ? countLine('Projects led', m.led) : '');

  const section = (title, items, opts) => items.length
    ? '<section class="pub-section"><h2 class="pub-section__title">' + title + ' <span class="group__count">' + items.length + '</span></h2>' +
      '<div class="pubs">' + items.map((p) => NS.pubHTML(p, Object.assign({ self: m.id, showYear: true }, opts))).join('') + '</div></section>'
    : '';

  const newestFirst = (list) => list.slice().reverse();
  const pubsHTML = m.pubs.length || m.led.length
    ? section('Journal articles', newestFirst(c.journal)) +
      section('Conference papers', newestFirst(c.conference)) +
      section('Book chapters', newestFirst(c.chapter)) +
      section('Under review', review) +
      section('Submitted — awaiting peer review', submitted) +
      section('In progress', progress) +
      section('Projects led', m.led)
    : '<div class="empty" style="margin-top:1.5rem">No NeuraSec papers are listed for ' + esc(name) + ' yet.</div>';

  const collabHTML = collaborators.length
    ? '<div class="panel"><h2 class="panel__title">Frequent collaborators</h2><div class="collab">' +
      collaborators.map(({ member: o, count }) =>
        '<a class="collab__row" href="' + NS.profileUrl(o) + '">' + NS.avatar(o, 'sm') +
        '<span><span class="collab__name">' + esc(NS.displayName(o)) + '</span><span class="collab__meta" style="display:block">' + esc(o.role) + '</span></span>' +
        '<span class="collab__n" title="' + count + ' shared paper' + (count > 1 ? 's' : '') + '">' + count + '</span></a>').join('') +
      '</div></div>'
    : '';

  /* Peers in the same group, for the sidebar */
  const peers = NS.members.filter((o) => o.group === m.group && o.id !== m.id);
  const peersHTML = peers.length
    ? '<div class="panel"><h2 class="panel__title">Also in ' + esc(group ? group.title : 'this group') + '</h2><div class="collab">' +
      peers.slice(0, 8).map((o) =>
        '<a class="collab__row" href="' + NS.profileUrl(o) + '">' + NS.avatar(o, 'sm') +
        '<span><span class="collab__name">' + esc(NS.displayName(o)) + '</span><span class="collab__meta" style="display:flex;align-items:center">' + NS.country(o) + '</span></span></a>').join('') +
      (peers.length > 8 ? '<a class="collab__row" href="people.html" style="justify-content:center;font-size:.82rem;font-weight:600;color:var(--accent)">See all ' + (peers.length + 1) + ' →</a>' : '') +
      '</div></div>'
    : '';

  /* Prev / next member */
  const idx = NS.members.indexOf(m);
  const prev = NS.members[(idx - 1 + NS.members.length) % NS.members.length];
  const next = NS.members[(idx + 1) % NS.members.length];

  root.innerHTML =
    '<section class="profile-hero"><div class="container">' +
      '<nav class="crumbs" aria-label="Breadcrumb"><a href="people.html">' + NS.icon.arrowLeft + 'All people</a><span aria-hidden="true">/</span><span>' + esc(group ? group.title : '') + '</span></nav>' +
    '</div></section>' +
    '<div class="container">' +
      '<article class="profile-card">' +
        '<div class="profile-card__photo">' + NS.avatar(m, 'xl') + '</div>' +
        '<div>' +
          '<div class="profile-card__group">' + esc(group ? group.title : '') + '</div>' +
          '<h1 class="profile-card__name">' + esc(name) + '</h1>' +
          '<div class="profile-card__role">' + esc(m.role) + '</div>' +
          '<p class="profile-card__inst">' + esc(m.institution) + '</p>' +
          '<div class="profile-card__facts">' + facts.join('') + '</div>' +
          (tags ? '<div class="profile-card__tags">' + tags + '</div>' : '') +
          '<div class="profile-card__links">' + NS.socialLinks(m, { email: true }) + '</div>' +
        '</div>' +
      '</article>' +
      '<div class="stats">' + stats.map(([n, l]) => '<div class="stat"><div class="stat__num">' + n + '</div><div class="stat__label">' + l + '</div></div>').join('') + '</div>' +
      '<div class="profile-layout">' +
        '<div>' +
          (summary ? '<div class="panel"><h2 class="panel__title">Research contributions</h2><dl>' + summary + '</dl>' +
            '<a class="more-link" href="publications.html?member=' + encodeURIComponent(m.id) + '">Filter the publications list by ' + esc(m.name) + ' ' + NS.icon.arrowRight + '</a></div>' : '') +
          pubsHTML +
        '</div>' +
        '<aside class="aside">' + collabHTML + peersHTML + '</aside>' +
      '</div>' +
      '<nav class="pager" aria-label="Other members">' +
        '<a class="prev" href="' + NS.profileUrl(prev) + '">' + NS.icon.arrowLeft + NS.avatar(prev, 'sm') + '<span><small>Previous</small><strong>' + esc(NS.displayName(prev)) + '</strong></span></a>' +
        '<a class="next" href="' + NS.profileUrl(next) + '"><span><small>Next</small><strong>' + esc(NS.displayName(next)) + '</strong></span>' + NS.avatar(next, 'sm') + NS.icon.arrowRight + '</a>' +
      '</nav>' +
      '<div style="height:4rem"></div>' +
    '</div>';

  // Highlight the paper named in the URL hash (e.g. from a J3 chip on the team page)
  function focusHash(smooth) {
    if (!location.hash.startsWith('#pub-')) return;
    const t = document.getElementById(location.hash.slice(1));
    if (!t) return;
    const y = t.getBoundingClientRect().top + window.scrollY - (window.innerHeight - t.offsetHeight) / 2;
    window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'instant' });
    t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
  }
  setTimeout(() => focusHash(false), 80);
  window.addEventListener('hashchange', () => focusHash(true));
})();
