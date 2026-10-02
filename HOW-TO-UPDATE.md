# Updating the NeuraSec website

The site is plain HTML/CSS/JS — no build step. Everything that changes often
lives in three data files; the pages are generated from them in the browser.

```
index.html              home: overview, latest papers, recent news, team faces
research.html           research areas + open-source tools
publications.html       full list with search/filters
                        (publications.html?member=<id> opens it pre-filtered)
people.html             the team (cards or "Contributions" list)
member.html             one profile — member.html?id=<member-id>
network.html            map of member locations + partner institutions
news.html               all news
join.html               ways to join
contact.html            contact details

data/members.js         people
data/publications.js    papers
data/site.js            news, partner institutions, tools
images/members/         profile photos  (<member-id>.jpg)
css/neurasec.css        all styling (light + dark theme)
js/common.js            links papers ↔ members, numbering, header/footer
js/pages.js             renders the sections of the content pages
js/member.js            renders member.html
```

The menu and footer are generated in `js/common.js` (the `NAV` list), so a
new page only needs adding there. Each page's `<body data-page="…">` tells the
menu which item to highlight.

## Add a member

1. Save their photo as `images/members/<id>.jpg` (square, at least 300×300 px).
2. Add a block to `data/members.js` — copy an existing one. Set `photo: '<id>.jpg'`
   (leave it out to show initials instead).
3. `name` must match how the name is written in paper author lists. If a paper
   spells it differently, add the spelling to `aliases`.

Their profile page appears at `member.html?id=<id>`, and every paper with their
name is linked to it automatically.

## Add a paper

Add a block to `data/publications.js`. Write `authors` exactly as on the paper.

- `type`: `journal`, `conference` or `chapter`
- `status`: `published`, `accepted`, `review` or `progress`

Published and accepted papers get a code (J1, J2… / C1, C2…) automatically,
oldest first. The codes, the hero statistics, the map and member profile pages
all update themselves.

## Add news

Add a line at the top of `NEURASEC_NEWS` in `data/site.js`. Put member ids in
`members` to show their avatars, or a paper id in `publication` to link it.

## Preview locally

The site works when opening `index.html` directly, but a local server is
closer to GitHub Pages:

```bash
python -m http.server 8000
```

then open http://localhost:8000.
