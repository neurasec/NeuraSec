"""Python port of the data model in js/common.js (author matching, J/C numbering,
member ordering). Used by tools/validate.py and tools/build.py so the static
pages agree with what the browser renders."""
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import jsdata  # noqa: E402

ROOT = os.environ.get('NEURASEC_ROOT') or os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATUS_RANK = {'published': 0, 'accepted': 1, 'review': 2, 'submitted': 3, 'progress': 4}
STATUS_LABEL = {'published': 'Published', 'accepted': 'Accepted', 'review': 'Under review',
                'submitted': 'Submitted', 'progress': 'In progress'}
TYPE_PREFIX = {'journal': 'J', 'conference': 'C', 'chapter': 'B'}
TYPE_LABEL = {'journal': 'Journal article', 'conference': 'Conference paper', 'chapter': 'Book chapter'}


def norm_name(s):
    s = unicodedata.normalize('NFD', str(s))
    s = ''.join(c for c in s if not unicodedata.combining(c)).lower()
    s = re.sub(r'^(dr|prof)\.?\s+', '', s)
    s = re.sub(r'[^a-z\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def iso_from_flag(emoji):
    cps = [ord(c) - 0x1F1E6 for c in (emoji or '')]
    if len(cps) == 2 and all(0 <= n < 26 for n in cps):
        return chr(97 + cps[0]) + chr(97 + cps[1])
    return ''


def display_name(m):
    return (m['prefix'] + ' ' if m.get('prefix') else '') + m['name']


class Site:
    def __init__(self, root=ROOT):
        self.root = root
        d = jsdata.load_site(root)
        self.groups = d['NEURASEC_GROUPS']
        self.news = d.get('NEURASEC_NEWS', [])
        self.partners = d.get('NEURASEC_PARTNERS', [])
        self.tools = d.get('NEURASEC_TOOLS', [])
        self.settings = d.get('NEURASEC_SETTINGS', {})
        members = d['NEURASEC_MEMBERS']
        pubs = d['NEURASEC_PUBLICATIONS']

        self.by_id, self.by_name = {}, {}
        for i, m in enumerate(members):
            m['_order'] = i
            m.setdefault('links', {})
            m.setdefault('expertise', [])
            m.setdefault('tags', [])
            m['pubs'], m['led'] = [], []
            self.by_id[m['id']] = m
            for n in [m['name']] + m.get('aliases', []):
                self.by_name.setdefault(norm_name(n), m)

        for i, p in enumerate(pubs):
            p['_order'] = i
            p.setdefault('keywords', [])
            p['authorMembers'] = [self.by_name.get(norm_name(a)) for a in p['authors']]
            p['leadMember'] = self.by_name.get(norm_name(p['lead'])) if p.get('lead') else None
            p['numbered'] = p['status'] in ('published', 'accepted') and p['type'] in TYPE_PREFIX

        counters = {}
        for p in sorted((p for p in pubs if p['numbered']),
                        key=lambda p: (p['year'], STATUS_RANK[p['status']], -p['_order'])):
            pre = TYPE_PREFIX[p['type']]
            counters[pre] = counters.get(pre, 0) + 1
            p['code'], p['_seq'] = pre + str(counters[pre]), counters[pre]
        for p in pubs:
            p.setdefault('code', None)
            p.setdefault('_seq', 0)

        self.pubs = self.sort_pubs(pubs)
        self.pubs_by_id = {p['id']: p for p in pubs}
        for p in pubs:
            seen = set()
            for m in p['authorMembers']:
                if m and m['id'] not in seen:
                    seen.add(m['id']); m['pubs'].append(p)
            lm = p['leadMember']
            if lm and lm['id'] not in seen:
                lm['led'].append(p)
        for m in members:
            m['pubs'] = self.sort_pubs(m['pubs'])
            m['led'] = self.sort_pubs(m['led'])

        gidx = {g['id']: i for i, g in enumerate(self.groups)}
        by_contrib = {g['id'] for g in self.groups if g.get('sortByContribution')}

        def score(m):
            return sum(2 if p['numbered'] else 1 for p in m['pubs'])

        def peer(m):
            return sum(1 for p in m['pubs'] if p['numbered'])

        self.members = sorted(members, key=lambda m: (
            gidx.get(m['group'], 99),
            -score(m) if m['group'] in by_contrib else 0,
            -peer(m) if m['group'] in by_contrib else 0,
            m['_order']))
        for i, m in enumerate(self.members):
            m['_order'] = i

    @staticmethod
    def sort_pubs(lst):
        return sorted(lst, key=lambda p: (-p['year'], STATUS_RANK[p['status']], -p['_seq'], p['_order']))

    def active(self):
        return [m for m in self.members if m['group'] != 'former']

    def peer_pubs(self):
        return [p for p in self.pubs if p['numbered']]

    def group_title(self, gid):
        return next((g['title'] for g in self.groups if g['id'] == gid), gid)

    def public_pubs(self):
        """Papers shown by default (honours NEURASEC_SETTINGS.defaultPublicationView)."""
        return self.peer_pubs() if self.settings.get('defaultPublicationView', 'peer') == 'peer' else self.pubs
