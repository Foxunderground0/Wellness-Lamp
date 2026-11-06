# polish_5nov.py (5 Nov 2026, approved by Rida): the component review's visual changes and the 4-pt spacing pass.
# build_final.py calls apply() on each tab right after its "5 Nov fixes" block.
# WHERE is the record: each change (decision ID or "Spacing"), and the screen ID to see it on.

def _rep(s, old, new, n=1):
    assert s.count(old) == n, (s.count(old), old[:80]); return s.replace(old, new)

WHERE = [
    ("D-4", "Choose stays full ink when its part is off (the line beside it still dims)", "R-1: “Choose a sound” and the scent row’s Choose"),
    ("D-5", "Undo / Redo and the pencil: text-muted #605a53 (were #776e64)", "R-3: Undo / Redo at the bottom; the pencil: FINAL_prototype, Remote → Save a scene, then look at its name"),
    ("D-5", "Cycling: surface-strong fill + outline line (were #d9cebd / #b8ab97)", "FINAL_prototype: Remote, a scene playing → tap Cycle"),
    ("D-5", "Me’s circle: surface-strong on every tab (Home and the Library had surface)", "H-1, L-1 (top right)"),
    ("D-6", "The rename sheet’s field fill: ground (was #fffdf9)", "FINAL_prototype: Library → Saved → ⋯ → Rename"),
    ("D-6", "The in-row field: body 400 (was 500)", "L-4"),
    ("D-6", "The taken line under the in-row field: micro 12 / 500 text-muted (it had the list-heading style)", "L-4b"),
    ("D-7", "Scene view, names over 18 characters: 24 (was 22)", "L-12: swipe to a long name"),
    ("D-7", "Year view, today’s date: 600 (was 700); month tiles: corner 12 (was 14)", "L-7"),
    ("D-7", "Message bar corner: 12 (was 6), Home and the Library", "FINAL_prototype: Home → Check in → Set the scene; Library → a preset → Set the scene"),
    ("D-7", "Choose on the Remote: body-strong 16 (was 14)", "R-1"),
    ("D-14", "A long name on the Remote: the pencil sits after the “…”, never cut off", "FINAL_prototype: Remote → Save a scene with a long name (or rename it)"),
    ("D-15", "The Remote’s Sound screen opens with the current track centred", "R-5, R-5b"),
    ("D-17", "See my mood and Keep going: 24 from each side (were 16)", "FINAL_prototype: Home → Check in → answer to the last card"),
    ("D-18", "H-1’s line 36 below the orb (was 28); Check in 32 below the line (28), so 12 lower in all", "H-1"),
    ("Spacing", "Home: Check in again 32 below the line (528 → 532), so the message bar now sits 4 below it (was 8); “Tonight” 8 above the title (5); sound / scent icons 8 from their text (6); All label 12 from the track (10)", "H-2, H-2b, X-2i"),
    ("Spacing", "Check-in: question 64 below the orb (66); last card: Skip · Next 24 above See my mood (20)", "C-1; FINAL_prototype: Home → Check in → last card"),
    ("Spacing", "Tab bar: icon box padding 8 (6) and the dot slot 4 below it (5), on every tab: the icons sit about 1 lower", "any tab bar"),
    ("D-18", "The check-in’s and the scene view’s top bars: 6 lower, level with Me", "C-1 (dots and ×), L-12 (× and ⋯)"),
    ("D-18", "The connection line ends 4 before Me’s target (it overlapped by 2)", "X-2a to X-2e, X-2j"),
    ("D-21", "Sounds screen, speaker unavailable: no connection line at the top, only the one under the row", "L-13g"),
    ("D-23", "The Remote’s “All” label toggles All too (no visual change)", "R-3: tap the word All"),
    ("Spacing", "Library: heading tabs 12 below the header (10) and 24 apart (20); preset tiles 12 top padding (10), still-to-text 16 (14), icons 4 (5); list headings 16 / 8 (14 / 6)", "L-1, L-2, L-6"),
    ("Spacing", "Library in-row edit: padding 8 / 16 (6 / 14), headings 12 above, 8 below (10 / 6), chips 8 apart (6), Cancel / Save row 16 above (14), button padding 16 (18)", "L-4, L-4b"),
    ("Spacing", "Sounds screen: search 16 below the header (14), tabs 24 apart (20), search icon 16 / 8 (14 / 7), Choose padding 24 (20)", "L-13, L-13b"),
    ("Spacing", "Calendar: 12 bottom padding (10), 16 side padding (18); year view: heading 8 all round, month grid gaps 12 / 16 (10 / 14), tiles 8 8 12 (8 6 10), month name 8 above the grid (6)", "L-6, L-7"),
    ("Spacing", "Empty states: L-9 24 top padding (20); L-5 / L-8 button 16 below the text (18)", "L-5, L-8, L-9"),
    ("Spacing", "Scene view: name slot padding 12 (10), sound / scent icon gaps 8 (6), Save as a scene 8 below Set the scene (6)", "L-12"),
    ("Spacing", "Naming sheet: padding 24 / 32 (26 / 34), title 16 above the field (14), field padding 16 (14), buttons 16 below (18)", "FINAL_prototype: Library → open a preset → Save as a scene"),
    ("Spacing", "Remote: Light to Sound 32 (30), Sound to Scent 24 (21); dot row starts 8 before the margin (9); Cycle padding 16 and icon gap 8 (14 / 6); bottom group gap 8 (6), its button padding 24 (20); All label 12 from the switch (8)", "R-1, R-2, R-3"),
    ("Spacing", "Light / Sound / Scent screens: content 24 below the scene name (20)", "R-4, R-5, R-6"),
    ("Spacing", "Light screen: hint 8 below the wheel (6), dots 16 below the hint (18), Colour range 24 below the dots (22), Varied / Close pulled up 8 (6)", "R-4"),
    ("Spacing", "Sound screen: list 12 below the tabs (10), ends 16 above the player (14); player 16 above the tab bar (14), volume row 8 below it (6); 12 between track name and length (10)", "R-5, R-5b, R-5c"),
    ("Spacing", "Scent rename: hint 8 below the field (6)", "FINAL_prototype: Remote → Scent → ⋯ → Rename, type a taken name"),
    ("D-31", "The naming hint pushes the cards down; the Light heading no longer hides", "R-7b, R-7c"),
]

_CLINE = """.cline{right:64px !important}
.nav.nvn button{gap:4px !important} .nav.nvn .ic{padding:8px 16px !important}
"""

_H = _CLINE + """#home .bottomrow .switch{gap:12px !important}
#home .mainbtn[data-again]{top:532px !important}
#home .label{top:92px !important; line-height:20px !important}
#home .details span{gap:8px !important}
#home .qlayer .q{top:358px !important}
#home .qlayer:has([data-see2]:not([hidden])) .actrow{top:608px !important}
.me span{background:#e4ddcf !important}
.snack{border-radius:12px !important}
.keepbtn{left:24px !important; right:24px !important}
.qlayer .close, .qlayer .dots5{translate:0 6px}
"""

_L = _CLINE + """.me span{background:#e4ddcf !important}
.snack{border-radius:12px !important}
.card5 input{background:#f7f3ea !important}
.edit5 input{font-weight:400 !important}
.list p.nh{font:500 12px/1.333 "Hanken Grotesk",system-ui,sans-serif !important; color:#605a53 !important}
.inside .track button.long{font-size:24px !important}
.ymg i.tn{font-weight:600 !important} .ym{border-radius:12px !important}
.inside .ix, .inside .imore{translate:0 6px}
.st-snd > .cline{display:none !important}
#phrvP .tabs{top:94px !important; gap:24px !important} #phrvP .pane{top:142px !important; height:562px !important}
#phrvP .ogrid.snd10 .ocell:has(.gst){padding-top:12px !important; gap:16px !important} #phrvP .tx10 .sl10{gap:4px !important}
#phrvP .list h4, #phrvP .list .nh{padding-top:16px !important; padding-bottom:8px !important}
#phrvP .srow.editing .edit5{padding-top:8px !important; padding-bottom:16px !important}
#phrvP .edit5 .e5h{margin-top:12px !important; margin-bottom:8px !important} #phrvP .edit5 .e5c{gap:8px !important}
#phrvP .edit5 .e5a{margin-top:16px !important} #phrvP .edit5 .e5a .pill{padding:0 16px !important}
#phrvP .sds5 .q5w{top:98px !important} #phrvP .sds5 .q5w ~ .t5{top:150px !important} #phrvP .sds5 .q5w ~ .l5{top:198px !important}
#phrvP .sds5 .t5{gap:24px !important} #phrvP .sds5 .ok5{padding:0 24px !important} #phrvP .sds5 .q5w svg{margin-left:16px !important; margin-right:8px !important}
#phrvP .ck5{padding-bottom:12px !important} #phrvP .ck5 .cal{padding-left:16px !important; padding-right:16px !important}
#phrvP .yvh{padding:8px !important} #phrvP .yvg{row-gap:12px !important; column-gap:16px !important}
#phrvP .ym{padding:8px 8px 12px !important} #phrvP .ymt{margin-bottom:8px !important}
#phrvP .emo{padding-top:24px !important} #phrvP .empty p{margin-bottom:16px !important}
#phrvP .inside .track button{padding:0 12px !important} #phrvP .inside .snd5{gap:8px !important} #phrvP .inside .idet > span{gap:8px !important}
#phrvP .inside .isave{top:664px !important}
#phrvP .sheet5 .card5{padding-top:24px !important; padding-bottom:32px !important} #phrvP .sheet5 .card5 input{padding:0 16px !important}
#phrvP .sheet5 .card5 h3{margin-bottom:16px !important} #phrvP .sheet5 .card5 .acts{margin-top:16px !important}
"""
_LJS = """setInterval(function(){ document.querySelectorAll(".cline").forEach(function(b){ var r = b.parentElement; if (!r) return;
  r.classList.toggle("st-snd", Array.prototype.some.call(r.querySelectorAll(".sds5"), function(x){ return x.offsetParent && x.getBoundingClientRect().height > 400; })); }); }, 200);
"""

_R = _CLINE + """.ur:not(:disabled){color:#605a53 !important}
.cy2[aria-pressed="true"]{background:#e4ddcf !important; box-shadow:inset 0 0 0 1px #bdb3a4 !important}
.chz{font-size:16px !important; line-height:1.25 !important}
.fl.off-sound .mgtn{opacity:1 !important} .fl.off-sound .mgtn > :not(.chz){opacity:.45}
.fl.off-scent .mgh .chz{opacity:1 !important}
.fl.nh2 .mgh:has([data-tab="Light"]){visibility:visible !important}
.hall2 .alllbl{cursor:pointer}
.fl.mg2s .mg2b > .mgsec{height:32px !important} .fl.mg2s .mg2b > .mgsec ~ .mgsec{height:24px !important}
.fl .btm{pointer-events:none} .fl .btm > *{pointer-events:auto}
.fl.mg2s .crow .dset{margin-left:-8px !important}
.fl .crow .cyb.cy2{padding:0 16px 0 12px !important; gap:8px !important}
.fl .btm{gap:8px !important} .fl .btm .cta{padding:0 24px !important}
.fl .topall .hall2{gap:12px !important}
.ph.scr .pane3{top:124px !important}
#scrLight .hint2{margin-top:8px !important} #scrLight .d8{margin-top:16px !important} #scrLight .rng{margin-top:24px !important} #scrLight .rng .rl2{margin-top:-8px !important}
.scr .tl3{margin-top:12px !important} .scr .tl3:not([style*="max-height"]){max-height:384px !important}
.scr .scfull3.v2{top:584px !important} .scr .scfull3.v2 > div[style*="height:6px"]{height:8px !important}
.scr .tl3 .trow2.k{column-gap:12px !important}
.scr .srow3 .ren3 .nh{margin-top:2px !important}
.fl.mine .hname::after{display:none !important} .fl.mine .stl .hdoor .hname{max-width:190px !important}
.fl.mine .hdoor::after{content:""; flex:none; width:14px; height:14px; margin-left:2px; background:no-repeat center/14px url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23605a53' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'><path d='M13.5 4.5l2 2L7 15H5v-2z'/></svg>")}
"""
_RJS = """(function(){ var was = {};
  setInterval(function(){ document.querySelectorAll(".scr").forEach(function(s){ var on = s.classList.contains("act");
    if (on && !was[s.id]) s.querySelectorAll(".tl3").forEach(function(t){ var r = t.querySelector(".trow2.on"); if (!t.offsetParent || !r) return;
      var a = t.getBoundingClientRect(), b = r.getBoundingClientRect(); t.scrollTop += (b.top - a.top) - (t.clientHeight - b.height) / 2; });
    was[s.id] = on; }); }, 150);
  document.addEventListener("click", function(e){ var l = e.target.closest && e.target.closest(".hall2 .alllbl"); if (!l) return; var s = l.parentElement.querySelector(".switch"); if (s) s.click(); });
  setInterval(function(){ document.querySelectorAll(".fl").forEach(function(ph){ var c = ph.querySelector(".mg2b"); if (!c) return;
    var h = ph.classList.contains("naming") && ph.querySelector(".nmf .nh:not([hidden])"), m = parseFloat(c.style.marginTop) || 0, px = "";
    if (h && h.offsetHeight) { var d = h.getBoundingClientRect().bottom + 8 - (c.getBoundingClientRect().top - m); if (d > 0) px = Math.round(d) + "px"; }
    if (c.style.marginTop !== px) c.style.marginTop = px; }); }, 150); })();
"""

def _end(d, css, js=""):
    i = d.rfind('</body>'); i = len(d) if i < 0 else i
    return d[:i] + '<style>/* 5 Nov polish */\n' + css + '</style>' + ('<script>/* 5 Nov polish */\n' + js + '</script>' if js else '') + d[i:]

def apply(tab, d):
    if tab == "Home":
        d = _rep(d, '<p class="abs line" style="top:468px">A few questions', '<p class="abs line" style="top:476px">A few questions')
        d = _rep(d, 'data-start style="top:544px"', 'data-start style="top:556px"')
        d = _rep(d, 'data-see2 style="left:16px; right:16px; top:', 'data-see2 style="left:24px; right:24px; top:')
        return _end(d, _H)
    if tab == "Library":
        return _end(d, _L, _LJS)
    assert d.count("stroke='%23776e64'") >= 1
    d = d.replace("stroke='%23776e64'", "stroke='%23605a53'")
    return _end(d, _R, _RJS)
