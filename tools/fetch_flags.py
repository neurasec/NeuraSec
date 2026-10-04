"""Download the country flag images the site uses into images/flags/.

Flags are self-hosted so visitors' browsers don't contact a third party. Run this
after adding a member from a new country:

    python tools/fetch_flags.py

Images come from flagcdn.com (free to use). Existing files are left untouched.
"""
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
import jsdata  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'images', 'flags')


def iso_from_flag(emoji):
    cps = [ord(c) - 0x1F1E6 for c in (emoji or '')]
    if len(cps) == 2 and all(0 <= n < 26 for n in cps):
        return chr(97 + cps[0]) + chr(97 + cps[1])
    return ''


def needed_codes():
    data = jsdata.load_site(ROOT)
    return sorted({iso_from_flag(m.get('flag')) for m in data['NEURASEC_MEMBERS']} - {''})


def main():
    os.makedirs(OUT, exist_ok=True)
    for iso in needed_codes():
        path = os.path.join(OUT, iso + '.png')
        if os.path.exists(path):
            continue
        req = urllib.request.Request('https://flagcdn.com/w40/%s.png' % iso, headers={'User-Agent': 'NeuraSec-site-tools/1.0'})
        try:
            data = urllib.request.urlopen(req, timeout=30).read()
        except Exception as e:  # noqa: BLE001
            print('could not fetch', iso, e)
            continue
        open(path, 'wb').write(data)
        print('saved', iso, len(data), 'bytes')


if __name__ == '__main__':
    main()
