# build_normalised.py (3 Nov 2026, Rida): normalise() holds the design-system token rules (type roles, merged colours,
# warm selected rows); build_final.py applies them to FINAL itself (4 Nov). Spacing is not touched here.
import os, re
HERE = os.path.dirname(os.path.abspath(__file__))
ROLE_LH = {("serif", 34): "1.06", ("serif", 28): "1.143", ("serif", 24): "1.25", ("serif", 20): "1.3", ("serif", 16): "1.25",
           ("sans", 16): None, ("sans", 14): "1.43", ("sans", 13): "1.385", ("sans", 12): "1.333"}
def serif_size(s):
    return 34 if s >= 33 else 28 if s >= 25 else 24 if s >= 21.5 else 20 if s >= 17.5 else 16
def sans_size(s):
    return 16 if s >= 14.75 else 14 if s >= 13.75 else 13 if s >= 12.75 else 12
def role(fam, w, s):
    if fam == "serif":
        n = serif_size(s); return 400, n, ROLE_LH[(fam, n)]
    n = sans_size(s)
    if n == 16:
        if w <= 400: return 400, 16, "1.5"                 # body
        if w >= 600 and s >= 15.75: return 600, 16, "1.25" # heading (16 / 600 stays)
        return 500, 16, "1.25"                             # body-strong: buttons, labels (15 / 600 -> 16 / 500)
    if n == 14: return (400 if w <= 400 else 500), 14, ROLE_LH[("sans", 14)]   # small / small-strong (600 -> 500)
    if n == 13: return (600 if w >= 600 else w), 13, ROLE_LH[("sans", 13)]     # caption 400/500, caption-strong 600
    return (600 if w >= 600 else 500), 12, ROLE_LH[("sans", 12)]               # status 600 (the connection line) / micro 500
FAM = r'(var\(--serif[,)]|var\(--ui[,)]|\\?["\']?(?:Hanken Grotesk|Source Serif 4))'
SH = re.compile(r'(font\s*:\s*)(\d{3})\s+([\d.]+)px(?:/([\d.]+(?:px)?))?(\s+)(?=' + FAM + ')')
FS = re.compile(r'(font-size\s*:\s*)([\d.]+)px')
SKIP_SEL = ('.long', '.x5', '.lab', '.lx', '#vars')
def fam_of(text, i):
    t = text[i:i + 40].lstrip('\\"\' ')
    return "serif" if t.startswith("var(--serif") or t.startswith("Source Serif") else "sans"
def sh_sub(text):
    def f(m):
        fam = fam_of(text, m.end()); w, s = int(m.group(2)), float(m.group(3))
        if fam == "sans" and s >= 20: return m.group(0)                     # icon glyphs (the search field's x)
        if fam == "serif" and s > 36: return m.group(0)
        w2, s2, lh = role(fam, w, s)
        if m.group(4) and not m.group(4).endswith("px"): lh = m.group(4)   # keep a ratio FINAL had tuned (it scales when JS shrinks long names)
        return "%s%d %dpx%s%s" % (m.group(1), w2, s2, ("/" + lh) if lh else "", m.group(5))
    return SH.sub(f, text)
SERIF_MAP = {30: 28, 27: 28, 26: 28, 23: 24, 22: 24, 19: 20, 18: 20}
SANS_MAP = {17: 16, 15: 16, 14.5: 14, 13.5: 14, 12.5: 12, 11: 12, 10: 12}
def fs_sub(text):
    def f(m):
        a = text.rfind("}", 0, m.start()); b = text.rfind("{", 0, m.start())
        sel = text[a + 1:b] if b > a else ""
        if any(k in sel for k in SKIP_SEL): return m.group(0)
        s = float(m.group(2)); n = SERIF_MAP.get(s, SANS_MAP.get(s))
        return m.group(0) if n is None else "%s%gpx" % (m.group(1), n)
    return FS.sub(f, text)
COLOURS = {"#ece5d8": "#ece6da", "#c9c0b0": "#cfc6b6", "#d6cdbe": "#cfc6b6", "#d6cdbd": "#cfc6b6"}
def colours(text):
    for a, b in COLOURS.items(): text = re.sub(re.escape(a), b, text, flags=re.I)
    return text
WARM = re.compile(r'([^{}]*(?:\.r5:has|\.trow2\.on|\.srow3\.on|\.pl5\.on)[^{}]*\{[^{}]*?)rgba\(33,\s*28,\s*23,\s*0?\.0\d+\)')
PRESS = re.compile(r'([^{}]*:active[^{}]*\{[^{}]*?)rgba\(33,\s*28,\s*23,\s*0?\.0[57]\)')
def rows(text):   # selected / playing rows: the warm surface instead of an ink tint (Rida, 4 Nov); pressed = ink 6%
    return PRESS.sub(lambda m: m.group(1) + "rgba(33,28,23,.06)", WARM.sub(lambda m: m.group(1) + "#ece6da", text))
def normalise(doc):
    n0 = len(SH.findall(doc)); doc = rows(colours(fs_sub(sh_sub(doc))))
    return doc.replace("</head>", "<!-- design-system tokens applied (build_normalised.py) --></head>", 1), n0
