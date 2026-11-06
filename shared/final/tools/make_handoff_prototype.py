"""Build the developer's copy of the prototype (handoff/prototype/FINAL_prototype.html and FINAL_screens.html),
then from it: the icons (design-system/icons/), the grain tile (design-system/grain.png) and the component gallery
(its pictures shot in headless Edge, about 15 minutes).

Same behaviour as final/FINAL_*.html, minus the exploration scaffolding that never shows in the final screens
(Home's variations panel, motion lab, explorations section, the old Remote/Library phones; Library's variant switches),
and with names and dates taken out of code comments. Run it after every build_final.py:

python tools/make_handoff_prototype.py      (from shared/final; needs node 22+, Microsoft Edge, and the app's node_modules for @babel/parser)
"""
import json, os, re, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
FINAL = os.path.abspath(os.path.join(HERE, '..'))
OUT = os.path.join(FINAL, 'handoff', 'prototype')
TOOL = os.path.join(HERE, 'js_statements.js')
emb = lambda s: json.dumps(s).replace('<', '\\u003c')


def rep(s, old, new, n=1):
    c = s.count(old)
    assert c == n, 'expected %d x %r, found %d' % (n, old[:80], c)
    return s.replace(old, new)


def cut_statements(doc, prefixes):
    with tempfile.TemporaryDirectory() as t:
        src, out, pf = (os.path.join(t, n) for n in ('in.html', 'out.html', 'p.txt'))
        open(src, 'w', encoding='utf-8', newline='').write(doc)
        open(pf, 'w', encoding='utf-8', newline='').write(json.dumps(prefixes))
        r = subprocess.run(['node', TOOL, src, 'cutp', out, pf], capture_output=True, text=True)
        if r.returncode: sys.exit(r.stderr)
        print('   ', r.stdout.strip())
        return open(out, encoding='utf-8', newline='').read()


HOME_STMTS = [
    'const REMOTE = SHELL(',
    'const LIBRARY = tab => SHELL(',
    '{ const grp = (title, attr, opts) =>',
    '{ const rm = document.getElementById("rm"), swr =',
    'document.querySelectorAll("#app .phone").forEach(ph => {',
    'document.querySelectorAll(".labph").forEach(',
    '{ const rm = document.getElementById("rm"), appEl =',
    'document.querySelectorAll("[data-test]").forEach(',
]
LIB_STMTS = [
    '(function(){ const ph = document.getElementById("ph3d");',
    '$$("[data-wstart]").forEach(',
    '$$("button[data-layout]").forEach(',
    '$$("button[data-after]").forEach(',
    'const rh = document.getElementById("resethints");',
    'if (rh) rh.addEventListener(',
    '$$("button[data-empty]").forEach(',
    '$$("button[data-wash]").forEach(',
    '$$("button[data-calv]").forEach(',
    '$$("button[data-rows]").forEach(',
    '$$("button[data-mtl]").forEach(',
    '$$("button[data-tiles]").forEach(',
    '$$("button[data-sndl]").forEach(',
    '$$("button[data-sndv]").forEach(',
    '$$("button[data-swipe]").forEach(',
    '$$("button[data-pmode]").forEach(',
    'const sp = document.getElementById("speed");',
    'if (sp) sp.addEventListener(',
    'window.__explore = {',
]


def strip_home(d):
    d = cut_statements(d, HOME_STMTS)
    d = rep(d, """app.innerHTML = '<div class="phone scr" id="home" aria-label="Home">'+HOME+'</div>' +
    '<div class="phone scr" id="rm" aria-label="Remote" hidden>'+REMOTE+'</div>' +
    '<div class="phone scr" id="lib" aria-label="Library" hidden>'+LIBRARY("Presets")+'</div>';""",
            """app.innerHTML = '<div class="phone scr" id="home" aria-label="Home">'+HOME+'</div>';""")
    d = rep(d, 'const SCR = {Home:"home", Remote:"rm", Library:"lib"};', 'const SCR = {Home:"home"};')
    d = rep(d, '\n  <aside id="vars" aria-label="Variations"></aside>', '')
    assert d.count('<style>\n.lx{') == 1
    i = d.index('<style>\n.lx{')
    j = d.index('</script>', d.index('getElementById("lxgrid2")')) + len('</script>')
    block = d[i:j]
    assert block.count('<script') == 2 and block.count('<section class="lx"') == 1, 'explorations block changed shape'
    return d[:i] + d[j:].lstrip('\n')


def strip_library(d):
    return cut_statements(d, LIB_STMTS)


NAME = r'(?:Mahrukh(?: F\d/F\d)?|Rida)'
DATE = r'\b\d{1,2} (?:Sep|Oct|Nov|Dec)\b'


def scrub_comment(c):
    if not re.search(NAME + '|' + DATE + '|full_dev_spec', c): return c
    c = re.sub(r'full_dev_spec(?:\.md)? \u00a77\.\d', 'MOTION.md', c)
    c = re.sub(NAME + r"'s\b", "the designer's", c)
    c = re.sub(r'\bwhich ' + NAME + r' prefers', 'which the designer preferred', c)
    c = re.sub(NAME + r' found\b', 'the designer found', c)
    c = re.sub(NAME + r'\s*:\s*', '', c)
    c = re.sub(r'\s*\+\s*' + NAME, '', c)
    c = re.sub(NAME, '', c)
    c = re.sub(r'(?:decided|range fixed) ' + DATE, lambda m: m.group().split(' ')[0] if m.group().startswith('decided') else 'range fixed', c)
    c = re.sub(DATE + r'(?: v\d| fix)?(?: \(later(?: \d)?\))?', lambda m: m.group()[m.group().index(' ', 3):].replace('(later)', '').replace('(later 2)', '') if re.search(r' v\d| fix', m.group()) else '', c)
    c = re.sub(r', later\b', '', c)
    for _ in range(4):
        c = re.sub(r'\(\s*[,;:+]*\s*\)', '', c)
        c = re.sub(r'\(\s*[,;+]\s*', '(', c)
        c = re.sub(r'\s*[,;+]\s*\)', ')', c)
        c = re.sub(r',\s*,', ',', c)
        c = re.sub(r',\s*;', ';', c)
        c = re.sub(r'(/\*|<!--)\s*[,:;]\s*', r'\1 ', c)
        c = re.sub(r'(?<=\S) +([:;,)])', r'\1', c)
        c = re.sub(r'(?<=[(]) +', '', c)
        c = re.sub(r'(?<=\S)  +(?=\S)', ' ', c)
        c = re.sub(r'(/\*|<!--) {2,}', r'\1 ', c)
        c = re.sub(r'-{10} +-{10}', '-' * 10, c)
    return c


VISIBLE = [(' (decided 2 Nov, option a)', ''), (' (Mahrukh)', ''), (' <small>\u00b7 2 Nov 2026</small>', ''), (' (2 Nov 2026)', ''), (' (29 Oct)', ''),
           ('<code>full_dev_spec.md</code> \u00a71\u20132', '<code>handoff/DATA_AND_RULES.md</code>')]


def scrub(s):
    for a, b in VISIBLE: s = s.replace(a, b)
    return re.sub(r'/\*[\s\S]*?\*/|<!--[\s\S]*?-->', lambda m: scrub_comment(m.group()) if len(m.group()) < 6000 else m.group(), s)


def tabs_span(s):
    i = s.index('const TABS = {')
    docs, spans = {}, {}
    for tab in ('Home', 'Library', 'Remote'):
        p = s.index(tab + ': "', i) + len(tab) + 2
        doc, e = json.JSONDecoder().raw_decode(s, p)
        docs[tab], spans[tab] = doc, (p, e)
    return docs, spans


def build(name, cache):
    s = open(os.path.join(FINAL, name), encoding='utf-8', newline='').read()
    docs, spans = tabs_span(s)
    i, j = s.index('const TABS = {'), max(e for p, e in spans.values())
    mid = s[i:j]
    for tab in sorted(spans, key=lambda t: -spans[t][0]):
        p, e = spans[tab][0] - i, spans[tab][1] - i
        if docs[tab] not in cache:
            print('  ', name, tab)
            d = docs[tab]
            if tab == 'Home': d = strip_home(d)
            if tab == 'Library': d = strip_library(d)
            cache[docs[tab]] = scrub(d)
        mid = mid[:p] + emb(cache[docs[tab]]) + mid[e:]
    s = scrub(s[:i]) + mid + scrub(s[j:])
    os.makedirs(OUT, exist_ok=True)
    open(os.path.join(OUT, name), 'w', encoding='utf-8', newline='').write(s)
    print('  wrote', name, len(s))


cache = {}
for n in ('FINAL_prototype.html', 'FINAL_screens.html'):
    build(n, cache)
subprocess.run([sys.executable, os.path.join(HERE, 'export_icons.py')], check=True)
subprocess.run(['node', os.path.join(HERE, 'export_grain.js')], check=True)
subprocess.run(['node', os.path.join(HERE, 'shoot_gallery.js'), os.path.join(OUT, 'FINAL_screens.html')], check=True)
