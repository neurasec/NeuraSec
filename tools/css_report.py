"""Report redundant CSS: selectors declared twice in the same context and the declarations of
the earlier rule that the later one overrides (those earlier declarations never apply).

    python tools/css_report.py            # report
    python tools/css_report.py --fix      # remove the dead declarations (keeps the cascade identical)
"""
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(ROOT, 'css', 'neurasec.css')


def strip_comments(s):
    # keep newlines so offsets stay meaningful
    return re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group(0)), s, flags=re.S)


def parse(src):
    """Return rules as dicts: context (tuple of at-rule preludes), selector, start, end (block body span), decls."""
    code = strip_comments(src)
    rules, stack, i, n = [], [], 0, len(code)
    sel_start = 0
    while i < n:
        c = code[i]
        if c == '{':
            prelude = code[sel_start:i].strip()
            if prelude.startswith('@') and not prelude.startswith(('@font-face', '@keyframes', '@view-transition', '@page')):
                stack.append(prelude)               # @media / @supports ...
                sel_start = i + 1
            else:
                depth, j = 1, i + 1
                while depth and j < n:
                    depth += (code[j] == '{') - (code[j] == '}')
                    j += 1
                body_start, body_end = i + 1, j - 1
                rules.append(dict(context=tuple(stack), selector=re.sub(r'\s+', ' ', prelude), start=body_start, end=body_end,
                                  special=prelude.startswith('@')))
                i = j - 1
                sel_start = j
        elif c == '}':
            if stack:
                stack.pop()
            sel_start = i + 1
        elif c == ';' and not stack and False:
            pass
        i += 1
    for r in rules:
        r['decls'] = parse_decls(code[r['start']:r['end']])
    return rules, code


def parse_decls(body):
    out = []
    for part in re.split(r';(?![^(]*\))', body):
        if ':' in part:
            k, v = part.split(':', 1)
            k = k.strip().lower()
            if k:
                out.append((k, v.strip()))
    return out


def main(fix=False):
    src = open(PATH, encoding='utf-8').read()
    rules, code = parse(src)
    seen, report = {}, []
    for idx, r in enumerate(rules):
        if r['special']:
            continue
        key = (r['context'], r['selector'])
        if key in seen:
            report.append((seen[key], idx))
        seen[key] = idx
    imp = [r['selector'] for r in rules if any('!important' in v for _, v in r['decls'])]
    print('%d rules; %d selectors declared again later in the same context; %d rules use !important' % (len(rules), len(report), len(imp)))
    edits = []
    for a, b in report:
        ra, rb = rules[a], rules[b]
        later = {k for k, _ in rb['decls']}
        dead = [(k, v) for k, v in ra['decls'] if k in later and '!important' not in v]
        # a later declaration only overrides if it is not weaker (!important earlier beats later normal)
        print('\n%s  %s' % (' / '.join(ra['context']) or '(top level)', ra['selector']))
        print('   earlier rule: %d decls, %d are overridden later -> dead: %s' % (len(ra['decls']), len(dead), ', '.join(k for k, _ in dead) or '-'))
        if dead:
            edits.append((ra, {k for k, _ in dead}))
    if fix and edits:
        out = src
        for ra, dead_keys in sorted(edits, key=lambda e: -e[0]['start']):
            body = out[ra['start']:ra['end']]
            kept = [p for p in re.split(r'(?<=;)', body) if p.strip() and p.split(':', 1)[0].strip().lower() not in dead_keys]
            new_body = ''.join(kept)
            if not new_body.strip():
                # remove the whole now-empty rule (selector + braces)
                sel_start = out.rfind('}', 0, ra['start']) + 1
                out = out[:sel_start] + out[ra['end'] + 1:]
            else:
                if not new_body.startswith(('\n', ' ')):
                    new_body = ' ' + new_body
                out = out[:ra['start']] + new_body + ('' if new_body.endswith(('\n', ' ')) else ' ') + out[ra['end']:]
        open(PATH, 'w', encoding='utf-8', newline='\n').write(out)
        print('\nremoved dead declarations from %d rules' % len(edits))


if __name__ == '__main__':
    main(fix='--fix' in sys.argv)
