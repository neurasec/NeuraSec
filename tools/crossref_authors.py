"""Compare the author lists on the site with the published author lists in Crossref.

    python tools/crossref_authors.py

For every paper that has a registered DOI this prints authors that are spelled differently
on the site than in the published record. Use it to keep names consistent (this matters
for Google Scholar and ORCID matching). Informational only.
"""
import difflib
import json
import os
import sys
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import Site, norm_name  # noqa: E402


def crossref_authors(doi):
    req = urllib.request.Request('https://api.crossref.org/works/' + doi,
                                 headers={'User-Agent': 'NeuraSec-site-tools/1.0 (mailto:neurasec1@gmail.com)'})
    msg = json.load(urllib.request.urlopen(req, timeout=25))['message']
    return [(' '.join(x for x in (a.get('given'), a.get('family')) if x) or a.get('name', '')) for a in msg.get('author', [])]


def main():
    S = Site()
    for p in S.pubs:
        if not p.get('doi'):
            continue
        try:
            pub = crossref_authors(p['doi'])
        except urllib.error.HTTPError as e:
            print('%-34s DOI not found in Crossref (%s)' % (p['id'], e.code))
            continue
        site = p['authors']
        print('\n%s  (%d authors on site, %d in Crossref)' % (p['id'], len(site), len(pub)))
        if len(site) != len(pub):
            print('   author COUNT differs')
        for i, (a, b) in enumerate(zip(site, pub)):
            if norm_name(a) != norm_name(b):
                print('   #%d site: %-28s published: %s' % (i + 1, a, b))
        extra = [a for a in pub if norm_name(a) not in {norm_name(x) for x in site}]
        if len(site) == len(pub) and not extra:
            print('   ok')


if __name__ == '__main__':
    main()
