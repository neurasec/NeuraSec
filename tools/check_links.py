"""Check that every local file a built page refers to exists.

    python tools/check_links.py _site

Resolves links the way a browser does (including <base href> on profile pages) and
ignores external URLs, mailto: links and data: URIs.
"""
import os
import re
import sys
import urllib.parse


def check(root):
    missing, pages, refs = [], 0, 0
    for dp, _, files in os.walk(root):
        for f in files:
            if not f.endswith('.html'):
                continue
            path = os.path.join(dp, f)
            html = open(path, encoding='utf-8').read()
            pages += 1
            rel_dir = os.path.relpath(dp, root).replace('\\', '/')
            page_url = ('' if rel_dir == '.' else rel_dir + '/') + f
            base_m = re.search(r'<base href="([^"]+)"', html)
            base = urllib.parse.urljoin('http://x/' + page_url, base_m.group(1)) if base_m else 'http://x/' + page_url
            for ref in re.findall(r'(?:src|href)="([^"]+)"', html):
                if re.match(r'(https?:|mailto:|data:|//|javascript:)', ref) or ref.startswith('#'):
                    continue
                refs += 1
                target = urllib.parse.urlparse(urllib.parse.urljoin(base, ref)).path.lstrip('/')
                if target == '' or target.endswith('/'):
                    target += 'index.html'
                if not os.path.exists(os.path.join(root, urllib.parse.unquote(target))):
                    missing.append('%s -> %s' % (page_url, ref))
    return pages, refs, missing


if __name__ == '__main__':
    root = sys.argv[1] if len(sys.argv) > 1 else '_site'
    pages, refs, missing = check(root)
    print('Checked %d pages, %d local references.' % (pages, refs))
    for m in sorted(set(missing)):
        print('MISSING', m)
    print('%d broken reference(s).' % len(set(missing)))
    sys.exit(1 if missing else 0)
