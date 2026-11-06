# export_icons.py: write every icon the app draws to handoff/design-system/icons/<name>.svg, straight from the prototype's markup.
# Each icon is found by a piece of its path data that only it has; colours become currentColor so the app can tint them.
# usage: python export_icons.py   (then build_gallery.py shows them under Foundations)
import json, os, re, sys

T = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(T, '..', 'handoff', 'prototype', 'FINAL_prototype.html')
OUT = os.path.join(T, '..', 'handoff', 'design-system', 'icons')

# name, a piece of the svg only that icon has, size drawn (dp), where it is used
ICONS = [
    ('tab-library',        '<rect x="4" y="8" width="12" height="8" rx="2"/><path d="M5.8 5.5h8.4', 24, 'TabBar: Library'),
    ('tab-home',           'M3.6 9.7c0-.6.3-1.1.7-1.5L9 4.2', 24, 'TabBar: Home'),
    ('tab-remote',         '<circle cx="12" cy="6.5" r="2.2"/><circle cx="8" cy="13.5" r="2.2"/>', 24, 'TabBar: Remote'),
    ('me',                 'M4 16.5c.9-3 3.2-4.6 6-4.6s5.1 1.6 6 4.6', 18, 'MeButton'),
    ('sound',              'M7.4 11.4V2.8l4.4 1.6', 16, 'HomeSceneDetails (16); scene tiles (13)'),
    ('scent',              'M8 2.5c2.5 3 3.5 4.7 3.5 6.5', 16, 'HomeSceneDetails'),
    ('scent-tile',         'M8 2.5c2.2 3 3.6 5 3.6 6.8', 13, 'Library scene tiles and rows'),
    ('checkin-back',       'M13.5 5l-6 6 6 6', 22, 'CheckInTopBar: ‹ previous question'),
    ('checkin-close',      'M5 5l12 12M17 5L5 17', 22, 'CheckInTopBar: × close'),
    ('more',               '<circle cx="4.5" cy="10" r="1.6"/>', 20, 'Saved and check-in rows: ⋯'),
    ('more-scent',         '<circle cx="5" cy="10" r="1.6"/>', 18, 'Scent rows (Remote): ⋯'),
    ('chevron-left',       'M10 3.5L5.5 8 10 12.5', 18, 'Previous month; previous scene in the scene sheet'),
    ('chevron-right',      'M6 3.5L10.5 8 6 12.5', 16, 'Next month; next scene; card heading chevrons; Sound row in the scene editor'),
    ('chevron-down',       'M4 6.5l4 4 4-4', 18, 'Month picker'),
    ('sheet-close',        'M4 4l10 10M14 4L4 14', 20, 'Scene sheet (Library): ×'),
    ('play-small',         'M5 3.6v8.8a.7.7 0 0 0 1.05.6', 14, 'TrackRow play (Sound chooser); scene sheet sound line'),
    ('pause-small',        '<rect x="4" y="3" width="2.6" height="10" rx="1"/>', 14, 'TrackRow while playing'),
    ('pencil',             'M12.8 4.2l3 3L7.5 15.5', 20, 'Rename (Saved row actions, scent row actions)'),
    ('trash',              'M4.5 6h11M8 6V4.5h4V6', 20, 'Delete (Saved row actions)'),
    ('sound-chooser-close', 'M6 6l12 12M18 6 6 18', 20, 'Sound chooser: × (header and search clear)'),
    ('search',             'M15.5 15.5 21 21', 18, 'SoundSearchField'),
    ('brightness',         'M10 2.8v1.8M10 15.4v1.8', 16, 'BrightnessRing: the sun in the opening'),
    ('cycle',              'stroke-linejoin="round" aria-hidden="true"><path d="M14.5 9a5.5', 18, 'CycleKey (turns while cycling)'),
    ('previous-track',     'M17 5.6v10.8a.8.8 0 0 1-1.2.7', 22, 'Track controls: ◀◀'),
    ('next-track',         'M5 5.6v10.8a.8.8 0 0 0 1.2.7', 22, 'Track controls: ▶▶'),
    ('play',               'M7.5 4.9v12.2a.8.8 0 0 0 1.2.7', 22, 'RoundIconButton: play'),
    ('pause',              '<rect x="6.5" y="5" width="3" height="12" rx="1"/>', 22, 'RoundIconButton: pause'),
    ('volume',             'M3 8h2.5L9 5v10l-3.5-3H3z', 22, 'Volume row (replaced by the value while dragging)'),
    ('undo',               'M4.5 10H12a4 4 0 0 1 0 8h-1.5', 20, 'Undo / Redo bar: Undo'),
    ('redo',               'M15.5 10H8a4 4 0 0 0 0 8h1.5', 20, 'Undo / Redo bar: Redo'),
    ('back',               'M12.5 4.5L7 10l5.5 5.5', 22, 'SubScreenHeader: ‹ back to the Remote'),
    ('check',              'M4.5 10.5l3.5 3.5 7.5-8', 20, 'Rename ✓; the current scent\'s tick'),
    ('close',              'M5.5 5.5l9 9M14.5 5.5l-9 9', 20, 'Rename ✕'),
    ('use-original',       'M5 8.5h7.5a3.5 3.5 0 0 1 0 7H9', 20, 'Scent row actions: Use original name'),
    ('pencil-name',        'M13.5 4.5l2 2L7 15H5v-2z', 14, 'After your own scene\'s name on the Remote (text-muted)'),
]

src = open(SRC, encoding='utf-8').read()
i = src.index('const TABS = {'); end = i; docs = []
for tab in ('Home', 'Library', 'Remote'):
    q = src.index(tab + ': "', end) + len(tab) + 2
    d, end = json.JSONDecoder().raw_decode(src, q); docs.append(d.replace('\\"', '"'))
allsvg = [re.sub(r'\s+', ' ', m.group(0)) for d in docs for m in re.finditer(r'<svg\b[\s\S]*?</svg>', d)]
allsvg = [s.replace("'", '"') for s in allsvg]

def clean(s):
    s = s.replace('%23605a53', 'currentColor').replace('%23', '#')
    s = re.sub(r' (?:aria-hidden|class|width|height|xmlns)="[^"]*"', '', s.split('>', 1)[0]) + '>' + s.split('>', 1)[1]
    s = s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1)
    s = re.sub(r'>\s*<', '>\n  <', s)
    return s.replace('\n  </svg>', '\n</svg>') + '\n'

os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.endswith('.svg'): os.remove(os.path.join(OUT, f))
manifest = []
for name, key, size, use in ICONS:
    hits = sorted({s for s in allsvg if key in s.replace("'", '"')})
    if not hits: sys.exit('no icon has %r (%s)' % (key, name))
    if len(hits) > 1: sys.exit('%s: %d different svgs have %r' % (name, len(hits), key))
    svg = clean(hits[0])
    open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8', newline='\n').write(svg)
    manifest.append({'name': name, 'size': size, 'use': use})
json.dump(manifest, open(os.path.join(OUT, 'icons.json'), 'w', encoding='utf-8', newline='\n'), indent=1, ensure_ascii=False)
print('wrote %d icons to %s' % (len(ICONS), os.path.normpath(OUT)))
