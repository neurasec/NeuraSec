# Updating the NeuraSec website

Everything that changes often lives in three data files. The pages draw themselves from
them, and a small build step (run automatically on every push) adds the extras search
engines need. You normally only edit the data files, the photos and the logos.

```
data/members.js         people
data/publications.js    papers
data/site.js            news, partner institutions, tools, site settings
images/members/         profile photos      (<member-id>.jpg)
images/partners/        institution logos   (.webp or .png)
images/flags/           country flags       (python tools/fetch_flags.py)

index.html, research.html, publications.html, people.html, network.html,
news.html, join.html, contact.html, privacy.html     the pages
member.html             a profile (the build makes people/<id>.html for every member)

css/neurasec.css        styling (light + dark theme, self-hosted fonts)
js/common.js            shared logic: linking papers <-> members, numbering, header/footer, search, citations
js/pages.js, js/member.js   render the sections of the pages
tools/                  validation + build scripts (see "Checks and publishing")
```

The menu and footer are generated in `js/common.js` (the `NAV` list). Each page's
`<body data-page="...">` tells the menu which item to highlight.

## Add a member

1. Save their photo as `images/members/<id>.jpg` (square, at least 300x300 px).
2. Add a block to `data/members.js` (copy an existing one). Set `photo: '<id>.jpg'`;
   leave it out to show initials.
3. `name` must match how the name is written in paper author lists. If a paper spells it
   differently, add that spelling to `aliases`.
4. New country? Run `python tools/fetch_flags.py` once to download its flag.

Their profile page is created automatically and every paper with their name is linked to
it. Optional fields: `orcid` (just the 16-digit iD), `joined` (`'2026-07'`), `tags`,
`expertise`, `email`, `links.website`. People in the Core group are ordered by their
number of papers.

## Add a paper

Add a block to `data/publications.js`, newest first within its status. Write `authors`
exactly as on the paper.

- `type`: `journal`, `conference` or `chapter`
- `status`: `published`, `accepted`, `review`, `submitted` or `progress`

Published and accepted papers get a code (J1, J2... / C1, C2...) automatically, oldest
first, and a **Cite** menu (BibTeX or IEEE). The **Download BibTeX** button on the
Publications page exports whatever list is currently shown. Keywords feed the topic cloud
on the Research page.

Optional extras on a paper: `repo` and `dataset` (https links, shown as **Code** and
**Data** buttons), `pdf` (full text), `url` (publisher page), `metrics` (for example
`'JCR Q2 · IF 3.1'`; say which JCR year it refers to).

**DOI links.** On every deploy the build asks Crossref whether each DOI exists. A DOI that
is not registered (yet) is not shown as a link and is left out of BibTeX/IEEE citations,
so visitors never land on "DOI not found". Once the DOI is registered, the next deploy
shows it automatically; nothing needs editing.

**Names.** Write each author the way the paper prints them, and spell the same person the
same way everywhere. `python tools/crossref_authors.py` compares the author lists here with
the published records in Crossref.

**Manuscripts.** By default the Publications page lists only published and accepted
papers; manuscripts under review or submitted are one click away, and profiles keep them
in a collapsed section. To list everything by default, set
`defaultPublicationView: 'all'` in `NEURASEC_SETTINGS` (`data/site.js`).

## Site settings

In `data/site.js`, `NEURASEC_SETTINGS`:

- `defaultPublicationView`: `'peer'` (published + accepted first) or `'all'`
- `showEmails`: `false` hides every personal email address on the site (profiles and links);
  the group's own address stays

## Institution logos

Partners live in `data/site.js` (`NEURASEC_PARTNERS`). Save the logo in
`images/partners/` (WebP or PNG, about 240 px on the long side, transparent or white
background) and add `logo: 'images/partners/<file>'` and the website `url`. Without a
`logo` the card shows initials. These are described on the site as *member affiliations*,
not formal partnerships, because most are where members work.

## News

Add an entry at the top of `NEURASEC_NEWS` in `data/site.js`. `members` shows avatars,
`publication` / `publications` link papers. News also feeds `feed.xml` (RSS).

## Checks and publishing

Pushing to `main` runs `.github/workflows/deploy.yml`:

1. `python tools/validate.py` stops the deploy on real mistakes: a syntax error in a data
   file (with the line number), duplicate ids, missing photos/logos/flags, malformed ORCID
   iDs or DOIs. It also *warns* about authors spelled two ways and members without photos.
2. `python tools/validate.py --online` warns about DOIs that Crossref does not know.
3. `python tools/build.py` produces the site in `_site/`: versioned CSS/JS URLs (so
   visitors never see stale files), one real page per member (`people/<id>.html`), a
   plain-HTML copy of the key content for search engines and visitors without JavaScript,
   structured data, `sitemap.xml`, `robots.txt`, `feed.xml` and a Content-Security-Policy.
4. `python tools/check_links.py _site` checks that every file the pages refer to exists.

Run the same checks yourself before pushing:

```bash
python tools/validate.py
python tools/build.py --out _site        # add --skip-doi-check to work offline
python tools/check_links.py _site
```

Other helpers in `tools/`:

| Command | What it does |
|---|---|
| `python tools/fetch_flags.py` | downloads flags for any new country |
| `python tools/crossref_authors.py` | compares author spellings with the published records |
| `python tools/css_report.py` | lists CSS declarations that a later rule overrides (`--fix` removes them) |

If the site moves to a custom domain, set the repository variable `SITE_URL`
(Settings > Secrets and variables > Actions > Variables) to the new address.

## Preview locally

The source files work when served as they are (this is the quickest way while editing):

```bash
python -m http.server 8000
```

then open http://localhost:8000. To see the built version, serve the `_site` folder the
same way.

## Search

Press `Ctrl+K` (or `/`) on any page to search people, papers and pages. The index is
built from the data files, so new entries are searchable immediately.
