#!/usr/bin/env python3
"""Rebuild the single-file apps from their sources.

Each app is an HTML shell (everything outside the single <script>...</script> block, kept from the
existing file in apps/) plus a script that is the concatenation of the source modules listed below,
with the Node-only `module.exports` lines removed. `// @include <file>` lines inside a module are
replaced by that file from src/modules/.

Usage: python3 tools/build_apps.py            # rebuild every app in the manifest
       python3 tools/build_apps.py --check    # exit 1 if any app differs from its sources
"""
import os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOD = os.path.join(ROOT, 'src', 'modules')
EXPORT_RE = re.compile(r'\n?if ?\(typeof module!=="undefined"\) module\.exports=\w+;\n?')
INCLUDE_RE = re.compile(r'^// @include (\S+)\s*$', re.M)

STUDIO = ['src/engine.js', 'src/pathways_v2.js', 'src/modules/data2.js', 'src/modules/docs.js',
          'src/modules/conservatism.js', 'src/modules/studio_app.js']
APPS = {
    # app file: (modules, per-app literal substitutions applied to the assembled script)
    'apps/reference-model-v3.3.html': (STUDIO, {}),
    'apps/transition-studio-pilot.html': (STUDIO, {'const state={version:"v3.3",': 'const state={version:"v3.4",'}),
    'apps/navigator.html': (['src/modules/navdata2.js', 'src/modules/atrf.js', 'src/modules/navapp2.js'], {}),
}


def module(path):
    src = open(os.path.join(ROOT, path), encoding='utf-8').read()
    src = EXPORT_RE.sub('\n', src)
    src = INCLUDE_RE.sub(lambda m: module(os.path.join('src', 'modules', m.group(1))).strip('\n'), src)
    return src.strip('\n')


def script_for(app):
    mods, subs = APPS[app]
    out = '\n' + '\n\n'.join(module(m) for m in mods) + '\n'
    for a, b in subs.items():
        if a not in out:
            raise SystemExit(f'{app}: substitution anchor not found: {a!r}')
        out = out.replace(a, b)
    return out


def split(html):
    i = html.index('<script>') + len('<script>')
    j = html.rindex('</script>')
    return html[:i], html[i:j], html[j:]


def main(check=False):
    dirty = []
    for app in APPS:
        p = os.path.join(ROOT, app)
        head, old, tail = split(open(p, encoding='utf-8').read())
        new = script_for(app)
        if new != old:
            dirty.append(app)
            if not check:
                open(p, 'w', encoding='utf-8').write(head + new + tail)
                print(f'built {app} ({len(new)} script chars)')
        elif not check:
            print(f'up to date {app}')
    if check:
        if dirty:
            print('OUT OF DATE: ' + ', '.join(dirty)); return 1
        print('apps match their sources')
    return 0


if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
