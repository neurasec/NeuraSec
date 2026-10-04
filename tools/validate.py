"""Check the site's data and assets before publishing.

    python tools/validate.py            # offline checks (fast, used as a deploy gate)
    python tools/validate.py --online   # also check DOIs against Crossref (warnings only)

Errors stop the deploy. Warnings are reported but never block it.
"""
import difflib
import json
import os
import re
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import ROOT, STATUS_RANK, TYPE_PREFIX, Site, iso_from_flag, norm_name  # noqa: E402

for _s in (sys.stdout, sys.stderr):  # Windows consoles default to a code page that can't print emoji
    if hasattr(_s, 'reconfigure'):
        _s.reconfigure(encoding='utf-8', errors='replace')

GH = os.environ.get('GITHUB_ACTIONS') == 'true'
errors, warnings = [], []


def err(msg, file='data'):
    errors.append(msg)
    print(('::error file=%s::%s' % (file, msg)) if GH else 'ERROR   ' + msg)


def warn(msg, file='data'):
    warnings.append(msg)
    print(('::warning file=%s::%s' % (file, msg)) if GH else 'warning ' + msg)


def orcid_ok(o):
    if not re.fullmatch(r'\d{4}-\d{4}-\d{4}-\d{3}[\dX]', o):
        return False
    d = o.replace('-', '')
    t = 0
    for ch in d[:15]:
        t = (t + int(ch)) * 2
    r = (12 - (t % 11)) % 11
    return ('X' if r == 10 else str(r)) == d[15]


def exists(*parts):
    return os.path.exists(os.path.join(ROOT, *parts))


def main(online=False):
    try:
        S = Site(ROOT)
    except SyntaxError as e:  # e.g. an unescaped apostrophe or a missing comma / bracket
        where = os.path.basename(e.filename or 'data file')
        err('Syntax error in data/%s near line %s. Check for a missing quote, comma or bracket on or just above '
            'that line. (An apostrophe inside a single-quoted string must be written \\\' or the string put in '
            'double quotes.)' % (where, e.lineno), 'data/' + where)
        return finish()
    except Exception as e:  # noqa: BLE001
        err('Could not read the data files: %s: %s' % (type(e).__name__, str(e)[:200]))
        return finish()

    # ── members ──
    seen = set()
    gids = {g['id'] for g in S.groups}
    for m in S.members:
        mid = m['id']
        if mid in seen:
            err('Duplicate member id: %s' % mid, 'data/members.js')
        seen.add(mid)
        for k in ('name', 'group', 'role', 'institution', 'country', 'flag'):
            if not m.get(k):
                err('Member %s is missing "%s"' % (mid, k), 'data/members.js')
        if m.get('group') not in gids:
            err('Member %s has an unknown group "%s"' % (mid, m.get('group')), 'data/members.js')
        if not re.fullmatch(r'[a-z0-9]+(-[a-z0-9]+)*', mid):
            err('Member id "%s" should be lowercase letters, digits and hyphens' % mid, 'data/members.js')
        ph = m.get('photo')
        if ph and not exists('images', 'members', ph):
            err('Photo for %s not found: images/members/%s' % (mid, ph), 'data/members.js')
        if m['group'] != 'former' and not ph:
            warn('%s has no photo (initials are shown instead)' % m['name'], 'data/members.js')
        if m.get('orcid') and not orcid_ok(m['orcid']):
            err('ORCID iD for %s is not valid: %s' % (m['name'], m['orcid']), 'data/members.js')
        if m.get('joined') and not re.fullmatch(r'\d{4}-\d{2}', m['joined']):
            err('"joined" for %s must look like 2026-07' % m['name'], 'data/members.js')
        iso = iso_from_flag(m.get('flag'))
        if not iso:
            err('Member %s: "flag" must be a flag emoji' % mid, 'data/members.js')
        elif not exists('images', 'flags', iso + '.png'):
            err('Flag image missing for %s (%s) - run: python tools/fetch_flags.py' % (m['country'], iso), 'images/flags')
        for url in list(m['links'].values()):
            if not str(url).startswith('https://'):
                warn('%s: link is not https: %s' % (m['name'], url), 'data/members.js')
    names = {}
    for m in S.members:
        for n in [m['name']] + m.get('aliases', []):
            k = norm_name(n)
            if k in names and names[k] != m['id']:
                err('The name "%s" matches two members (%s and %s)' % (n, names[k], m['id']), 'data/members.js')
            names[k] = m['id']
    used_photos = {m.get('photo') for m in S.members}
    if os.path.isdir(os.path.join(ROOT, 'images', 'members')):
        for f in sorted(os.listdir(os.path.join(ROOT, 'images', 'members'))):
            if f not in used_photos:
                warn('Unused photo: images/members/%s' % f, 'images/members')

    # ── publications ──
    ids, titles = set(), set()
    for p in S.pubs:
        pid = p['id']
        if pid in ids:
            err('Duplicate publication id: %s' % pid, 'data/publications.js')
        ids.add(pid)
        t = norm_name(p['title'])
        if t in titles:
            err('Duplicate publication title: %s' % p['title'], 'data/publications.js')
        titles.add(t)
        if p['status'] not in STATUS_RANK:
            err('%s: unknown status "%s"' % (pid, p['status']), 'data/publications.js')
        if p['type'] not in TYPE_PREFIX:
            err('%s: unknown type "%s"' % (pid, p['type']), 'data/publications.js')
        if not isinstance(p['year'], int):
            err('%s: year must be a number' % pid, 'data/publications.js')
        if not p['authors']:
            err('%s: no authors' % pid, 'data/publications.js')
        if p['status'] == 'published' and not (p.get('doi') or p.get('url')):
            err('%s is "published" but has no doi or url' % pid, 'data/publications.js')
        if p.get('doi') and not re.fullmatch(r'10\.\d{4,9}/\S+', p['doi']):
            err('%s: malformed DOI "%s"' % (pid, p['doi']), 'data/publications.js')
        if p['status'] in ('published', 'accepted') and not p.get('venue'):
            err('%s has no venue' % pid, 'data/publications.js')
        for key in ('repo', 'dataset'):
            if p.get(key) and not str(p[key]).startswith('https://'):
                err('%s: "%s" must be an https:// link' % (pid, key), 'data/publications.js')
        if p.get('lead') and not p['leadMember']:
            warn('%s: "lead" (%s) is not a member' % (pid, p['lead']), 'data/publications.js')

    # ── author spelling: near-duplicates among non-members (hurts Scholar / ORCID matching) ──
    un = sorted({a for p in S.pubs for a, m in zip(p['authors'], p['authorMembers']) if not m})
    for i, a in enumerate(un):
        for b in un[i + 1:]:
            na, nb = norm_name(a), norm_name(b)
            if difflib.SequenceMatcher(None, na, nb).ratio() > 0.86 or (na.split()[-1] == nb.split()[-1] and na.split()[0][:3] == nb.split()[0][:3]):
                warn('Author names look like the same person: "%s" and "%s" - use one spelling' % (a, b), 'data/publications.js')

    # ── news / partners / tools ──
    for n in S.news:
        for mid in n.get('members', []):
            if mid not in S.by_id:
                err('News item refers to an unknown member: %s' % mid, 'data/site.js')
        for pid in n.get('publications', []) + ([n['publication']] if n.get('publication') else []):
            if pid not in S.pubs_by_id:
                err('News item refers to an unknown publication: %s' % pid, 'data/site.js')
    used_logos = set()
    for p in S.partners:
        if p.get('logo'):
            used_logos.add(os.path.basename(p['logo']))
            if not os.path.exists(os.path.join(ROOT, p['logo'])):
                err('Logo for %s not found: %s' % (p['name'], p['logo']), 'data/site.js')
        else:
            warn('%s has no logo (initials are shown instead)' % p['name'], 'data/site.js')
        if p.get('url', '').startswith('http://'):
            warn('%s: website link is not https' % p['name'], 'data/site.js')
    if os.path.isdir(os.path.join(ROOT, 'images', 'partners')):
        for f in sorted(os.listdir(os.path.join(ROOT, 'images', 'partners'))):
            if f not in used_logos:
                warn('Unused logo: images/partners/%s' % f, 'images/partners')

    # ── HTML: every local file a page refers to must exist ──
    for f in sorted(x for x in os.listdir(ROOT) if x.endswith('.html')):
        html = open(os.path.join(ROOT, f), encoding='utf-8').read()
        for ref in re.findall(r'(?:src|href)="([^"#?]+)', html):
            if re.match(r'(https?:|mailto:|data:|//)', ref) or ref.startswith('{'):
                continue
            if not os.path.exists(os.path.join(ROOT, ref)):
                err('%s refers to a missing file: %s' % (f, ref), f)

    if online:
        check_dois(S)
    return finish(S)


def check_dois(S):
    print('Checking DOIs against Crossref ...')
    for p in S.pubs:
        if not p.get('doi'):
            continue
        req = urllib.request.Request('https://api.crossref.org/works/' + p['doi'],
                                     headers={'User-Agent': 'NeuraSec-site-validator/1.0 (mailto:neurasec1@gmail.com)'})
        try:
            m = json.load(urllib.request.urlopen(req, timeout=25))['message']
            title = norm_name((m.get('title') or [''])[0])
            if title and difflib.SequenceMatcher(None, title, norm_name(p['title'])).ratio() < 0.8:
                warn('%s: the DOI is registered but its title differs: "%s"' % (p['id'], (m.get('title') or [''])[0][:70]), 'data/publications.js')
        except urllib.error.HTTPError as e:
            if e.code == 404:
                warn('%s: DOI %s is not registered in Crossref (a visitor clicking it will see "DOI not found")' % (p['id'], p['doi']), 'data/publications.js')
        except Exception as e:  # noqa: BLE001
            print('  could not check %s: %s' % (p['doi'], e))


def finish(S=None):
    if S is not None:
        print('\nChecked %d members, %d publications, %d partners.' % (len(S.members), len(S.pubs), len(S.partners)))
    print('%d error(s), %d warning(s).' % (len(errors), len(warnings)))
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main(online='--online' in sys.argv))
