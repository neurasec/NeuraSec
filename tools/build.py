"""Build the deployable site into an output folder (default: _site).

    python tools/build.py                       # -> _site/
    python tools/build.py --out dist --site-url https://example.org/

What it adds on top of the source files (which keep working on their own when
you open them locally):
  * versioned URLs for CSS / JS / data (?v=<hash>) so visitors never get stale files
  * a plain-HTML copy of the key content (papers, people, news ...) so search engines,
    link previews and visitors without JavaScript can read it; the page scripts replace it
  * one static page per member  (people/<id>.html) with its own title, description,
    canonical link and structured data
  * sitemap.xml, robots.txt, feed.xml (news), canonical + Open Graph tags, JSON-LD
  * a Content-Security-Policy and a <noscript> notice
Everything is generated from the same data/*.js files the browser uses.
"""
import argparse
import datetime
import hashlib
import html
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import ROOT, STATUS_LABEL, TYPE_LABEL, Site, display_name, iso_from_flag  # noqa: E402

DEFAULT_URL = 'https://neurasec.github.io/NeuraSec/'
NL = chr(10)   # write generated files with Unix line endings on every platform
COPY_DIRS = ['css', 'js', 'data', 'images', 'fonts', 'vendor']
COPY_FILES = ['manifest.webmanifest']
esc = html.escape

CSP = ("default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
       "img-src 'self' data: https://tile.openstreetmap.org; font-src 'self'; connect-src 'self'; "
       "object-src 'none'; base-uri 'self'; form-action 'self'")


# ───────────────────────── helpers ─────────────────────────

def file_hash(path):
    return hashlib.sha1(open(path, 'rb').read()).hexdigest()[:8]


def month_to_rfc822(ym):
    y, m = (ym.split('-') + ['1'])[:2]
    d = datetime.datetime(int(y), int(m or 1), 1, 9, 0, 0)
    return d.strftime('%a, %d %b %Y %H:%M:%S +0000')


def jsonld(obj):
    return '<script type="application/ld+json">' + json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/') + '</script>'


class Builder:
    def __init__(self, out, site_url):
        self.out = out
        self.url = site_url.rstrip('/') + '/'
        self.S = Site(ROOT)
        self.today = datetime.date.today().isoformat()
        self.hashes = {}
        self.unregistered = set()

    # ── file copying & versioning ──
    def copy_assets(self):
        if os.path.isdir(self.out):
            shutil.rmtree(self.out)
        os.makedirs(self.out)
        for d in COPY_DIRS:
            src = os.path.join(ROOT, d)
            if os.path.isdir(src):
                shutil.copytree(src, os.path.join(self.out, d), ignore=shutil.ignore_patterns('__pycache__', '*.map'))
        for f in COPY_FILES:
            if os.path.exists(os.path.join(ROOT, f)):
                shutil.copy(os.path.join(ROOT, f), self.out)
        open(os.path.join(self.out, '.nojekyll'), 'w').close()
        sha = (os.environ.get('GITHUB_SHA') or '')[:7]
        build_js = "window.NEURASEC_BUILD = { date: '%s', commit: '%s' };\n" % (self.today, sha)
        open(os.path.join(self.out, 'data', 'build.js'), 'w', encoding='utf-8', newline=NL).write(build_js)
        for d in ('css', 'js', 'data'):
            for f in os.listdir(os.path.join(self.out, d)):
                if f.endswith(('.css', '.js')):
                    self.hashes['%s/%s' % (d, f)] = file_hash(os.path.join(self.out, d, f))

    def check_dois(self):
        """Ask Crossref which DOIs exist. Only a definite 404 counts as 'not registered'; network
        problems never hide a link."""
        found = []
        for p in self.S.pubs:
            doi = p.get('doi')
            if not doi:
                continue
            req = urllib.request.Request('https://api.crossref.org/works/' + doi,
                                         headers={'User-Agent': 'NeuraSec-site-build/1.0 (mailto:neurasec1@gmail.com)'})
            try:
                urllib.request.urlopen(req, timeout=20).read(1)
            except urllib.error.HTTPError as e:
                if e.code == 404:
                    found.append(doi)
            except Exception:  # noqa: BLE001  (offline, timeout ...)
                pass
        self.unregistered = set(found)
        js = "window.NEURASEC_DOI_STATUS = %s;" % json.dumps({'checked': self.today, 'unregistered': sorted(found)})
        open(os.path.join(self.out, 'data', 'doi-status.js'), 'w', encoding='utf-8', newline=NL).write(js + NL)
        self.hashes['data/doi-status.js'] = file_hash(os.path.join(self.out, 'data', 'doi-status.js'))
        if found:
            print('Not registered in Crossref (links hidden until they are): ' + ', '.join(found))

    def doi_live(self, p):
        return bool(p.get('doi')) and p['doi'] not in self.unregistered

    def version_urls(self, page):
        def sub(m):
            rel = m.group(2)
            h = self.hashes.get(rel)
            return '%s="%s?v=%s"' % (m.group(1), rel, h) if h else m.group(0)
        return re.sub(r'(src|href)="((?:css|js|data)/[^"?#]+)"', sub, page)

    # ── static (no-JS) content ──
    def profile_href(self, m):
        return 'people/%s.html' % m['id']

    def authors_html(self, p):
        bits = []
        for a, m in zip(p['authors'], p['authorMembers']):
            bits.append('<a href="%s">%s</a>' % (self.profile_href(m), esc(a)) if m else esc(a))
        return ', '.join(bits)

    def pub_li(self, p):
        venue = ', '.join(x for x in (p.get('venue'), p.get('details')) if x)
        link = ''
        if self.doi_live(p):
            link = ' <a href="https://doi.org/%s">doi:%s</a>' % (esc(p['doi']), esc(p['doi']))
        elif p.get('url'):
            link = ' <a href="%s">Publisher</a>' % esc(p['url'])
        for key, label in (('repo', 'Code'), ('dataset', 'Data')):
            if p.get(key):
                link += ' <a href="%s">%s</a>' % (esc(p[key]), label)
        code = '<strong>%s</strong> ' % p['code'] if p.get('code') else ''
        return '<li>%s%s. <cite>%s</cite>. %s, %s.%s <span>(%s)</span></li>' % (
            code, self.authors_html(p), esc(p['title']), esc(venue), p['year'], link, STATUS_LABEL[p['status']])

    def pubs_fallback(self):
        pubs = self.S.public_pubs()
        return '<ol class="seo-list" reversed>' + ''.join(self.pub_li(p) for p in pubs) + '</ol>'

    def people_fallback(self):
        out = []
        for g in self.S.groups:
            ms = [m for m in self.S.members if m['group'] == g['id']]
            if not ms:
                continue
            out.append('<h2>%s</h2><ul class="seo-list">' % esc(g['title']))
            for m in ms:
                out.append('<li><a href="%s">%s</a> &mdash; %s, %s, %s</li>' % (
                    self.profile_href(m), esc(display_name(m)), esc(m['role']), esc(m['institution']), esc(m['country'])))
            out.append('</ul>')
        return ''.join(out)

    def news_fallback(self):
        return '<ul class="seo-list">' + ''.join(
            '<li><strong>%s</strong> &middot; %s &mdash; %s</li>' % (esc(n['date']), esc(n['tag']), esc(n['text'])) for n in self.S.news) + '</ul>'

    def partners_fallback(self):
        return '<ul class="seo-list">' + ''.join(
            '<li><a href="%s">%s</a> &middot; %s, %s</li>' % (esc(p.get('url', '#')), esc(p['name']), esc(p['kind']), esc(p['country']))
            if p.get('url') else '<li>%s &middot; %s, %s</li>' % (esc(p['name']), esc(p['kind']), esc(p['country']))
            for p in self.S.partners) + '</ul>'

    def tools_fallback(self):
        return '<ul class="seo-list">' + ''.join(
            '<li><a href="%s"><strong>%s</strong></a> &mdash; %s</li>' % (esc(t['url']), esc(t['name']), esc(t['description'])) for t in self.S.tools) + '</ul>'

    def static_nav(self):
        pages = [('index.html', 'Home'), ('research.html', 'Research'), ('publications.html', 'Publications'), ('people.html', 'People'),
                 ('network.html', 'Global Reach'), ('news.html', 'News'), ('join.html', 'Join Us'), ('contact.html', 'Contact'),
                 ('privacy.html', 'Privacy')]
        return '<nav class="static-nav" aria-label="Site"><strong>NeuraSec</strong>' + ''.join(
            '<a href="%s">%s</a>' % (h, l) for h, l in pages) + '</nav>'

    # ── structured data ──
    def organization(self):
        return {
            '@context': 'https://schema.org', '@type': 'ResearchOrganization', '@id': self.url + '#org',
            'name': 'NeuraSec Research Group', 'url': self.url, 'logo': self.url + 'images/logo.png',
            'image': self.url + 'images/og-image.png', 'email': 'neurasec1@gmail.com', 'foundingDate': '2024-08',
            'description': 'An international research group working on cybersecurity, deep learning, natural language processing and explainable AI.',
            'address': {'@type': 'PostalAddress', 'addressLocality': 'Chiniot', 'addressCountry': 'PK'},
            'sameAs': ['https://www.linkedin.com/company/neurasec-research-group/'],
            'knowsAbout': ['Cybersecurity', 'Deep learning', 'Natural language processing', 'Explainable AI', 'AI in healthcare']}

    def person_ld(self, m):
        same = [v for k, v in m['links'].items() if v]
        if m.get('orcid'):
            same.append('https://orcid.org/' + m['orcid'])
        d = {'@context': 'https://schema.org', '@type': 'Person', 'name': m['name'], 'jobTitle': m['role'],
             'url': self.url + self.profile_href(m),
             'affiliation': {'@type': 'Organization', 'name': m['institution']},
             'memberOf': {'@id': self.url + '#org'}, 'nationality': m['country']}
        if m.get('prefix'):
            d['honorificPrefix'] = m['prefix']
        if m.get('photo'):
            d['image'] = self.url + 'images/members/' + m['photo']
        if same:
            d['sameAs'] = same
        if m.get('expertise'):
            d['knowsAbout'] = m['expertise']
        return d

    def article_ld(self, p):
        d = {'@type': 'ScholarlyArticle', 'headline': p['title'], 'name': p['title'], 'datePublished': str(p['year']),
             'author': [{'@type': 'Person', 'name': a, **({'url': self.url + self.profile_href(m)} if m else {})}
                        for a, m in zip(p['authors'], p['authorMembers'])]}
        if p.get('venue'):
            d['isPartOf'] = {'@type': 'Periodical' if p['type'] == 'journal' else 'Event', 'name': p['venue']}
        if self.doi_live(p):
            d['identifier'] = {'@type': 'PropertyValue', 'propertyID': 'DOI', 'value': p['doi']}
            d['sameAs'] = 'https://doi.org/' + p['doi']
        elif p.get('url'):
            d['url'] = p['url']
        if p.get('keywords'):
            d['keywords'] = ', '.join(p['keywords'])
        return d

    def page_ld(self, name):
        if name == 'index.html':
            return [self.organization(), {'@context': 'https://schema.org', '@type': 'WebSite', 'name': 'NeuraSec Research Group',
                                          'url': self.url, 'publisher': {'@id': self.url + '#org'}}]
        if name == 'publications.html':
            return [{'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'Publications', 'url': self.url + name,
                     'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(self.S.public_pubs()),
                                    'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'item': self.article_ld(p)}
                                                        for i, p in enumerate(self.S.public_pubs())]}}]
        if name == 'people.html':
            return [{'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'People', 'url': self.url + name,
                     'mainEntity': {'@type': 'ItemList', 'numberOfItems': len(self.S.members),
                                    'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'url': self.url + self.profile_href(m), 'name': display_name(m)}
                                                        for i, m in enumerate(self.S.members)]}}]
        return []

    # ── page processing ──
    def common_head(self, page, canonical):
        s = page
        # absolute site URL used in the source pages -> configured URL
        s = s.replace(DEFAULT_URL, self.url)
        s = re.sub(r'<link rel="canonical"[^>]*>\s*', '', s)
        extra = ('  <link rel="canonical" href="%s" />\n  <meta property="og:url" content="%s" />\n'
                 '  <link rel="alternate" type="application/rss+xml" title="NeuraSec news" href="%sfeed.xml" />\n'
                 '  <link rel="preload" href="fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin />\n'
                 '  <meta http-equiv="Content-Security-Policy" content="%s" />\n') % (canonical, canonical, self.url, CSP)
        return s.replace('  <meta name="theme-color"', extra + '  <meta name="theme-color"', 1)

    def fill(self, s, element_id, content):
        pat = re.compile(r'(<div[^>]*\bid="%s"[^>]*>)(\s*)(</div>)' % element_id)
        return pat.sub(lambda m: m.group(1) + content + m.group(3), s, count=1)

    def process_page(self, name, src, canonical_path=None, member=None):
        s = self.common_head(src, self.url + (canonical_path or ('' if name == 'index.html' else name)))
        # data/build.js (date stamp) before the page logic
        s = s.replace('<script src="js/common.js"></script>',
                      '<script src="data/build.js"></script>\n<script src="data/doi-status.js"></script>\n<script src="js/common.js"></script>', 1)
        # no-JS: notice, navigation, footer
        s = re.sub(r'(<body[^>]*>)', r'\1\n<noscript><div class="noscript-banner">Some interactive features (search, filters, the map) need JavaScript. '
                   r'The main content below is still available.</div></noscript>', s, count=1)
        s = s.replace('<header id="site-header"></header>', '<header id="site-header">%s</header>' % self.static_nav(), 1)
        s = s.replace('<footer class="site-footer" id="site-footer"></footer>',
                      '<footer class="site-footer" id="site-footer"><div class="container"><p>&copy; 2024&ndash;%s NeuraSec Research Group &middot; '
                      '<a href="mailto:neurasec1@gmail.com">neurasec1@gmail.com</a> &middot; <a href="privacy.html">Privacy</a></p></div></footer>'
                      % datetime.date.today().year, 1)
        # static fallbacks inside the containers the scripts fill
        s = self.fill(s, 'pubList', self.pubs_fallback())
        s = self.fill(s, 'teamGroups', self.people_fallback())
        if name == 'news.html':
            s = self.fill(s, 'newsList', self.news_fallback())
        s = self.fill(s, 'partnerList', self.partners_fallback())
        s = self.fill(s, 'toolList', self.tools_fallback())
        # structured data
        ld = self.page_ld(name) if member is None else [self.person_ld(member)]
        if ld:
            s = s.replace('</head>', '  ' + '\n  '.join(jsonld(x) for x in ld) + '\n</head>', 1)
        # static profile pages are the canonical profile URLs
        s = s.replace('<meta name="theme-color"', '<meta name="ns-static" content="1" />\n  <meta name="theme-color"', 1)
        return self.version_urls(s)

    def build_pages(self):
        pages = sorted(f for f in os.listdir(ROOT) if f.endswith('.html'))
        for f in pages:
            src = open(os.path.join(ROOT, f), encoding='utf-8').read()
            if f == 'member.html':
                # legacy query-string URL: keep it working but out of the index; the script redirects to people/<id>.html
                out = self.process_page(f, src, canonical_path='member.html')
                out = out.replace('<meta name="theme-color"', '<meta name="robots" content="noindex" />\n  <meta name="theme-color"', 1)
                open(os.path.join(self.out, f), 'w', encoding='utf-8', newline='\n').write(out)
                template = src
                continue
            out = self.process_page(f, src)
            open(os.path.join(self.out, f), 'w', encoding='utf-8', newline='\n').write(out)
        os.makedirs(os.path.join(self.out, 'people'), exist_ok=True)
        for m in self.S.members:
            self.build_member_page(template, m)
        return len(pages)

    def build_member_page(self, template, m):
        name = display_name(m)
        desc = '%s - %s, %s. Publications, research interests and collaborators in the NeuraSec Research Group.' % (name, m['role'], m['institution'])
        s = template
        s = re.sub(r'<title>.*?</title>', '<title>%s · NeuraSec Research Group</title>' % esc(name), s, count=1)
        s = re.sub(r'<meta name="description" content="[^"]*" />', '<meta name="description" content="%s" />' % esc(desc, quote=True), s, count=1)
        s = re.sub(r'<meta property="og:title" content="[^"]*" />', '<meta property="og:title" content="%s" />' % esc(name + ' · NeuraSec Research Group', quote=True), s, count=1)
        s = re.sub(r'<meta property="og:description" content="[^"]*" />', '<meta property="og:description" content="%s" />' % esc(desc, quote=True), s, count=1)
        if m.get('photo'):
            s = re.sub(r'<meta property="og:image" content="[^"]*" />', '<meta property="og:image" content="%simages/members/%s" />' % (self.url, m['photo']), s, count=1)
            s = s.replace('<meta name="twitter:card" content="summary_large_image" />', '<meta name="twitter:card" content="summary" />')
        s = s.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n  <base href="../" />', 1)
        pubs = [p for p in m['pubs'] if p in self.S.public_pubs()]
        facts = ''.join('<li>%s</li>' % x for x in (esc(m['institution']), esc(m['country']), ('ORCID: <a href="https://orcid.org/%s">%s</a>' % (m['orcid'], m['orcid'])) if m.get('orcid') else '') if x)
        links = ''.join('<li><a href="%s">%s</a></li>' % (esc(v), esc(k.capitalize())) for k, v in m['links'].items())
        body = ('<div class="container"><article class="seo-profile"><h1>%s</h1><p>%s &middot; %s</p><ul class="seo-list">%s%s</ul>%s%s'
                '<p><a href="people.html">&larr; All people</a></p></article></div>') % (
            esc(name), esc(m['role']), esc(self.S.group_title(m['group'])), facts, links,
            ('<h2>Research interests</h2><p>%s</p>' % esc(', '.join(m['expertise']))) if m['expertise'] else '',
            ('<h2>Publications</h2><ol class="seo-list" reversed>%s</ol>' % ''.join(self.pub_li(p) for p in pubs)) if pubs else '')
        s = s.replace('<main id="profile"></main>', '<main id="profile" data-member="%s">%s</main>' % (m['id'], body), 1)
        out = self.process_page('member.html', s, canonical_path='people/%s.html' % m['id'], member=m)
        out = out.replace('<meta name="theme-color"', '<meta name="theme-color"', 1)
        open(os.path.join(self.out, 'people', m['id'] + '.html'), 'w', encoding='utf-8', newline='\n').write(out)

    # ── generated files ──
    def write_sitemap(self):
        urls = ['', 'research.html', 'publications.html', 'people.html', 'network.html', 'news.html', 'join.html', 'contact.html', 'privacy.html']
        urls += [self.profile_href(m) for m in self.S.members]
        rows = ''.join('  <url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n' % (self.url, u, self.today) for u in urls)
        open(os.path.join(self.out, 'sitemap.xml'), 'w', encoding='utf-8', newline=NL).write(
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + rows + '</urlset>\n')
        open(os.path.join(self.out, 'robots.txt'), 'w', newline=NL).write('User-agent: *\nAllow: /\nDisallow: /member.html\n\nSitemap: %ssitemap.xml\n' % self.url)
        return len(urls)

    def write_feed(self):
        items = ''
        for n in self.S.news:
            link = self.url + 'news.html'
            items += ('    <item><title>%s</title><link>%s</link><guid isPermaLink="false">%s-%s</guid><category>%s</category>'
                      '<pubDate>%s</pubDate><description>%s</description></item>\n') % (
                esc(n['text'][:110] + ('…' if len(n['text']) > 110 else '')), link, esc(n['date']), hashlib.md5(n['text'].encode()).hexdigest()[:8],
                esc(n['tag']), month_to_rfc822(n['date']), esc(n['text']))
        open(os.path.join(self.out, 'feed.xml'), 'w', encoding='utf-8', newline=NL).write(
            '<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>NeuraSec Research Group - News</title>\n'
            '    <link>%snews.html</link>\n    <description>News and events from the NeuraSec Research Group.</description>\n'
            '    <language>en</language>\n%s  </channel>\n</rss>\n' % (self.url, items))

    def run(self):
        self.copy_assets()
        if not getattr(self, 'skip_doi_check', False):
            self.check_dois()
        else:
            open(os.path.join(self.out, 'data', 'doi-status.js'), 'w', encoding='utf-8', newline=NL).write('window.NEURASEC_DOI_STATUS = { unregistered: [] };' + NL)
            self.hashes['data/doi-status.js'] = file_hash(os.path.join(self.out, 'data', 'doi-status.js'))
        n = self.build_pages()
        u = self.write_sitemap()
        self.write_feed()
        print('Built %d pages + %d profile pages, %d sitemap URLs -> %s' % (n, len(self.S.members), u, self.out))


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(ROOT, '_site'))
    ap.add_argument('--site-url', default=os.environ.get('SITE_URL') or DEFAULT_URL)
    ap.add_argument('--skip-doi-check', action='store_true', help='do not contact Crossref')
    a = ap.parse_args()
    b = Builder(a.out, a.site_url)
    b.skip_doi_check = a.skip_doi_check
    b.run()
