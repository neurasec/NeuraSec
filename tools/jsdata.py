"""Read the site's data/*.js files from Python.

The data files are plain JavaScript object literals (comments, unquoted keys,
single-quoted strings, `...spread`, `CONST.prop`). This module converts them to
Python values without needing Node, so the validator and the build script can
share the exact same data the browser uses.
"""
import re

_IDENT = re.compile(r'[A-Za-z_$][\w$]*')


def _scan(src):
    """Strip comments and replace string literals with placeholders."""
    out, strings, i, n = [], [], 0, len(src)
    while i < n:
        c = src[i]
        if c in '\'"':
            j = i + 1
            buf = []
            while j < n and src[j] != c:
                if src[j] == '\\' and j + 1 < n:
                    nxt = src[j + 1]
                    buf.append({'n': '\n', 't': '\t', 'r': '\r'}.get(nxt, nxt))
                    j += 2
                    continue
                buf.append(src[j])
                j += 1
            strings.append(''.join(buf))
            out.append('\x00%d\x00' % (len(strings) - 1))
            i = j + 1
        elif src.startswith('//', i):
            while i < n and src[i] != '\n':
                i += 1
        elif src.startswith('/*', i):
            end = src.index('*/', i + 2) + 2
            out.append('\n' * src.count('\n', i, end))  # keep line numbers accurate for error messages
            i = end
        else:
            out.append(c)
            i += 1
    return ''.join(out), strings


def _to_python(code):
    code = code.replace(';', ' ')
    code = re.sub(r'\b(?:window|const|let|var)\s+', '', code)
    code = re.sub(r'\bwindow\.', '', code)
    code = re.sub(r'\.\.\.\s*([A-Za-z_$][\w$]*)', r'**\1', code)           # spread
    code = re.sub(r'([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)(?!\s*:)', r"\1['\2']", code)   # CONST.prop
    code = re.sub(r'(?<![\w\'"\x00])([A-Za-z_$][\w$]*)\s*:(?!:)', r'"\1":', code)         # unquoted keys
    code = re.sub(r'\btrue\b', 'True', code)
    code = re.sub(r'\bfalse\b', 'False', code)
    code = re.sub(r'\bnull\b', 'None', code)
    return code


def load(path):
    """Return {name: value} for every top-level assignment in a data file."""
    src = open(path, encoding='utf-8').read()
    code, strings = _scan(src)
    code = _to_python(code)
    code = re.sub(r'\x00(\d+)\x00', lambda m: repr(strings[int(m.group(1))]), code)
    ns = {}
    exec(compile(code, path, 'exec'), {}, ns)  # trusted first-party data files
    return ns


def load_site(root='.'):
    import os
    data = {}
    for name in ('members', 'publications', 'site'):
        data.update(load(os.path.join(root, 'data', name + '.js')))
    return data


if __name__ == '__main__':
    d = load_site('.')
    for k, v in d.items():
        print(k, type(v).__name__, len(v) if hasattr(v, '__len__') else '')
