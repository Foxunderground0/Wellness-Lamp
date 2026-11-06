# build_final.py: builds shared/final/ from the decided source files (2 Nov 2026, Library chat).
# Re-run after a source changes:  python build_final.py   (from this folder)
# Output: FINAL_prototype.html (one phone) + FINAL_screens.html (every state), each self-contained.
# Sources: ../phase4_visual/lamp_prototype_v2.html (Home), ../phase4_visual/library_final_merge.html (Library),
#          ../phase4_visual/remote_final.html (the nav), crochet_wash.js (Home's wash, §7.5).
import os, re, json, sys
HERE = os.path.dirname(os.path.abspath(__file__)); P4 = os.path.join(HERE, '..', 'phase4_visual')
sys.path.insert(0, HERE); import connection_layer as CL   # the connection states + "On now" bars (2 Nov)
import states_layer as SL   # 3 Nov: one name rule, the speaker unavailable, this month before its first check-in (STATES_TO_ADD.md)
rd = lambda p: open(p, encoding='utf-8').read()
def rep(s, old, new, n=1):
    assert s.count(old) == n, (s.count(old), old[:80]); return s.replace(old, new)

V2, LIB, RF, WASH = rd(os.path.join(P4, 'lamp_prototype_v2.html')), rd(os.path.join(P4, 'library_final_merge.html')), rd(os.path.join(P4, 'remote_final.html')), rd(os.path.join(HERE, 'crochet_wash.js'))

# ---- the nav, exactly as remote_final.html (nvn: Library · Home · Remote, current in ink, others #605a53) ----
nav = RF[RF.find('<nav class="abs nav nvn">'):RF.find('</nav>', RF.find('<nav class="abs nav nvn">'))]
svgs = re.findall(r'<span class="io">(<svg[\s\S]*?</svg>)</span>', nav); assert len(svgs) == 3
NAVJS = '<script>/* the nav from remote_final.html */ window.__NAVN = function(cur){ var S = %s, T = ["Library","Home","Remote"]; return T.map(function(t, i){ var on = t === cur; return \'<button class="\' + (on ? "on" : "") + \'" data-go="\' + t + \'" aria-label="\' + t + \'"\' + (on ? \' aria-current="page"\' : "") + \'><span class="ic"><span class="io">\' + S[i] + \'</span></span><i class="dt"></i></button>\'; }).join(""); };</script>\n' % json.dumps(svgs)
NAVCSS = """.nav.nvn{left:72px !important; right:72px !important; top:704px; height:80px; display:grid; grid-template-columns:repeat(3,1fr); align-items:center}
.nvn button{display:grid; justify-items:center; align-content:center; gap:5px; min-height:64px; background:none; border:0; padding:0; cursor:pointer; color:#605a53 !important}
.nvn button.on{color:var(--ink, #211c17) !important}
.nvn .ic{display:inline-grid; place-items:center; border-radius:16px; padding:6px 16px} .nvn .ic svg{width:24px; height:24px}
.nvn .dt{width:5px; height:5px; border-radius:50%; background:transparent}
"""
TABBASE = "html,body{margin:0 !important; padding:0 !important; width:360px; height:800px; overflow:hidden !important; background:#f7f3ea !important}\n"
POSTNAV = '<script>/* tab file inside FINAL_prototype.html: nav taps go to the shell */ (function(){ var me = %s; document.addEventListener("click", function(e){ var b = e.target.closest && e.target.closest(".nvn button"); if (!b) return; var to = b.dataset.go || b.getAttribute("aria-label"); if (!to || to === me) return; e.stopPropagation(); e.preventDefault && e.preventDefault(); if (window.parent !== window) window.parent.postMessage({lamp:"nav", to:to}, "*"); }, true); })();</script>\n'

DRAGJS = """<script>/* on a computer, drag a list with the mouse to scroll it, as with a finger on the phone (sliders, text fields, the orb and the scene view's swipe are left alone; a drag never counts as a tap) */
(function(){ var st = null;
  function scroller(el){ while (el && el.nodeType === 1) { var cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) return el; el = el.parentElement; } return null; }
  document.addEventListener("pointerdown", function(e){ if (e.pointerType !== "mouse" || e.button !== 0) return; var t = e.target; if (!t.closest || t.closest("input, textarea, select, [role=slider], canvas, .inside, .rg, .ringbox, [data-scale]")) return; var s = scroller(t); if (s) st = {s: s, y: e.clientY, top: s.scrollTop, moved: false}; }, true);
  document.addEventListener("pointermove", function(e){ if (!st) return; var dy = e.clientY - st.y; if (!st.moved && Math.abs(dy) < 6) return; st.moved = true; st.s.scrollTop = st.top - dy; }, true);
  document.addEventListener("pointerup", function(){ if (!st) return; var m = st.moved; st = null; if (!m) return; var kill = function(ev){ ev.stopPropagation(); ev.preventDefault(); document.removeEventListener("click", kill, true); }; document.addEventListener("click", kill, true); setTimeout(function(){ document.removeEventListener("click", kill, true); }, 60); }, true);
})();
</script>
"""


# ---- decided 2 Nov (Rida): the filled colour is warm charcoal #3B342E (was ink #211C17) for filled buttons, message bars, selected chips and slider dots;
#      the Sounds search bar is S2 (filled #ECE6DA, no border). Applied here as a layer over the sources; text stays ink. ----
FILL = "#3B342E"
# ================= HOME (v2's Home + the crochet wash + the new nav) =================
H = V2
# ---- 3 Nov (Rida): no name in v1: the greeting is "How are you tonight?" (onboarding asks the name in v2)
H = rep(H, 'How are you tonight, Rida?', 'How are you tonight?', n=2)
H = rep(H, '<div class="wash-in" style="--h:115%"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>', '<div class="wash-in" style="--h:115%"><canvas class="cwash" width="72" height="160" aria-hidden="true"></canvas></div>')
H = rep(H, 'function paintWash(){\n    const W = washColours();', 'function paintWash(){\n    const W = washColours();\n    /* final: the crochet-form wash (§7.5): colours 1, 3, 5, 7 of the palette (a Library scene: its 4) */ { const cw = document.querySelector("#home .cwash"); if (cw && window.CrochetWash) { const p = PALETTES[pal].c, c4 = pal === 6 ? p.slice(0, 4) : [p[0], p[2], p[4], p[6]]; if (cw._w) cw._w.recolour(c4); else cw._w = CrochetWash.start(cw, c4); } }')
H = rep(H, """document.querySelectorAll("[data-nav]").forEach(n => { n.innerHTML = ["Remote","Home","Library"].map(t => '<button class="'+(t===(n.dataset.nav||"Home")?'on':'')+'" data-go="'+t+'" aria-label="'+t+'"'+(t===(n.dataset.nav||"Home")?' aria-current="page"':'')+'><span class="ind">'+ICONS[t]+'</span>'+t+'</button>').join(""); });""",
        """document.querySelectorAll("[data-nav]").forEach(n => { n.classList.add("nvn"); n.innerHTML = window.__NAVN(n.dataset.nav || "Home"); });""")
H = rep(H, 'home.querySelector(".bottomrow .when").textContent = on ? "Set at 21:42" : "Off";', 'const wh = home.querySelector(".bottomrow .when"); if (!on) hall._when = wh.textContent; wh.textContent = on ? (hall._when && hall._when !== "Off" ? hall._when : "Set at 21:42") : "Off";')   # final: All back on restores the line it had
# final (2 Nov, Rida): "Check in again" only after a check-in today; a scene set elsewhere without one says "Check in".
#   Check in again starts from a clean Home (pearl orb, wash off), so "reading your answers" and the pearl-to-colours animation play again.
H = rep(H, 'home.querySelector("[data-again]").addEventListener("click", () => { home.querySelector("[data-start]").textContent = "Check in"; startCheckin(); });',
           'home.querySelector("[data-again]").addEventListener("click", () => { resetHome(); startCheckin(); });   /* final: from the pearl orb, so the whole check-in plays again */')
# final: a check-in question changes with a short cross-fade (out .22 s, swap, in .22 s, as the scene view's text swap),
#   not instantly. Next, Skip, Back and Keep going use it; tapping the answer line still repaints at once. Remove animations: instant.
H = rep(H, '  function startCheckin(){ qi = 0;', '''  function turnQ(){
    const els = [ql.querySelector("[data-q]"), ql.querySelector("[data-hint]"), scaleEl];
    if (document.body.classList.contains("reduce") || matchMedia("(prefers-reduced-motion: reduce)").matches) { paintQ(); return; }
    els.forEach(e => { e.style.transition = "opacity .22s ease"; e.style.opacity = "0"; });
    clearTimeout(turnQ._t); turnQ._t = setTimeout(() => { paintQ(); els.forEach(e => { e.style.opacity = "1"; }); }, 220);
  }
  function startCheckin(){ qi = 0;''')
H = rep(H, 'Qs.answer = 0; if (round > 0 || qi < 5) paintQ(); });', 'Qs.answer = 0; if (round > 0 || qi < 5) turnQ(); });')
H = rep(H, 'alt[qi % 5]++; Qs.answer = 0; paintQ(); });', 'alt[qi % 5]++; Qs.answer = 0; turnQ(); });')
H = rep(H, 'if (a) round = a.r; paintQ(); });', 'if (a) round = a.r; turnQ(); });')
H = rep(H, 'round = 1; qi = 5; Qs.answer = 0; paintQ(); });', 'round = 1; qi = 5; Qs.answer = 0; turnQ(); });')
# final: with Remove animations, Undo puts the orb straight back (1.0x, no glow, strands or swirl) instead of the 700 / 300 ms tweens
H = rep(H, 'tween(K+"s", orbS, 1, 700, sineInOut, setScale); tween(K+"f", o.fxP, 0, 700, sineInOut, v => o.fxP = v); tween(K+"t", o.str || 0, 0, 300, sineInOut, v => o.str = v); tween(K+"w", o.swirl, 0, 300, sineInOut, v => o.swirl = v);',
           'if (reduce) { ["s", "f", "t", "w"].forEach(k => tweens.set(K+k, (tweens.get(K+k) || 0) + 1)); setScale(1); o.fxP = 0; o.str = 0; o.swirl = 0; } else { tween(K+"s", orbS, 1, 700, sineInOut, setScale); tween(K+"f", o.fxP, 0, 700, sineInOut, v => o.fxP = v); tween(K+"t", o.str || 0, 0, 300, sineInOut, v => o.str = v); tween(K+"w", o.swirl, 0, 300, sineInOut, v => o.swirl = v); }')
# final: Set the scene on Home works as in the Library's scene view: the button shows "Setting the scene…" (busy) for 0.6 s,
#   then the bloom, the wash and the rest follow from there (Remove animations keeps the 0.6 s). The button gets its label back once it has faded out.
H = rep(H, '(mode === "orb" ? cv : btn).addEventListener("click", e => { if (state === "result") peak(); });',
           '(mode === "orb" ? cv : btn).addEventListener("click", e => { if (state !== "result") return; if (mode === "orb" || !btn) { peak(); return; }\n'
           '      state = "busy"; btn.textContent = "Setting the scene\\u2026"; btn.setAttribute("aria-label", "Setting the scene\\u2026"); btn.disabled = true; btn.setAttribute("aria-busy", "true");\n'
           '      later(() => { peak(); later(() => { btn.disabled = false; btn.removeAttribute("aria-busy"); btn.setAttribute("aria-label", idle); setLabel(idle); }, 450); }, 600); });')
H = rep(H, '  function seeMood(){\n', '  function seeMood(){\n    window.__checkedIn = true; { const a = home.querySelector("[data-again]"); if (a) a.textContent = "Check in again"; }   /* final: a check-in today */\n')
H = rep(H, 'const libScene = (name, line, c4, snd) => { const c = [...c4, ...c4];', 'const libScene = (name, line, c4, snd) => { const c = [...c4, ...c4]; { const a = home.querySelector("[data-again]"); if (a) a.textContent = window.__checkedIn ? "Check in again" : "Check in"; }   /* final: no check-in today = "Check in" */')
H = rep(H, 'const go = t => { Object.values(SCR)', 'const go = t => { if (t !== "Home") { if (window.parent !== window) window.parent.postMessage({lamp:"nav", to:t}, "*"); return; } Object.values(SCR)')
# fewer WebGL orbs: v2's lab phones and its Library-explore script are review-page extras
_k = H.find('{ const LABS = ['); _e = H.find('document.querySelector(".page").after(lab); }', _k) + len('document.querySelector(".page").after(lab); }')
assert _k > 0 and _e > _k; H = H[:_k] + '/* final: lab phones left out */' + H[_e:]
H = rep(H, 'const X = window.__lx; if (!X) return;', 'return; /* final: the Library-explore extras are left out */')
# Home's own Set the scene (the bloom) tells the other tabs which scene is now on
H = rep(H, 'function peak(){\n      state = "set";', 'function peak(){\n      state = "set"; if (ph.id === "home" && window.__homeSet) setTimeout(window.__homeSet, 0);')
H = rep(H, '  window.__libSet = libScene;', '  window.__libSet = libScene;\n  window.__homeSet = () => { if (window.__homeSwc) window.__homeSwc(PALETTES[pal].c[0]); if (window.parent === window) return; const P = PALETTES[pal]; window.parent.postMessage({lamp:"set", n:P.name, line:P.line, snd:(home.querySelector(".hsnd") || {}).textContent, sct:(home.querySelector(".hsct") || {}).textContent, c4:[P.c[0], P.c[2], P.c[4], P.c[6]], c8:P.c}, "*"); };')
HCSS = "<style id=\"final-home\">\n" + TABBASE + """body > section.lab, body > section.lx, #vars, .page .top{display:none !important}
.page{display:block !important; padding:0 !important; margin:0 !important; gap:0 !important} .page > div{display:block !important; margin:0 !important}
.stagewrap{margin:0 !important; width:360px !important; height:800px !important} #device{transform:none !important; left:0 !important; top:0 !important}
#app > #rm, #app > #lib{display:none !important} #app > .phone{border-radius:0 !important; box-shadow:none !important}
/* Home's wash = the crochet form (full_dev_spec.md §7.5, check 4 values: blur 20 px; the bleed in / out stays).
   Opacity .46, and Undo / All off RECEDE over 3 s: the wash only drops to 0 with Remove animations (its .8 s fade);
   otherwise the bleed mask closes it to the edges. */
#home .wash{opacity:.46 !important; filter:none !important} body.reduce #home .wash.off{opacity:0 !important} #home .wash-in{background:none !important}
/* Remove animations removes every Home transition (switch, Set the scene button, fades, message bar); only the wash keeps its .8 s fade */
body.reduce #home *:not(.wash), body.reduce #home *::before, body.reduce #home *::after{transition:none !important}
#home .cwash{position:absolute; inset:0; width:100%; height:100%; filter:blur(20px)}
.pill.filled, .pill.filled.setbtn, .snack{background:@@FILL@@ !important} .scale .knob, .lin .knob{background:@@FILL@@ !important}
/* consistency pass (2 Nov): a screen's main action 52 px; outline pills back to their original 1 px, charcoal kept (Rida, 2 Nov, later) */
/* final (2 Nov): the check-in's progress dots in the filled-button charcoal; Home's All switch in the scene's darker colour */
.dots5 i{box-shadow:inset 0 0 0 1.5px @@FILL@@ !important} .dots5 i.f{background:@@FILL@@ !important}
#home [data-homeall][aria-checked="true"] .track{background:var(--swc, var(--ink)) !important}
/* final (2 Nov): a little more room between "Tonight" and the mood name: the label moves up 6 px (top 94), the title stays at 120 like every Home title; label baseline to the name's capitals = 16 px, close to the Remote's screen title to its line (17 px) */
#home .label{top:94px !important}
#home .pill.outline, #home .mainbtn{border-width:1px !important; height:52px !important; border-color:@@FILL@@ !important}
""".replace("@@FILL@@", FILL) + NAVCSS + "</style>\n"
H = rep(H, '</title>\n', '</title>\n' + NAVJS + '<script>' + WASH + '</script>\n')   # v2 has no <head>: scripts first, styles at the very end
HEND = DRAGJS + POSTNAV % '"Home"' + """<script>/* a scene set in the Library becomes tonight's scene here (v2's own hook, window.__libSet); screens file states via ?state= */
(function(){
  window.addEventListener("message", function(e){ var d = e.data || {}; if (d.lamp !== "set" || !window.__libSet) return; window.__libSet(d.n, d.line, d.c4, d.snd); var s = document.querySelector("#home .hsct"); if (s) s.textContent = d.sct || ""; if (window.__homeSwc) window.__homeSwc((d.c8 || d.c4 || [])[0]); });
  /* final (2 Nov): the All switch is one switch: Home's and the Remote's follow each other */
  (function(){ var hall = document.querySelector("#home [data-homeall]"); if (!hall) return; var quiet = false;
    hall.addEventListener("click", function(){ if (quiet || window.parent === window) return; setTimeout(function(){ window.parent.postMessage({lamp:"all", on: hall.getAttribute("aria-checked") === "true"}, "*"); }, 0); });
    window.addEventListener("message", function(e){ var d = e.data || {}; if (d.lamp !== "all") return; if ((hall.getAttribute("aria-checked") === "true") !== !!d.on) { quiet = true; hall.click(); quiet = false; } }); })();
  /* final (2 Nov): Home's All switch takes a darker shade of the scene's own colour */
  window.__homeSwc = function(c){ var v = window.__swc && window.__swc(c); var h = document.getElementById("home"); if (v && h) h.style.setProperty("--swc", v); };
  var st = (location.search.match(/state=([\\w-]+)/) || [])[1]; if (!st) return;
  var home = document.getElementById("home"), tap = function(el){ if (el) el.click(); };
  setTimeout(function(){
    if (st === "checkin") tap(home.querySelector("[data-start]"));
    if (st === "me") tap(home.querySelector(".me"));
    if (st === "set" && window.__libSet) { window.__libSet(%s); var s = home.querySelector(".hsct"); if (s) s.textContent = %s; if (window.__homeSwc) window.__homeSwc("#E8A24A"); }
    if (st === "checkedin" && window.__libSet) { window.__checkedIn = true; window.__libSet(%s); var s3 = home.querySelector(".hsct"); if (s3) s3.textContent = %s; if (window.__homeSwc) window.__homeSwc("#E8A24A"); }
    if (st === "remote" && window.__libSet) { window.__libSet("New scene", "Made on the Remote", ["#0099CC", "#6600AA", "#00AABB", "#7700BB"], "Ambient \u00b7 Fireplace"); var s2 = home.querySelector(".hsct"); if (s2) s2.textContent = "Cosy Cottage"; if (window.__homeSwc) window.__homeSwc("#0099CC"); }
  }, 700);
})();
</script>
"""
# sample for the "scene set" state: Golden Hour with its real 8-colour palette (colours 1, 3, 5, 7)
pal8 = re.search(r'"gold": (\[[^\]]*\])', LIB).group(1); g = eval(pal8)
sct_gold = (re.search(r'gold:\s*"([^"]+)"', LIB[LIB.find('SCENT'):]) or [None, 'Warm Apple Crumble'])[1]
_gold = '"Golden Hour", "Bathed in the day\\u2019s last gold.", %s, "Ambient \\u00b7 Evening birds"' % json.dumps([g[0], g[2], g[4], g[6]])
HEND = HEND % (_gold, json.dumps(sct_gold), _gold, json.dumps(sct_gold))
H = H + '\n' + HCSS + HEND

# ================= LIBRARY (library_final_merge.html's live phone + the new nav) =================
L = LIB
a = L.find('<h1>Library &middot; final design</h1>'); b = L.find('<script>', L.find('id="files"'))
L = L[:a] + '<div class="phone" id="phrvP"></div>\n</div>\n' + L[b:]
L = rep(L, """const NAV = on => '<nav class="abs nav" aria-label="Tabs">' + ["Remote","Home","Library"].map(t => '<button class="' + (t === on ? "on" : "") + '"' + (t === on ? ' aria-current="page"' : "") + '><span class="ind">' + ICON[t] + "</span>" + t + "</button>").join("") + "</nav>";""",
        """const NAV = on => '<nav class="abs nav nvn" aria-label="Tabs">' + window.__NAVN(on) + "</nav>";""")
L = rep(L, 'ph._on = {tab:tab, n:it.n, sub:it.sub};', 'ph._on = {tab:tab, n:it.n, sub:it.sub}; if (window.parent !== window) { const P8 = PAL8[it.k]; window.parent.postMessage({lamp:"set", n:it.n, line:it.line, snd:it.snd, sct:it.sct, c4: P8 ? [P8[0], P8[2], P8[4], P8[6]] : PC[it.k], c8: P8 || null}, "*"); }')
ds = L.find('<script>\n/* opens each state phone'); de = L.find('</script>', ds) + 9; L = L[:ds] + L[de:]
LCSS = "<style id=\"final-library\">\n" + TABBASE + """.wrap{max-width:none !important; padding:0 !important; margin:0 !important}
#phrvP{position:absolute; left:0; top:0; border-radius:0 !important; box-shadow:none !important}
.pill.filled, .inside.cream .iset, .sds5 .ok5, .snack{background:@@FILL@@ !important} .ch5[aria-pressed="true"]{background:@@FILL@@ !important; border-color:@@FILL@@ !important}
.phone[data-sndl] .sds5 .q5w{border:0 !important; background:#ECE6DA !important} .phone[data-sndl] .sds5 .q5w:focus-within{box-shadow:inset 0 0 0 1.5px @@FILL@@}
/* consistency pass (2 Nov): 14 px lines under titles and in rows; a screen's main action 52 px; outline pills back to their original 1 px, charcoal kept (Rida, 2 Nov, later) */
.phone[data-sndl] .sds5 .f5{font:400 14px/1.3 var(--ui) !important} .phone[data-sndl] .sds5 .s5{font-size:14px !important}
.sds5 .ok5{height:52px !important; border-radius:26px !important} .sds5.chg .l5{padding-bottom:92px !important}
.pill.outline{border-width:1px !important; height:52px !important; border-color:@@FILL@@ !important} .ch5[aria-pressed="true"]{border-color:@@FILL@@ !important}
/* the heading tabs match the Remote's scene name (2 Nov, Rida): selected 23 px, its baseline on the Remote's (top 92 + 7.5 = the Remote's 96 + (30 - 23)/2); the selected tab stays 48 px tall */
.tabs button{padding:7.5px 0 17.5px !important} .tabs button[aria-selected="true"]{font-size:23px !important}
""".replace("@@FILL@@", FILL) + NAVCSS + "</style>\n"
L = rep(L, '</head>', LCSS + NAVJS + '</head>')
LEND = DRAGJS + POSTNAV % '"Library"' + r"""<script>/* empty-state buttons go to their tab; screens file states via ?state= */
(function(){
  document.addEventListener("click", function(e){ var g = e.target.closest && e.target.closest(".empty .go"); if (!g || window.parent === window) return; e.stopPropagation(); window.parent.postMessage({lamp:"nav", to: g.textContent === "Check in" ? "Home" : "Remote"}, "*"); }, true);
  var st = (location.search.match(/state=([\w-]+)/) || [])[1]; if (!st) return;
  var tap = function(el){ if (el) el.click(); }, type = function(el, v){ if (!el) return; el.value = v; el.dispatchEvent(new Event("input", {bubbles:true})); };
  var p = function(){ return document.getElementById("phrvP"); }, tab = function(t){ tap(p().querySelector('[data-tab="' + t + '"]')); };
  var row = function(){ return Array.prototype.slice.call(p().querySelectorAll(".srow")).filter(function(r){ return /Friends over/.test(r.textContent); })[0]; };
  var snd = function(){ var all = p().querySelectorAll(".sds5"); for (var k = 0; k < all.length; k++) if (all[k].querySelector(".q5")) return all[k]; return null; };
  var edit = function(){ tab("Saved"); tap(row().querySelector("[data-more]")); tap(p().querySelector('.acts5 [data-act="rename"]')); };
  var sounds = function(){ edit(); tap(p().querySelector('[data-act="sndall"]')); return snd(); };
  var S = {
    saved: function(){ tab("Saved"); }, checkins: function(){ tab("Checkins"); },
    acts: function(){ tab("Saved"); tap(row().querySelector("[data-more]")); }, edit: edit,
    sounds: sounds, chosen: function(){ tap(sounds().querySelector('[data-pick="Music · Slow piano"]')); },
    search: function(){ type(sounds().querySelector(".q5"), "rain"); }, nomatch: function(){ type(sounds().querySelector(".q5"), "harp"); },
    playing: function(){ tap(sounds().querySelectorAll(".pl5")[2]); },
    year: function(){ tab("Checkins"); tap(p().querySelector(".mpick")); }, scene: function(){ tap(p().querySelector("[data-open]")); },
    "empty-saved": function(){ tab("Saved"); p().querySelector('[data-pane="Saved"]').innerHTML = '<div class="empty"><p>Scenes you save live here.</p><button class="pill outline go">Go to Remote</button></div>'; },
    "empty-checkins": function(){ tab("Checkins"); p().querySelector('[data-pane="Checkins"]').innerHTML = '<div class="empty"><p>Each evening&rsquo;s check-in shows up here.</p><button class="pill outline go">Check in</button></div>'; },
    "empty-sounds": function(){ var s = sounds(); tap(s.querySelector('[data-cat="Music"]')); s.querySelector(".l5").innerHTML = '<div class="n5"><p>No tracks here yet.</p></div>'; }
  };
  setTimeout(function(){ try { S[st] && S[st](); } catch (x) { console.error("state " + st, x); } }, 600);
})();
</script>
"""
bi = L.rfind('</body>'); L = L[:bi] + LEND + L[bi:]

# ================= REMOTE (placeholder until remote_final.html is merged) =================
R = """<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Remote (placeholder)</title>
<style>""" + TABBASE + """:root{--ink:#211c17; --mut:#605a53} body{font-family:"Hanken Grotesk",system-ui,sans-serif; color:var(--ink)}
.ph{position:relative; width:360px; height:800px; background:#f7f3ea} .abs{position:absolute}
.status{left:24px; right:20px; top:6px; height:18px; font-size:13px; font-weight:500} h2{left:24px; top:40px; margin:0; font:400 30px/1.15 "Source Serif 4",Georgia,serif}
.msg{left:32px; right:32px; top:300px; text-align:center; font:400 19px/1.4 "Source Serif 4",Georgia,serif} .msg small{display:block; margin-top:12px; font:400 14px/1.45 "Hanken Grotesk",system-ui,sans-serif; color:var(--mut)}
""" + NAVCSS + """</style>""" + NAVJS + """</head><body><div class="ph"><div class="abs status">21:44</div><h2 class="abs">Remote</h2>
<p class="abs msg">The Remote joins this prototype next.<small>Its final design is in phase4_visual/remote_final.html.</small></p>
<nav class="abs nav nvn" aria-label="Tabs"></nav></div>
<script>document.querySelector("nav").innerHTML = window.__NAVN("Remote");</script>""" + POSTNAV % '"Remote"' + "</body></html>"

# ================= REMOTE (remote_final.html's live phones: the Remote, from scratch, Light / Sound / Scent screens) =================
fs = RF.rfind('<section', 0, RF.find('<h2>Flows and states')); ns = RF.find('<script', fs)
RM = RF[:fs] + RF[ns:]   # the 22 stills (embedded jpgs) are left out; no script uses them
# one track catalogue: the Library's (16 Ambient + 12 Music) on the Remote's Sound screens and in its previous / next
SNDL = json.loads(re.search(r'const SNDL = (\{"Ambient": \[[^\]]*\], "Music": \[[^\]]*\]\})', LIB).group(1))
DUR = ["3:02","3:17","3:31","3:38","3:45","4:02","3:50","4:15","3:28","3:40","4:05","5:00","3:12","3:33","3:20","3:55"]
def tlrows(names, playing):
    return ''.join('<button class="trow2 k%s" data-d="%s"><span class="tn">%s</span><span class="tm">%s</span></button>' % (' on' if n == playing else '', DUR[i % len(DUR)], n.replace('&', '&amp;'), DUR[i % len(DUR)]) for i, n in enumerate(names))
RM = re.sub(r'(<div class="tl3" data-l="amb"[^>]*>)[\s\S]*?(</div>)', lambda m: m.group(1) + tlrows(SNDL["Ambient"], "Night rain") + m.group(2), RM)
RM = re.sub(r'(<div class="tl3" data-l="mus"[^>]*>)[\s\S]*?(</div>)', lambda m: m.group(1) + tlrows(SNDL["Music"], None) + m.group(2), RM)
RM = re.sub(r"const AMBN = \[[^\]]*\]", lambda m: "const AMBN = " + json.dumps(SNDL["Ambient"]), RM, count=1)
RM = re.sub(r'const TR = \["Ambient · Night rain"[^\]]*\]', lambda m: "const TR = " + json.dumps(["Ambient · " + n for n in SNDL["Ambient"][:4]], ensure_ascii=False), RM, count=1)
# ---- 3 Nov (Rida): Cycle colours cycled the prototype's default palette (PAL: blue / violet) instead of the scene's own 8 colours.
# The orb now reads the scene's palette: the Light screen's 8 dots when this is the phone the Light screen belongs to
# (window.__flActive, else fl1), otherwise this phone's 4 dots repeated to 8; PAL only if neither exists. Read at most every 300 ms.
SCENEPAL = """const __hex = el => { const c = el && getComputedStyle(el).backgroundColor.match(/\\d+/g); return c ? "#" + c.slice(0, 3).map(v => (+v).toString(16).padStart(2, "0")).join("") : null; };
const scenePal = ph => { const now = performance.now(), m = ph.__spc; if (m && now - m.t < 300) return m.c;
  const own = ph === (window.__flActive || document.getElementById("fl1"));
  let c = own ? [...document.querySelectorAll("#scrLight .d8 .dot i")].map(__hex).filter(Boolean) : [];
  if (c.length < 8) { const c4 = [...ph.querySelectorAll(".crow .dset .dot i")].map(__hex).filter(Boolean); c = c4.length ? Array.from({length: 8}, (_, k) => c4[k % c4.length]) : PAL; }
  c = c.slice(0, 8); ph.__spc = {t: now, c: c}; return c; };
"""
RM = rep(RM, 'const cols = lightOff ? PEARL : (cyc ? PAL : Array(8)', 'const cols = lightOff ? PEARL : (cyc ? scenePal(ph) : Array(8)')
RM = rep(RM, 'let last = performance.now();\nfunction frame(now){', SCENEPAL + 'let last = performance.now();\nfunction frame(now){')
# ---- 3 Nov (Rida): the Remote's play / pause showed Pause even before anything was set (from scratch); no script toggled it.
bi = RM.rfind('</body>'); RM = RM[:bi] + '<script>/* 3 Nov (Rida): the Remote\'s play / pause. From scratch nothing plays until Set the scene, so it shows Play; Set the scene starts the sound (Pause); a tap toggles. */\n(function(){ var PLAY = \'<svg viewBox="0 0 22 22" fill="currentColor" aria-hidden="true"><path d="M7.5 4.9v12.2a.8.8 0 0 0 1.2.7l9.4-6.1a.8.8 0 0 0 0-1.4L8.7 4.2a.8.8 0 0 0-1.2.7z"/></svg>\';\n document.querySelectorAll(".fl").forEach(function(ph){ var b = ph.querySelector(".mgtr .ck:not(.bare)"); if (!b) return; var PAUSE = b.innerHTML;\n  var set = function(on){ b.innerHTML = on ? PAUSE : PLAY; b.setAttribute("aria-label", on ? "Pause" : "Play"); b._on = on; };\n  var pv = function(){ return ph.classList.contains("preview"); }, was = pv(); set(!was);\n  b.addEventListener("click", function(){ set(!b._on); });\n  new MutationObserver(function(){ var p = pv(); if (p !== was) { was = p; set(!p); } }).observe(ph, {attributes:true, attributeFilter:["class"]});\n }); })();</script>' + RM[bi:]
# ---- 3 Nov (Rida): from scratch, All is shown as on any scene (switches Light, Sound and Scent together in the preview; nothing reaches the
# lamp until Set the scene); the Preview tag is gone.
bi = RM.rfind('</body>'); RM = RM[:bi] + '<style id="final-preview-all">.pvtag{display:none !important} .fl.preview:not(.naming) .topall{visibility:visible}</style>' + RM[bi:]
# ---- 3 Nov (Rida): Colour range uses the old app's full range (0-100 %), starting at its 28 % default
RM = rep(RM, 'style="--p:0.45" role="slider" aria-label="Colour range"', 'style="--p:0.28" role="slider" aria-label="Colour range"')
# ---- 3 Nov (Rida): the Remote's empty Sound row said "Choose a sound", Scent's only "Choose" (no room for more); both now say "Choose",
# with the full words for the screen reader.
RM = rep(RM, '<button class="e0 chz" data-pick="sound">Choose a sound</button>', '<button class="e0 chz" data-pick="sound" aria-label="Choose a sound">Choose</button>')
RM = rep(RM, '<button class="e0 chz" data-pick="scent">Choose</button>', '<button class="e0 chz" data-pick="scent" aria-label="Choose a scent">Choose</button>')

RMCSS = '<style id="final-remote">\n' + TABBASE + """body{visibility:hidden}
.livegrid, .livegrid > figure, main, .wrap, section{transform:none !important; filter:none !important; contain:none !important}
.ph{position:fixed !important; left:0 !important; top:0 !important; margin:0 !important; zoom:1 !important; border-radius:0 !important; box-shadow:none !important; visibility:hidden !important; opacity:0 !important; pointer-events:none !important; z-index:1}
.ph.act{visibility:visible !important; opacity:1 !important; pointer-events:auto !important; z-index:5}
.ph.leaving{visibility:visible !important; opacity:1 !important; z-index:4}
.flash{animation:none !important; outline:none !important}
.cta.set:not(:disabled), .snk2{background:@@FILL@@ !important} /* 2 Nov (Rida): the waiting button keeps its own light disabled look */ .lin .knob{background:@@FILL@@ !important}
/* consistency pass (2 Nov): the Library's heading tabs, 56 px rows with 16 px names, one tint for the current row, 14 px second lines, regular title lines, 44 px button in the bottom row */
.scr .sw-seg .seg{display:flex !important; gap:20px; align-items:baseline; padding:0 !important; background:none !important; border-radius:0 !important; margin:4px 0 8px}
.scr .sw-seg .seg button{padding:12px 0 2px !important; min-height:36px; border-radius:0 !important; background:none !important; font:400 16px var(--serif) !important; color:var(--mut) !important}
.scr .sw-seg .seg .on{background:none !important; color:var(--ink) !important; font-size:22px !important; font-weight:400 !important}
.scr .tl3, .scr .slist{margin-left:-8px !important; margin-right:-8px !important}
.scr .tl3 .trow2{min-height:56px !important; padding:0 8px !important; border-radius:12px; font:500 16px var(--ui) !important}
.scr .tl3 .trow2.on{background:rgba(33,28,23,.045) !important} .scr .tl3 .trow2.on .tn{font-weight:500 !important} .scr .tl3 .trow2 .tm{font:400 14px var(--ui) !important; color:var(--mut)}
.scr .srow3.k{padding:0 8px !important; border-radius:12px; border:0 !important} .scr .srow3.on{background:rgba(33,28,23,.045) !important}
.scr .srow3 .sn > span{font:500 16px var(--ui) !important} .scr .srow3.on .sn span{font-weight:500 !important} .scr .srow3 .sn small{font:400 14px var(--ui) !important}
.scrsub{font-weight:400 !important} .cta{height:44px !important; border-radius:22px !important} .cta:not(:disabled){border-color:@@FILL@@ !important} .cta{border-width:1px !important}   /* outline buttons 1 px everywhere, charcoal kept (Rida, 2 Nov, later) */
""".replace("@@FILL@@", FILL) + "/* 2 Nov (Rida): the nav icons sat 2.5 px lower on the Remote than on Home and the Library, so they jumped when switching tabs; the Remote now takes the same nav CSS */\n" + NAVCSS + """.nvn .io{display:block !important} .nvn button{line-height:18px !important}   /* as Home's and the Library's nav (their icon box is 41 px, the Remote's was 36 px) */
/* Remove animations removes every Remote transition too (switch thumb, part dims, button press, orb brightness / Light off) */
@media (prefers-reduced-motion:reduce){ *, *::before, *::after{transition:none !important} }
</style>
"""
# ---- Remote fixes (Rida, 2 Nov, from the prototype):
#   (a) a scene set on Home or in the Library becomes the Remote's new baseline, so switching a part off no longer shows Save
#       (Save only when the palette from the Light screen, the track or the scent changes; switches and the 4 dots never count, spec §1);
#   (b) the Scent screen: the tick and the tint follow the chosen scent (they were fixed on the sample's row), no focus box after a tap,
#       and ⋯ works: Rename (in the row, 30 characters) / Use original name (spec: scent renaming lives here) ----
RM = rep(RM, "const chosen = s => (s.d >= 0 || s.pal > 0) && s.s && s.x;", "const chosen = s => (s.d >= 0 || s.pal > 0 || s.p[0] === 'true') && s.s && s.x;   /* final (2 Nov): the Light switched on counts as a chosen light */")
RM = rep(RM, "<span>Grandma's kitchen</span><small>Cosy Cottage</small>", "<span>Cosy Cottage</span>")
# final (2 Nov, Rida): a scene made from scratch and set on the Remote shows on Home too (and its new name once saved)
RM = rep(RM, "if (st.mode === 'preview') { st.mode = 'live'; say('Set. Your scene is on the lamp.'); paint(); return; }",
             "if (st.mode === 'preview') { st.mode = 'live'; say('Set. Your scene is on the lamp.'); paint(); if (window.__remoteSet) window.__remoteSet(ph); return; }")
RM = rep(RM, "v => { name.textContent = v || 'My scene'; st.saved = true; st.mine = true;", "v => { name.textContent = v || 'My scene'; if (window.__remoteSet) window.__remoteSet(ph, true); st.saved = true; st.mine = true;")
RM = rep(RM, 'aria-label="More for Grandma\'s kitchen"', 'aria-label="More for Cosy Cottage"')
RM = rep(RM, "r.classList.add('on'); r.querySelector('.tm').textContent = 'Playing';", "r.classList.add('on');")
RM = re.sub(r'(<style[^>]*>)([\s\S]*?)(</style>)', lambda m: m.group(1) + m.group(2).replace('#0088BB', 'var(--swc, #0088BB)') + m.group(3), RM)
RM = rep(RM, "name.textContent = empty ? 'Nothing on yet' : 'Quietly In Between'; init(); paint(); };\n  init(); paint();\n});",
             "name.textContent = empty ? 'Nothing on yet' : 'Quietly In Between'; init(); paint(); };\n  ph.__rebase = () => { st = {mode: 'live', saved: true, mine: false}; past = []; future = []; cur = snap(); base = cur; paint(); };   /* final: a scene set elsewhere is the new saved version */\n  init(); paint();\n});")
RMFIX = """<style id="final-remote-fixes">
.scr .spick:focus:not(:focus-visible), .scr .more:focus:not(:focus-visible){outline:none}
.srow3 .acts3{display:flex; align-items:center} .srow3 .ia3{width:44px; height:44px; flex:none; display:grid; place-items:center; border:0; border-radius:50%; background:none; color:var(--ink); cursor:pointer} .srow3 .ia3 svg{width:20px; height:20px} .srow3 .ia3:active{background:rgba(33,28,23,.07)}
.srow3.acts .more{display:none}
.srow3 .ren3{flex:1; min-width:0; display:flex; align-items:center; gap:4px} .srow3 .ren3 input{flex:1; min-width:0; height:40px; border:0; border-bottom:1.5px solid var(--ink); background:none; font:500 16px var(--ui); color:var(--ink); padding:0; border-radius:0; outline:none} .srow3 .ren3 small{font:400 12px var(--ui); color:var(--mut); min-width:34px; text-align:right}
.srow3.renaming .spick, .srow3.renaming .more{display:none}
</style>
<script>/* final: the Scent screen's tick, tint and ⋯ (Rename / Use original name) */
(function(){
  var scr = document.getElementById("scrScent"); if (!scr) return;
  var TICK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg>';
  var PEN = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.8 4.2l3 3L7.5 15.5l-3.6.6.6-3.6z"/></svg>';
  var ORIG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8.5h7.5a3.5 3.5 0 0 1 0 7H9"/><path d="M8 5.5 5 8.5l3 3"/></svg>';
  var OK = TICK.replace('stroke-width="1.8"', 'stroke-width="1.8"'), X = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg>';
  var rows = function(){ return Array.prototype.slice.call(scr.querySelectorAll(".srow3")); };
  var nm = function(r){ return r.querySelector(".sn > span"); }, orig = function(r){ var o = r.querySelector(".sn small"); return o ? o.textContent : nm(r).textContent; };
  function sync(){ rows().forEach(function(r){ var b = r.querySelector(".spick"), on = b.getAttribute("aria-pressed") === "true", t = b.querySelector(":scope > svg");
    r.classList.toggle("on", on); if (on && !t) b.insertAdjacentHTML("beforeend", TICK); if (!on && t) t.remove(); }); }
  window.__syncScent = sync;
  scr.addEventListener("click", function(e){ if (e.target.closest(".spick")) setTimeout(sync, 0); });
  function closeActs(){ rows().forEach(function(r){ r.classList.remove("acts"); var a = r.querySelector(".acts3"); if (a) a.remove(); }); }
  function rename(r){ closeActs(); var cur = nm(r).textContent, o = orig(r);
    r.classList.add("renaming"); var w = document.createElement("span"); w.className = "ren3";
    w.innerHTML = '<input maxlength="30" aria-label="Scent name"><small></small><button class="ia3" data-a="ok" aria-label="Save name">' + OK + '</button><button class="ia3" data-a="x" aria-label="Cancel">' + X + '</button>';
    r.insertBefore(w, r.firstChild); var inp = w.querySelector("input"), cnt = w.querySelector("small"); inp.value = cur;
    var count = function(){ var n = inp.value.length; cnt.textContent = n >= 25 ? n + "/30" : ""; }; count(); inp.addEventListener("input", count);
    var done = function(save){ if (!w.parentNode) return; var v = inp.value.trim(); w.remove(); r.classList.remove("renaming"); if (!save) return; setName(r, v || o, o); };
    w.querySelector('[data-a="ok"]').addEventListener("click", function(){ done(true); }); w.querySelector('[data-a="x"]').addEventListener("click", function(){ done(false); });
    inp.addEventListener("keydown", function(e){ if (e.key === "Enter") done(true); if (e.key === "Escape") done(false); });
    setTimeout(function(){ inp.focus(); inp.select(); }, 0); }
  function setName(r, v, o){ var old = nm(r).textContent, sn = r.querySelector(".sn"), sm = sn.querySelector("small");
    nm(r).textContent = v; if (v === o) { if (sm) sm.remove(); } else { if (!sm) { sm = document.createElement("small"); sn.appendChild(sm); } sm.textContent = o; }
    r.querySelector(".more").setAttribute("aria-label", "More for " + v);
    /* the new name shows on the Remote too (its scent line) */
    Array.prototype.forEach.call(document.querySelectorAll(".fl .mgsn .e1, .fl .mgsn"), function(el){ if (!el.children.length && el.textContent === old) el.textContent = v; }); }
  scr.querySelectorAll(".srow3 .more").forEach(function(m){ m.addEventListener("click", function(e){ e.stopPropagation(); var r = m.closest(".srow3"), was = r.classList.contains("acts"); closeActs(); if (was) return;
    var renamed = !!r.querySelector(".sn small"), a = document.createElement("span"); a.className = "acts3";
    a.innerHTML = '<button class="ia3" data-a="ren" aria-label="Rename ' + nm(r).textContent + '">' + PEN + '</button>' + (renamed ? '<button class="ia3" data-a="orig" aria-label="Use original name, ' + orig(r) + '">' + ORIG + '</button>' : '');
    r.classList.add("acts"); r.appendChild(a);
    a.querySelector('[data-a="ren"]').addEventListener("click", function(){ rename(r); });
    var ob = a.querySelector('[data-a="orig"]'); if (ob) ob.addEventListener("click", function(){ closeActs(); setName(r, orig(r), orig(r)); }); }); });
  document.addEventListener("click", function(e){ if (!e.target.closest(".srow3")) closeActs(); });
  sync();
})();
/* final (2 Nov): the Sound screens mark the playing track with the playing bars before its name; its length stays (Rida: option a) */
setInterval(function(){ document.querySelectorAll(".scr .tl3 .trow2").forEach(function(r){ var tn = r.querySelector(".tn"), q = tn && tn.querySelector(".eqb");
  if (r.classList.contains("on")) { if (tn && !q) tn.insertAdjacentHTML("afterbegin", '<span class="eqb" aria-hidden="true"><i></i><i></i><i></i></span>'); r.setAttribute("aria-label", (tn ? tn.textContent : "") + ", playing"); }
  else if (q) { q.remove(); r.removeAttribute("aria-label"); } }); }, 250);
/* final (2 Nov): switches take a darker shade of the scene's own colour (from its first colour dot) */
setInterval(function(){ if (!window.__swc) return; document.querySelectorAll(".fl").forEach(function(ph){ var i = ph.querySelector(".crow .dset .dot i"); if (!i) return; var v = window.__swc(getComputedStyle(i).backgroundColor); if (v && ph.style.getPropertyValue("--swc") !== v) ph.style.setProperty("--swc", v); }); }, 400);
/* final (2 Nov; range fixed 3 Nov, Rida): Colour range works. Varied (left) to Close (right) = the old app's palette smoothing, 0 to 100 % as in the old app (the knob starts at 0.28, the old default).
   The real app runs the old smoothing algorithm (DATA_AND_RULES 3.6); this prototype only approximates it:
   each of the 8 colours moves toward the first colour (the one picked on the wheel); the Remote's 4 dots follow; letting go counts as a new palette (Save) */
(function(){ var l = document.querySelector("#scrLight .rng .lin"); if (!l) return;
  var S = function(p){ return Math.min(p, .95); }, last = null, dirty = false;
  var rgb = function(c){ var m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c || ""); return m ? [+m[1], +m[2], +m[3]] : null; };
  var dots = function(){ return Array.prototype.slice.call(document.querySelectorAll("#scrLight .d8 .dot i")); };
  function apply(p){ var ds = dots(), cur = ds.map(function(i){ return rgb(getComputedStyle(i).backgroundColor); }); if (!ds.length || cur.some(function(x){ return !x; })) return;
    if (last === null) last = p; var s0 = Math.min(S(last), .95), s1 = S(p), ref = cur[0];
    var out = cur.map(function(c, k){ return k === 0 ? c : c.map(function(v, j){ var raw = (v - s0*ref[j])/(1 - s0); return Math.max(0, Math.min(255, Math.round((1 - s1)*raw + s1*ref[j]))); }); });
    ds.forEach(function(i, k){ i.style.background = "rgb(" + out[k].join(",") + ")"; });
    var ph = window.__flActive || document.getElementById("fl1"); Array.prototype.forEach.call(ph.querySelectorAll(".crow .dset .dot i"), function(e, k){ if (out[k] && !(k === 3 && ph.__slot4 != null)) e.style.background = "rgb(" + out[k].join(",") + ")"; });
    last = p; }
  setInterval(function(){ var p = +l.style.getPropertyValue("--p"); if (isNaN(p) || !l.style.getPropertyValue("--p")) return; if (last === null) { last = p; return; } if (Math.abs(p - last) > .004) { apply(p); dirty = true; } }, 60);
  ["pointerup", "lostpointercapture"].forEach(function(t){ l.addEventListener(t, function(){ setTimeout(function(){ var p = +l.style.getPropertyValue("--p"); if (last !== null && Math.abs(p - last) > .004) apply(p); if (dirty) { dirty = false; var ph = window.__flActive || document.getElementById("fl1"); if (ph.__edit) ph.__edit("pal"); } }, 80); }); });
})();
/* final (2 Nov): a scene set (or saved) on the Remote goes to Home, like one set in the Library */
window.__remoteSet = function(ph, quiet){ if (window.parent === window) return; var q = function(s){ return ph.querySelector(s); };
  var c4 = Array.prototype.map.call(ph.querySelectorAll(".crow .dset .dot i"), function(i){ return getComputedStyle(i).backgroundColor; });
  var c8 = Array.prototype.map.call(document.querySelectorAll("#scrLight .d8 .dot i"), function(i){ return getComputedStyle(i).backgroundColor; });
  var hex = function(c){ var m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c || ""); return m ? "#" + [m[1], m[2], m[3]].map(function(v){ return (+v).toString(16).padStart(2, "0"); }).join("") : c; };
  c4 = c4.map(hex); c8 = c8.length === 8 ? c8.map(hex) : c4.concat(c4);
  var t = q(".mgtn b:not(.e0)"), cat = q(".mgtn small.e1") || q(".mgtn small"), sc = q(".mgsn .e1") || q(".mgsn");
  window.parent.postMessage({lamp:"set", from:"remote", quiet: !!quiet, n: (q(".hname") || {}).textContent || "New scene", line: "Made on the Remote", snd: (cat && cat.textContent ? cat.textContent + " \u00b7 " : "") + (t ? t.textContent : ""), sct: sc ? sc.textContent : "", c4: c4, c8: c8}, "*"); };
/* final (2 Nov): the All switch follows Home's, and tells Home when it changes */
(function(){ var quiet = false;
  document.querySelectorAll(".fl .topall .switch").forEach(function(sw){ sw.addEventListener("click", function(){ if (quiet || window.parent === window) return; setTimeout(function(){ window.parent.postMessage({lamp:"all", on: sw.getAttribute("aria-checked") === "true"}, "*"); }, 0); }); });
  window.addEventListener("message", function(e){ var d = e.data || {}; if (d.lamp !== "all") return; var ph = document.querySelector(".fl.act:not(.preview)") || document.getElementById("fl1"), sw = ph && ph.querySelector(".topall .switch"); if (!sw) return;
    if ((sw.getAttribute("aria-checked") === "true") !== !!d.on) { quiet = true; sw.click(); quiet = false; } }); })();
</script>
"""
RM = rep(RM, '</head>', RMCSS + '</head>')
RMEND = DRAGJS + POSTNAV % '"Remote"' + r"""<script>/* one phone: a heading opens its screen in place, Back returns (on the review page they were side by side) */
(function(){
  var M = {Light:"scrLight", Sound:"scrSound", Scent:"scrScent"}, ALL = ["fl1", "fl2", "scrLight", "scrSound", "scrSound2", "scrScent"];
  var st = window.__STATE || "", base = st === "playing" ? "fl1" : "fl2";   /* the prototype starts with nothing playing: the Remote's empty state */
  /* Light / Sound / Scent slide in from the right over the Remote, and Back slides them out (Android's standard screen transition):
     300 ms, in cubic-bezier(.2,0,0,1), out cubic-bezier(.3,0,1,1). Remove animations: instant. */
  var RMM = matchMedia("(prefers-reduced-motion: reduce)"), slide = null;
  function endSlide(){ if (!slide) return; var s = slide; slide = null; clearTimeout(s.t); s.from.classList.remove("leaving"); s.top.style.zIndex = ""; if (s.a) s.a.cancel(); }
  function show(id){ endSlide(); var from = document.querySelector(".ph.act"), to = document.getElementById(id);
    ALL.forEach(function(k){ var e = document.getElementById(k); if (e) e.classList.toggle("act", k === id); });
    if (!from || !to || from === to || RMM.matches || !to.animate) return;
    var opening = to.classList.contains("scr") && !from.classList.contains("scr"), closing = from.classList.contains("scr") && !to.classList.contains("scr"); if (!opening && !closing) return;
    var top = opening ? to : from; from.classList.add("leaving"); top.style.zIndex = "6";
    var a = top.animate(opening ? [{translate:"100% 0"}, {translate:"0 0"}] : [{translate:"0 0"}, {translate:"100% 0"}], {duration:300, easing: opening ? "cubic-bezier(.2,0,0,1)" : "cubic-bezier(.3,0,1,1)"});
    slide = {from: from, top: top, a: a, t: setTimeout(endSlide, 400)}; a.onfinish = endSlide; }
  show({light:"scrLight", sound:"scrSound", "sound-long":"scrSound2", scent:"scrScent"}[st] || base);
  /* a scene set on Home or in the Library: the Remote shows it playing (name, track, scent, the screens' title lines, the colour dots; the globe keeps its own colours for now) */
  window.addEventListener("message", function(e){ var d = e.data || {}; if (d.lamp !== "set") return; base = "fl1"; var ph = document.getElementById("fl1"); if (!ph) return;
    var q = function(s){ return ph.querySelector(s); }, sp = (d.snd || "").split(" \u00b7 "), cat = sp.length > 1 ? sp[0] : "", trk = sp.length > 1 ? sp[1] : sp[0];
    var n = q(".hname"); if (n) n.textContent = d.n;
    var bs = ph.querySelectorAll(".mgtn b"); for (var i = 0; i < bs.length; i++) if (!bs[i].classList.contains("e0")) { if (trk) bs[i].textContent = trk; break; }
    var tc = q(".mgtn small"); if (tc && cat) tc.textContent = cat; var se = q(".mgsn .e1") || q(".mgsn"); if (se && d.sct) se.textContent = d.sct;
    ph.classList.add("has-sound"); ph.classList.add("has-scent");
    Array.prototype.forEach.call(document.querySelectorAll(".scr .scrsub"), function(p){ p.textContent = d.n; });
    Array.prototype.forEach.call(document.querySelectorAll(".scr .npn, .scr .np b"), function(p){ if (trk) p.textContent = trk; });
    Array.prototype.forEach.call(document.querySelectorAll(".scr .npc"), function(p){ if (cat) p.textContent = cat; });
    Array.prototype.forEach.call(document.querySelectorAll(".scr .tl3 .trow2"), function(r){ var t = r.querySelector(".tn"), on = !!t && t.textContent === trk, tm = r.querySelector(".tm"); if (on) r.classList.add("on"); else r.classList.remove("on"); if (tm) tm.textContent = r.getAttribute("data-d") || ""; });
    Array.prototype.forEach.call(document.querySelectorAll(".scr .srow3"), function(r){ var s = r.querySelector(".sn > span"), on = !!s && s.textContent === d.sct; if (on) r.classList.add("on"); else r.classList.remove("on"); var b = r.querySelector(".spick"); if (b) b.setAttribute("aria-pressed", String(on)); });
    if (d.c8) { Array.prototype.forEach.call(document.querySelectorAll("#scrLight .d8 .dot i"), function(el, k){ if (d.c8[k]) el.style.background = d.c8[k]; }); Array.prototype.forEach.call(ph.querySelectorAll(".crow .dset .dot i"), function(el, k){ if (d.c8[k]) el.style.background = d.c8[k]; }); }
    /* final (2 Nov): a scene that's set turns its parts on, and becomes the Remote's saved version (no Save until its palette, track or scent changes) */
    ["light", "sound", "scent"].forEach(function(k){ var s = ph.querySelector('.switch[data-part="' + k + '"]'); if (s && s.getAttribute("aria-checked") === "false") s.click(); });
    if (window.__syncScent) window.__syncScent(); setTimeout(function(){ if (ph.__rebase) ph.__rebase(); }, 30);
    if (!document.querySelector(".scr.act")) show(base); });
  document.addEventListener("click", function(e){ var t = e.target.closest && e.target.closest("[data-tab]"); var ph = t && t.closest(".ph");
    if (t && ph && !ph.classList.contains("scr") && M[t.dataset.tab]) { base = ph.id; setTimeout(function(){ show(M[t.dataset.tab]); }, 0); return; }
    if (e.target.closest && e.target.closest(".scr .back")) setTimeout(function(){ show(base); }, 0); }, true);   /* capture: remote_final.html's own heading handler stops the click */
})();
</script>
"""
bi = RM.rfind('</body>'); RM = RM[:bi] + RMFIX + RMEND + RM[bi:]

# ---- state for the screens file: read window.__STATE (set when a phone is created) ----
H = rep(H, 'var st = (location.search', 'var st = window.__STATE || (location.search')
L = rep(L, 'var st = (location.search', 'var st = window.__STATE || (location.search')

# ---- the sound icon is a music note (Rida, 2 Nov): the waveform looked like the playing bars that now mark "On now", and the Remote's speaker icon already means volume ----
NOTE = '<path d="M7.4 11.4V2.8l4.4 1.6"/><circle cx="5.4" cy="11.4" r="2"/>'
H = rep(H, '<path d="M3 6v4M6 4v8M9 5.5v5M12 7v2"/>', NOTE, 2)
L = rep(L, '<path d="M3 6v4M6 4v8M9 5.5v5M12 7v2"/>', NOTE)
L = rep(L, '<path d="M3 9.5v-3M6 11V5M9 12.5v-9M12 10V6"/>', NOTE)

# ---- the connection layer (connection_layer.py): the status line beside Me, Set the scene's in-place error, Android's dialogs, "On now" bars in the Library ----
H = H + '\n' + CL.layer("Home")
# ---- the scene view (swipe between scenes, from Presets, Saved and Check-ins), Rida 2 Nov:
#      (1) pressing its orb sinks it, as Home's does (spec §7.4: scale 1 - 0.045 x press, edge sharpens, halo brightens; 14/s in, 7/s out; haptic 8 ms; no scale with Remove animations);
#      (2) the neighbour orbs fade out when a swipe lands (0.45 s, like the names) instead of jumping back and vanishing ----
L = rep(L, '  if (!REDUCE.on) { this.clk += dt; s.spin += dt*s.swirl*0.9; }\n  this.cv.style.transform = "translateX(" + s.dx.toFixed(1) + "px) scale(" + s.scale.toFixed(4) + ")";',
           '  if (!REDUCE.on) { this.clk += dt; s.spin += dt*s.swirl*0.9; }\n  { const pt = this.pressT || 0, pr = this.press || 0; this.press = pr + (pt - pr)*(1 - Math.exp(-(pt > pr ? 14 : 7)*dt)); if (!pt && this.press < 0.002) this.press = 0; }   /* final: Sink (§7.4) */\n  this.cv.style.transform = "translateX(" + s.dx.toFixed(1) + "px) scale(" + (s.scale*(REDUCE.on ? 1 : 1 - 0.045*this.press)).toFixed(4) + ")";')
L = rep(L, '  gl.viewport(0, 0, this.cv.width, this.cv.height); gl.uniform2f(U.uRes, this.cv.width, this.cv.height);',
           '  gl.uniform1f(U.uPress, this.press || 0); gl.viewport(0, 0, this.cv.width, this.cv.height); gl.uniform2f(U.uRes, this.cv.width, this.cv.height);')
L = rep(L, '    settle(); x0 = e.clientX; dx = 0; moved = false;',
           '    settle(); if (O && O.cv) { const r = O.cv.getBoundingClientRect(); if (Math.hypot(e.clientX - (r.left + r.width/2), e.clientY - (r.top + r.height/2)) < r.width*0.46*0.55) { O.pressT = 1; try { navigator.vibrate && navigator.vibrate(8); } catch(_){} } }\n    x0 = e.clientX; dx = 0; moved = false;')
L = rep(L, '    if (!moved) { moved = true; track.style.transition = "none"; rail.style.transition = "none"; ins.classList.add("drag"); if (O) nbShow(true); }',
           '    if (!moved) { moved = true; if (O) { O.pressT = 0; if (rail._rt) railReset(); } track.style.transition = "none"; rail.style.transition = "none"; ins.classList.add("drag"); if (O) nbShow(true); }')
L = rep(L, '  function up(){ if (x0 === null) return;', '  function up(){ if (O) O.pressT = 0; if (x0 === null) return;')
L = rep(L, '  function nbShow(on){ nbs.forEach(c => { c.style.transition = on ? "none" : "opacity .2s"; c.style.opacity = on ? "1" : "0"; }); }',
           '  function nbShow(on){ nbs.forEach(c => { c.style.transition = on ? "opacity .12s ease-out" : "opacity .45s ease"; c.style.opacity = on ? "1" : "0"; }); }\n  function railReset(){ clearTimeout(rail._rt); rail._rt = 0; rail.style.transition = "none"; rail.style.transform = "none"; void rail.offsetWidth; paintNb(); }   /* final: only once the neighbours have faded */')
L = rep(L, 'O.draw(); rail.style.transition = "none"; rail.style.transform = "none"; void rail.offsetWidth; nbShow(false); paintNb(); } };',
           'O.draw(); nbShow(false); clearTimeout(rail._rt); rail._rt = setTimeout(railReset, 470); } };')
L = rep(L, '      if (O) { paintNb(dir, list[idx].k); nbShow(true);', '      if (O && rail._rt) railReset();\n      if (O) { paintNb(dir, list[idx].k); nbShow(true);')
# ---- 3 Nov (Rida): scene-view swipe landed with a blink (the centre still faded out, then the live orb popped back 470 ms later) and the
# outgoing orb vanished at the edge. Now: the live orb fades out as it slides away; on landing the rail resets at once, the live orb (new colours)
# sits in the centre under a copy of the incoming still, which fades out over 0.25 s. Also: the sound line's bars move while it plays (off with
# Remove animations) and its screen-reader label says "on the lamp" (v1 never plays on the phone).
L = rep(L, 'O.draw(); nbShow(false); clearTimeout(rail._rt); rail._rt = setTimeout(railReset, 470); } };', 'O.st.op = 1; O.draw(); { const inc = nbs.find(c => +c.dataset.s === dir), cov = inc && !inc.hidden ? document.createElement("canvas") : null; if (cov) { cov.width = inc.width; cov.height = inc.height; cov.className = inc.className; cov.style.cssText = inc.style.cssText; cov.style.left = (parseFloat(inc.style.left) - dir*NBD) + "px"; cov.style.transition = "none"; cov.style.opacity = "1"; cov.style.zIndex = "5"; cov.style.pointerEvents = "none"; const g = cov.getContext && cov.getContext("2d"); if (g) g.drawImage(inc, 0, 0); rail.appendChild(cov); } nbs.forEach(c => { c.style.transition = "none"; c.style.opacity = "0"; }); railReset(); if (cov) requestAnimationFrame(() => requestAnimationFrame(() => { cov.style.transition = "opacity .25s ease"; cov.style.opacity = "0"; setTimeout(() => cov.remove(), 320); })); } } };')
L = rep(L, 'if (O) { paintNb(dir, list[idx].k); nbShow(true); rail.style.transition = "transform " + dur + "ms " + ease; rail.style.transform = "translateX(" + (-dir*NBD) + "px)"; }', 'if (O) { paintNb(dir, list[idx].k); nbShow(true); rail.style.transition = "transform " + dur + "ms " + ease; rail.style.transform = "translateX(" + (-dir*NBD) + "px)";  { const t0 = performance.now(), D = dur*.6, f = () => { if (!sliding || !O) return; const k = Math.min(1, (performance.now() - t0)/D); O.st.op = 1 - k; if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); } }')
L = rep(L, '\' on this phone">\'', '\' on the lamp">\'')
# the play-preview bars move exactly like every other playing-bars animation (eqb: scaleY .35 to 1)
bi = L.rfind('</body>'); L = L[:bi] + '<style id="final-snd5">.inside .snd5.playing .bars i{transform-origin:bottom; animation:snd5b 1.1s ease-in-out infinite} .inside .snd5.playing .bars i:nth-child(2){animation-delay:-.35s} .inside .snd5.playing .bars i:nth-child(3){animation-delay:-.7s} @keyframes snd5b{0%,100%{transform:scaleY(.35)} 50%{transform:scaleY(1)}} @media (prefers-reduced-motion:reduce){.inside .snd5.playing .bars i{animation:none}}</style>' + L[bi:]
# ---- 3 Nov (Rida): after a drag, release flashed a different-looking orb: the neighbour stills were painted when the view last came to rest,
# then repainted mid-slide. Now they track the live orb's moment while dragging / sliding (nbLive).
L = rep(L, 'if (O) { O.pressT = 0; if (rail._rt) railReset(); } track.style.transition = "none"; rail.style.transition = "none"; ins.classList.add("drag"); if (O) nbShow(true); }', 'if (O) { O.pressT = 0; if (rail._rt) railReset(); } track.style.transition = "none"; rail.style.transition = "none"; ins.classList.add("drag"); if (O) { nbLive(0, null); nbShow(true); } }')
L = rep(L, 'if (O) { paintNb(dir, list[idx].k); nbShow(true);', 'if (O) { nbLive(dir, list[idx].k); nbShow(true);')
L = rep(L, 'paintNb(); }   /* final: only once the neighbours have faded */', 'paintNb(); }   /* final: only once the neighbours have faded */\n /* 3 Nov (Rida): while dragging or sliding, the neighbour stills are repainted every ~50 ms from the live orb\'s own moment, so the incoming still always matches the orb it hands over to (no flash on release) */\n  function nbPaint(){ const dir = nbLive.dir, k = nbLive.k; nbs.forEach(c => { const s = +c.dataset.s, it = (dir === s && k) ? {k:k} : list[idx + s]; c.hidden = !it; if (it) paintStill(c, it.k, O.clk); }); }\n  function nbLive(dir, k){ if (!O) return; nbLive.dir = dir; nbLive.k = k; nbPaint(); if (nbLive.on) return; nbLive.on = true;\n    const tick = () => { if (!O || !(sliding || ins.classList.contains("drag"))) { nbLive.on = false; return; } nbPaint(); setTimeout(() => requestAnimationFrame(tick), 50); }; requestAnimationFrame(tick); }')
# ---- 3 Nov (Rida): a swipe still had a slight "enlarge": the neighbour stills were always drawn at rest (scale 1), while a scene that is On now
# rests in Corona at 1.10; and a drag starting on the orb sank it (Sink) then let it grow back. Now the stills take the state the live orb will have,
# and Sink starts only after ~90 ms of holding still, so a swipe never sinks the orb.
L = rep(L, '{ O.pressT = 1; try { navigator.vibrate && navigator.vibrate(8); } catch(_){} } }', '{ clearTimeout(O._pt); O._pt = setTimeout(() => { if (x0 !== null && !moved) { O.pressT = 1; try { navigator.vibrate && navigator.vibrate(8); } catch(_){} } }, 90); } }')
L = rep(L, 'if (O) { O.pressT = 0; if (rail._rt) railReset(); }', 'if (O) { clearTimeout(O._pt); O.pressT = 0; if (rail._rt) railReset(); }')
L = rep(L, 'function up(){ if (O) O.pressT = 0;', 'function up(){ if (O) { clearTimeout(O._pt); O.pressT = 0; }')
L = rep(L, 'function paintStill(cv, k, clk, crop){', 'function paintStill(cv, k, clk, crop, on){')
L = rep(L, 'STILL.colours(pal8(k)); STILL.rest(false);', 'STILL.colours(pal8(k)); STILL.rest(!!on);')
L = rep(L, 'if (it) paintStill(c, it.k, O.clk); }); }', 'if (it) paintStill(c, it.k, O.clk, undefined, isOn((dir === s && k) ? list[idx] : list[idx + s])); }); }')
# ---- 3 Nov: no Sink in the scene view (the orb there isn't a control; one less behaviour for the dev). Sink stays on Home.
L = rep(L, 'settle(); if (O && O.cv) { const r = O.cv.getBoundingClientRect(); if (Math.hypot(e.clientX - (r.left + r.width/2), e.clientY - (r.top + r.height/2)) < r.width*0.46*0.55) { clearTimeout(O._pt); O._pt = setTimeout(() => { if (x0 !== null && !moved) { O.pressT = 1; try { navigator.vibrate && navigator.vibrate(8); } catch(_){} } }, 90); } }\n    ', 'settle();\n    ')
# ---- 3 Nov (Rida): the On-now ring (preset tiles, calendar, list rows): warm grey #9A9186, 2 px, same size as before (was 1.5 px ink).
bi = L.rfind('</body>'); L = L[:bi] + '<style id="final-onnow-ring">.onnow .orb{outline:2px solid #9A9186 !important} .ckd.onnow, .ck5 .cal .cell.onnow .o, .rec9 .c9.onnow .gs, .rowi.onnow .gs{outline:2px solid #9A9186 !important} .ocell.onnow .gst::after{border:2px solid #9A9186 !important} .phone[data-calv="ring"] .ck5 .cal .cell.onnow{box-shadow:inset 0 0 0 2px #9A9186 !important}</style>' + L[bi:]
# ---- 4 Nov (Rida): the scene view's orb sat 46 dp higher than Home's; it now matches Home (176, centre 180 / 352),
# and its line and sound / scent lines move down with it (the line at 476, as on Home). The name strip and buttons stay.
L = rep(L, '[168, 180, 306]', '[176, 180, 352]')
L = rep(L, '.inside .iorb{left:96px; top:222px; width:168px; height:168px;', '.inside .iorb{left:92px; top:264px; width:176px; height:176px;')
L = rep(L, '.inside .iline{left:32px; right:32px; top:430px;', '.inside .iline{left:32px; right:32px; top:476px;')
L = rep(L, '.inside .idet{left:24px; right:24px; top:470px;', '.inside .idet{left:24px; right:24px; top:516px;')
# ---- 5 Nov (Rida): the scene-view swipe still jumped. (1) Halfway through a slide the text refresh repainted the incoming still as the scene
# after it (or hid it at the end of the list) until the next live repaint. (2) A scene that's On now rests at 1.10, but its still was drawn at 1,
# so it grew 10% on landing. (3) The stills were 200 px images stretched to the orb's 383 px box, so the live orb snapped sharper on landing.
L = rep(L, 'if (O && !sliding) { O.colours(pal8(it.k)); O.rest(isOn(it)); } paintNb();', 'if (O && !sliding) { O.colours(pal8(it.k)); O.rest(isOn(it)); } if (!sliding) paintNb();')
L = rep(L, 'c.hidden = !it; if (it) paintStill(c, it.k, O.clk + .4); }); }',
           'const on = !!it && !(dir === s && k) && isOn(list[idx + s]); c.hidden = !it; c.style.transform = on ? "scale(1.1)" : ""; if (it) paintStill(c, it.k, O.clk + .4, undefined, on); }); }')
L = rep(L, 'c.hidden = !it; if (it) paintStill(c, it.k, O.clk, undefined, isOn((dir === s && k) ? list[idx] : list[idx + s])); }); }',
           'const on = !!it && isOn((dir === s && k) ? list[idx] : list[idx + s]); c.hidden = !it; c.style.transform = on ? "scale(1.1)" : ""; if (it) paintStill(c, it.k, O.clk, undefined, on); }); }')
L = rep(L, 'c.style.width = box + "px"; c.style.height = box + "px"; c.style.left', 'c.width = c.height = Math.round(box*Math.min(window.devicePixelRatio || 1, 2)); c.style.width = box + "px"; c.style.height = box + "px"; c.style.left')
L = rep(L, 'STILL = new LiveOrb(c); if (STILL.gl) STILL.place(96, 0, 0); }', 'STILL = new LiveOrb(c); if (STILL.gl) STILL.place(176, 0, 0); }')
# (4) On landing the incoming still faded out over the live orb for 0.25 s: two see-through glows stacked read as a bigger orb for that moment.
# Now the live orb stays hidden under the still for two frames (so its new colours are drawn), then the two swap in one frame.
L = rep(L, 'if (cov) requestAnimationFrame(() => requestAnimationFrame(() => { cov.style.transition = "opacity .25s ease"; cov.style.opacity = "0"; setTimeout(() => cov.remove(), 320); }));',
           'if (cov) { O.st.op = 0; O.cv.style.opacity = "0"; const me = O; requestAnimationFrame(() => requestAnimationFrame(() => { me.st.op = 1; me.cv.style.opacity = "1"; cov.remove(); })); }')
bi = L.rfind('</body>'); L = L[:bi] + CL.layer("Library") + L[bi:]
# ---- 3 Nov (Rida): the Library's Sounds / Scents choosers (in-row edit) are focused steps: x or Back closes, Choose commits.
# No tab bar while one is open; the screen runs down to the gesture bar, so "Choose [track]" sits 16 px above that.
bi = L.rfind('</body>'); L = L[:bi] + '<style id="final-sds5">.sds5{bottom:16px !important} .phone:has(.sds5:not([hidden])) .nvn{visibility:hidden !important; pointer-events:none !important}</style>' + L[bi:]

bi = RM.rfind('</body>'); RM = RM[:bi] + CL.layer("Remote") + RM[bi:]
# ---- the states layer (states_layer.py, 3 Nov) ----
TAKEN = SL.lib_names(LIB)   # the Remote's taken names until the Library tells it (presets + saved)
RM = rep(RM, "const nameIt = (v, then) => { inp.value = v;", "const nameIt = (v, then) => { ph.__own = st.mine ? v : null; if (!st.mine && window.__freeName) v = window.__freeName(v); inp.value = v;")   # Update / rename your own scene: its current name isn't taken
bi = L.rfind('</body>'); L = L[:bi] + SL.layer("Library", TAKEN) + L[bi:]
bi = RM.rfind('</body>'); RM = RM[:bi] + SL.layer("Remote", TAKEN) + RM[bi:]

# ---- every tab is embedded in the file (no side files): each runs in its own iframe (srcdoc), so Home's and the Library's code never clash ----
# ---- 3 Nov (Rida): Me is a plain person icon in v1 (no name, no initial)
_ME_ICON = '<svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="7" r="3.2"/><path d="M4 16.5c.9-3 3.2-4.6 6-4.6s5.1 1.6 6 4.6"/></svg>'
_me_n = 0
for _nm in ('H', 'L', 'RM'):
    _d = globals()[_nm]; _c = _d.count('aria-label="Me"><span>R</span>'); _me_n += _c
    globals()[_nm] = _d.replace('aria-label="Me"><span>R</span>', 'aria-label="Me"><span>' + _ME_ICON + '</span>')
print('Me buttons -> person icon:', _me_n)
# ---- 4 Nov (Rida): the design-system tokens are applied to FINAL itself:
# the type roles (serif 34/28/24/20/16, sans 16/14/13/12, proportional line heights), merged colours, warm selected rows,
# pressed = ink 6%. The rules live in build_normalised.py (handoff/DESIGN_SYSTEM.md has the tokens); spacing is polish_5nov.py's.
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location('build_normalised', os.path.join(HERE, 'build_normalised.py')); _ds = _ilu.module_from_spec(_spec); _spec.loader.exec_module(_ds)
H, _n1 = _ds.normalise(H); L, _n2 = _ds.normalise(L); RM, _n3 = _ds.normalise(RM)
print('design-system tokens applied: font shorthands rewritten', _n1 + _n2 + _n3)
# ---- 5 Nov (Rida, D-1 / D-2 / D-12 / D-13): after the tokens, so these colours stay as written ----
# D-1  the Remote's switches look like Home's: on = the switch colour with a cream thumb; off = a muted ring and a small muted thumb.
# D-2  one disabled look for every button: label / icon #a39a8f; a filled button's fill and border #ece6da; an outline one's border #cfc6b6; no opacity.
# D-12 brightness stops at 5%.   D-13 message bars stay 5 s; Home's sits directly above its bottom row (588-640), 4 below the main button.
_DIS = """body .pill:disabled{opacity:1 !important; color:#a39a8f !important; cursor:default}
body .pill.filled:disabled, body .pill.filled.setbtn:disabled, body .inside.cream .iset:disabled, body .iset:disabled{background:#ece6da !important; border-color:#ece6da !important; color:#a39a8f !important; opacity:1 !important}
body .pill.outline:disabled{border-color:#cfc6b6 !important}
"""
_HX = _DIS + "#home .snack{top:588px !important}\n"
_LX = _DIS + """body .ck5 .mnav button:disabled, body .ia:disabled, body .srow3 .ia3:disabled{color:#a39a8f !important; opacity:1 !important}
"""
_RX = """body .ph .ur:disabled, body .nmf button:disabled{color:#a39a8f !important; opacity:1 !important; cursor:default}
body .ph .cta:disabled{background:#ece6da !important; border-color:#ece6da !important; color:#a39a8f !important; opacity:1 !important; cursor:default}
.fl .switch.sws[aria-checked="true"] .track{background:var(--swc, #0088BB) !important; box-shadow:none !important}
.fl .switch.sws[aria-checked="true"] .thumb{background:var(--g) !important; box-shadow:none !important}
.fl .switch.sws .thumb svg, .fl .switch.sws .xo, .fl .switch.sws em{display:none !important}
.fl .switch.sws[aria-checked="false"] .track{background:transparent !important; box-shadow:inset 0 0 0 2px var(--mut) !important}
.fl .switch.sm.sws[aria-checked="false"] .track{box-shadow:inset 0 0 0 1.5px var(--mut) !important}
.fl .switch.sws[aria-checked="false"] .thumb{background:var(--mut) !important; transform:translateX(0) scale(.667) !important}
"""
def _css_end(d, css):   # Home's file has no </body>
    i = d.rfind('</body>'); i = len(d) if i < 0 else i
    return d[:i] + '<style>/* 5 Nov fixes */\n' + css + '</style>' + d[i:]
H, L, RM = _css_end(H, _HX), _css_end(L, _LX), _css_end(RM, _RX)
RM = rep(RM, "svg.dataset.v = (d/SW).toFixed(3); drawRing(svg); };", "svg.dataset.v = Math.max(.05, d/SW).toFixed(3); drawRing(svg); };")
RM = rep(RM, "Math.max(1, Math.round(+svg.dataset.v*100)) + '%'", "Math.max(5, Math.round(+svg.dataset.v*100)) + '%'")
H = rep(H, 'setTimeout(() => snack.classList.remove("show"), 4000)', 'setTimeout(() => snack.classList.remove("show"), 5000)')
L = rep(L, 'setTimeout(() => snack.classList.remove("show"), 4000)', 'setTimeout(() => snack.classList.remove("show"), 5000)')
L = rep(L, 'setTimeout(() => s.classList.remove("show"), 4000)', 'setTimeout(() => s.classList.remove("show"), 5000)')
print('5 Nov fixes applied: switch, disabled, brightness 5%, message bar')
# ---- 5 Nov (Rida): "Setting the scene..." is busy, not disabled: the ink tint (ink 8%) with an ink label, not D-2's grey.
# The button carries aria-busy="true" while it waits (connection_layer.py wait(); the Library's own Set the scene below).
_BUSY = """body .pill[aria-busy="true"]:disabled, body .pill.filled.setbtn[aria-busy="true"]:disabled, body .inside.cream .iset[aria-busy="true"]:disabled, body .iset[aria-busy="true"]:disabled, body .ph .cta[aria-busy="true"]:disabled{background:rgba(33,28,23,.08) !important; border-color:transparent !important; color:#211c17 !important; opacity:1 !important; cursor:default}
"""
L = rep(L, 'setb.disabled = true; setb.textContent = "Setting the scene…";', 'setb.disabled = true; setb.setAttribute("aria-busy", "true"); setb.textContent = "Setting the scene…";')
L = rep(L, 'setb.disabled = false; setb.textContent = "Set the scene";', 'setb.disabled = false; setb.removeAttribute("aria-busy"); setb.textContent = "Set the scene";', 2)
H, L, RM = _css_end(H, _BUSY), _css_end(L, _BUSY), _css_end(RM, _BUSY)
# ---- 5 Nov (Rida): the component review's visual changes and the 4-pt spacing pass (polish_5nov.py; WHERE there lists each one) ----
import polish_5nov as PO
H, L, RM = PO.apply('Home', H), PO.apply('Library', L), PO.apply('Remote', RM)
print('5 Nov polish applied:', len(PO.WHERE), 'changes')
# ---- 5 Nov (Rida): the states that existed only in code get their own phones in FINAL_screens (code_states.py) ----
import code_states as CS
def _js_end(d, s):
    i = d.rfind('</body>'); i = len(d) if i < 0 else i
    return d[:i] + s + d[i:]
H, L, RM = _js_end(H, CS.layer('Home')), _js_end(L, CS.layer('Library')), _js_end(RM, CS.layer('Remote'))
emb = lambda s: json.dumps(s).replace('<', '\\u003c')
TABSJS = 'const TABS = {Home: %s, Library: %s, Remote: %s};\n' % (emb(H), emb(L), emb(RM))
WITHSTATE = r"""const NOJUMP = 'var f0 = HTMLElement.prototype.focus; HTMLElement.prototype.focus = function(o){ return f0.call(this, Object.assign({}, o || {}, {preventScroll: true})); }; Element.prototype.scrollIntoView = function(){ var p = this.parentElement; while (p && !(p.scrollHeight > p.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement; if (!p) return; var r = this.getBoundingClientRect(), q = p.getBoundingClientRect(); if (r.top < q.top) p.scrollTop += r.top - q.top; else if (r.bottom > q.bottom) p.scrollTop += r.bottom - q.bottom; };';   /* 3 Nov: a phone here never scrolls the page */
const withState = (doc, o) => { const s = '<script>' + NOJUMP + Object.keys(o).map(k => 'window.' + k + ' = ' + JSON.stringify(o[k]) + ';').join('') + '<\/script>'; const i = doc.indexOf('<head>'); return i >= 0 ? doc.slice(0, i + 6) + s + doc.slice(i + 6) : s + doc; };
"""

# ================= the shell: one big phone =================
SHELL = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Final prototype</title>
<style>
html,body{margin:0; min-height:100%; background:#e8e3da; color:#211c17; font:14px/1.5 "Hanken Grotesk",system-ui,sans-serif}
main{min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; padding:20px 12px; box-sizing:border-box}
.frame{width:360px; height:800px; position:relative; flex:none; background:#f7f3ea; border-radius:36px; box-shadow:0 1px 2px rgba(33,28,23,.10), 0 24px 60px -20px rgba(33,28,23,.38)}
.frame iframe{position:absolute; left:0; top:0; width:360px; height:800px; border:0; display:block; background:#f7f3ea; visibility:hidden; pointer-events:none} .frame iframe.on{visibility:visible; pointer-events:auto}
/* rounded corners drawn on top (nothing clips or scales the frames: WebGL orbs inside clipped, scaled frames can show as white boxes) */
.frame i.cn{position:absolute; width:36px; height:36px; z-index:3; pointer-events:none} .frame i.tl{left:0; top:0; background:radial-gradient(circle at 100% 100%, transparent 35.5px, #e8e3da 36px)} .frame i.tr{right:0; top:0; background:radial-gradient(circle at 0 100%, transparent 35.5px, #e8e3da 36px)}
.frame i.bl{left:0; bottom:0; background:radial-gradient(circle at 100% 0, transparent 35.5px, #e8e3da 36px)} .frame i.br{right:0; bottom:0; background:radial-gradient(circle at 0 0, transparent 35.5px, #e8e3da 36px)}
.note{max-width:620px; margin:0; text-align:center; color:#605a53; font-size:13px}
.top{display:flex; flex-wrap:wrap; gap:36px; align-items:flex-start; margin-top:20px}
.live{display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap}
.ctl{width:250px} .ctlh{font:400 20px/1.25 "Source Serif 4",Georgia,serif; margin:0 0 10px} .ctlp{margin:14px 0 6px; font-size:13.5px; color:#4a443e} .ctln{margin:16px 0 0; font-size:13px; color:#605a53}
.chips{display:flex; flex-wrap:wrap; gap:8px; margin-top:8px} .chips button{min-height:40px; padding:0 14px; border:1px solid #cfc6b8; border-radius:20px; background:transparent; color:#211c17; font:500 13.5px "Hanken Grotesk",system-ui,sans-serif; cursor:pointer}
.chips button[aria-pressed="true"]{background:#3B342E; border-color:#3B342E; color:#f7f3ea}
.flows{margin-top:8px}
.flow{margin:0 0 26px} .flow h3{font:400 20px/1.25 "Source Serif 4",Georgia,serif; margin:0 0 2px} .fl{margin:0 0 10px; font-size:13.5px; color:#4a443e}
.fr{display:flex; align-items:center; gap:8px; flex-wrap:nowrap; margin-bottom:10px; overflow-x:auto; padding-bottom:4px} .fr.ind{padding-left:256px} .fr > .n{flex:none}
.arl{display:grid; justify-items:center; flex:none; color:#8f867b} .arl span{font-size:12px; color:#605a53} .arl i{font-style:normal; font-size:20px; line-height:1}
.n{background:#f7f3ea; border:1px solid #d9d1c4; border-radius:12px; padding:9px 12px; width:220px; box-sizing:border-box; flex:none; font-size:13.5px; line-height:1.35}
.n b{display:block; font-weight:600} .n small{display:block; margin-top:3px; color:#605a53; font-size:12.5px}
.n.sys{background:#eef0f7; border-color:#cfd5e6} .n.ok{border-color:#9fb59a} .n.warn{border-color:#d6b27a} .n.bad{border-color:#d29a86; color:#7c2f17} .n.bad small{color:#7c2f17}
.ar{color:#8f867b; font-size:20px} .br{display:flex; flex-direction:column; gap:8px} .bi{display:flex; align-items:center; gap:8px} .lbl{min-width:112px; text-align:right; font-size:12.5px; color:#605a53}</style></head><body><main>
""" + CL.LIVE + """
<p class="note">Final prototype: Home, Library and Remote, starting with nothing set. Every screen and state: FINAL_screens.html.</p>
</main>
<script>
""" + TABSJS + CL.LIVEJS + """</script></body></html>"""

# ================= screens and flows: the same embedded tabs, each opened in a state; phones load when scrolled to =================
HOMEF = [("Home", "", "Home, tonight", "Before the check-in: the pearl orb, &ldquo;Check in&rdquo;."),
         ("Home", "checkin", "Check-in", "Full screen, no tab bar; one question at a time."),
         ("Home", "set", "A scene set", "Golden Hour set from the Library: the orb, &ldquo;Set at&rdquo;, All on, and the crochet-form wash bleeding in (4.5 s). No check-in today, so the button says &ldquo;Check in&rdquo; (after a check-in: &ldquo;Check in again&rdquo;, which plays the whole check-in again from the pearl orb)."),
         ("Home", "checkedin", "After a check-in", "Tonight&rsquo;s mood set from a check-in: the button says &ldquo;Check in again&rdquo;. It starts from the pearl orb (wash off), so &ldquo;reading your answers&rdquo; and the pearl-to-colours animation play again."),
         ("Home", "remote", "A scene made on the Remote", "Built from scratch on the Remote and set there: Home shows it like any set scene (name, &ldquo;Made on the Remote&rdquo;, its colours and wash, All in its colour). Saving it on the Remote renames it here too. No check-in today, so &ldquo;Check in&rdquo;."),
         ("Home", "me", "Me", "The Me button, top right.")]
LIBF = [("Library", "", "Presets", "Grid of Globe stills; sound and scent under each name."),
        ("Library", "saved", "Saved", "Grouped by source, sticky headings, most recently set first."),
        ("Library", "onnow", "A preset on now", "Golden Hour set from its tile: the ring, and playing bars before its name (they move; still with Remove animations). Same bars wherever &ldquo;On now&rdquo; showed."),
        ("Library", "checkins", "Check-ins", "This month, the date on each orb; that month&rsquo;s list. One orb per night (the latest). Tonight&rsquo;s row has the playing bars; the calendar keeps its ring."),
        ("Library", "acts", "Saved, &#8943; open", "Pen and trash in the row."),
        ("Library", "edit", "Edit, in the row", "Name, Sound &rsaquo;, scent chips, Cancel / Save."),
        ("Library", "sounds", "Sounds screen", "Opens on the current sound (&ldquo;In this scene&rdquo;)."),
        ("Library", "chosen", "A different track selected", "&ldquo;Chosen&rdquo;, then &ldquo;Choose [track]&rdquo; at the bottom."),
        ("Library", "search", "Searching", "Both categories; the tabs dim."),
        ("Library", "nomatch", "Nothing matches", "The &times; in the field clears it."),
        ("Library", "playing", "Preview playing", "&ldquo;Playing on the lamp&rdquo;."),
        ("Library", "year", "Every month", "The year view."),
        ("Library", "scene", "Scene view", "Full screen; swipe between scenes; Set the scene."),
        ("Library", "empty-saved", "Saved, empty", "&ldquo;Scenes you save live here.&rdquo; + Go to Remote."),
        ("Library", "empty-checkins", "Check-ins, empty", "&ldquo;Each evening&rsquo;s check-in shows up here.&rdquo; + Check in."),
        ("Library", "empty-sounds", "Sounds, no tracks", "&ldquo;No tracks here yet.&rdquo;")]
REMF = [("Remote", "", "Remote, nothing playing (the start)", "The empty state: the pearl globe; build a scene, then Set the scene."),
        ("Remote", "playing", "Remote, a scene playing", "Light, Sound and Scent as headings, each with its switch; All on the scene line; undo &middot; Save &middot; redo at the bottom. The orb keeps its slow inner movement while the scene plays. The switches take a darker shade of the scene&rsquo;s own colour."),
        ("Remote", "light", "Light screen", "Colour wheel, the 8 colours, colour range. Colour range works: drag toward Close and the 8 colours (and the Remote&rsquo;s 4) change; letting go counts as a new palette (Save). The prototype only approximates the colours: the app runs the old app&rsquo;s smoothing (DATA_AND_RULES &sect;3.6)."),
        ("Remote", "sound", "Sound screen", "Ambient / Music, the list, the player."),
        ("Remote", "sound-long", "Sound, a long list", "The list scrolls above the pinned player."),
        ("Remote", "scent", "Scent screen", "The 4 scents; rename here.")]
def fig(tab, st, h, p): return '<figure><div class="ph" data-tab="%s" data-o=\'%s\'><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i></div><figcaption><h3>%s</h3><p>%s</p></figcaption></figure>\n' % (tab, json.dumps({"__STATE": st, "__CONN": "connected", "__CONNSTATIC": True}), h, p)   # connected, so Set the scene works on every phone
SCREENS = """<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Final prototype: screens and flows</title>
<style>
html,body{margin:0; background:#e8e3da; color:#211c17; font:15px/1.5 "Hanken Grotesk",system-ui,sans-serif}
.wrap{max-width:1560px; margin:0 auto; padding:32px 20px 64px} h1{font:400 34px/1.2 "Source Serif 4",Georgia,serif; margin:0 0 6px} h2{font:400 26px/1.2 "Source Serif 4",Georgia,serif; margin:40px 0 4px}
.lede{max-width:80ch; color:#4a443e} .row{display:flex; flex-wrap:wrap; gap:28px; margin-top:18px}
figure{margin:0; width:360px} .ph{width:360px; height:800px; border-radius:36px; background:#f7f3ea; box-shadow:0 1px 2px rgba(33,28,23,.10), 0 14px 36px -14px rgba(33,28,23,.32); position:relative}
.ph i.cn{position:absolute; width:36px; height:36px; z-index:3; pointer-events:none} .ph i.tl{left:0; top:0; background:radial-gradient(circle at 100% 100%, transparent 35.5px, #e8e3da 36px)} .ph i.tr{right:0; top:0; background:radial-gradient(circle at 0 100%, transparent 35.5px, #e8e3da 36px)} .ph i.bl{left:0; bottom:0; background:radial-gradient(circle at 100% 0, transparent 35.5px, #e8e3da 36px)} .ph i.br{right:0; bottom:0; background:radial-gradient(circle at 0 0, transparent 35.5px, #e8e3da 36px)}
.ph iframe{width:360px; height:800px; border:0; display:block}
.top{display:flex; flex-wrap:wrap; gap:36px; align-items:flex-start; margin-top:20px}
.live{display:flex; gap:20px; align-items:flex-start; flex-wrap:wrap}
.ctl{width:250px} .ctlh{font:400 20px/1.25 "Source Serif 4",Georgia,serif; margin:0 0 10px} .ctlp{margin:14px 0 6px; font-size:13.5px; color:#4a443e} .ctln{margin:16px 0 0; font-size:13px; color:#605a53}
.chips{display:flex; flex-wrap:wrap; gap:8px; margin-top:8px} .chips button{min-height:40px; padding:0 14px; border:1px solid #cfc6b8; border-radius:20px; background:transparent; color:#211c17; font:500 13.5px "Hanken Grotesk",system-ui,sans-serif; cursor:pointer}
.chips button[aria-pressed="true"]{background:#3B342E; border-color:#3B342E; color:#f7f3ea}
.flows{margin-top:8px}
.flow{margin:0 0 26px} .flow h3{font:400 20px/1.25 "Source Serif 4",Georgia,serif; margin:0 0 2px} .fl{margin:0 0 10px; font-size:13.5px; color:#4a443e}
.fr{display:flex; align-items:center; gap:8px; flex-wrap:nowrap; margin-bottom:10px; overflow-x:auto; padding-bottom:4px} .fr.ind{padding-left:256px} .fr > .n{flex:none}
.arl{display:grid; justify-items:center; flex:none; color:#8f867b} .arl span{font-size:12px; color:#605a53} .arl i{font-style:normal; font-size:20px; line-height:1}
.n{background:#f7f3ea; border:1px solid #d9d1c4; border-radius:12px; padding:9px 12px; width:220px; box-sizing:border-box; flex:none; font-size:13.5px; line-height:1.35}
.n b{display:block; font-weight:600} .n small{display:block; margin-top:3px; color:#605a53; font-size:12.5px}
.n.sys{background:#eef0f7; border-color:#cfd5e6} .n.ok{border-color:#9fb59a} .n.warn{border-color:#d6b27a} .n.bad{border-color:#d29a86; color:#7c2f17} .n.bad small{color:#7c2f17}
.ar{color:#8f867b; font-size:20px} .br{display:flex; flex-direction:column; gap:8px} .bi{display:flex; align-items:center; gap:8px} .lbl{min-width:112px; text-align:right; font-size:12.5px; color:#605a53}
.toc{margin:14px 0 0; font-size:14.5px} .toc a{color:#211c17} h2[id]{scroll-margin-top:16px}
h3.sub{font:400 21px/1.25 "Source Serif 4",Georgia,serif; margin:30px 0 0}
figcaption h3{font:400 19px/1.25 "Source Serif 4",Georgia,serif; margin:12px 0 4px} figcaption p{margin:0; font-size:13.5px; color:#4a443e}
</style></head><body><div class="wrap">
<h1>Screens and flows</h1>
<p class="lede">Every phone here is the real prototype (the same tabs as FINAL_prototype.html), opened in one state, and still live. Phones load when you scroll to them. Specs: <code>full_dev_spec.md</code> (Home &sect;1&ndash;3 and &sect;7; Library &sect;7.8). Remote: &sect;1&ndash;2.</p>
<p class="toc">Jump to: <a href="#home">Home</a> &middot; <a href="#library">Library</a> &middot; <a href="#remote">Remote</a> &middot; <a href="#names">Names</a> &middot; <a href="#connection">Connection</a></p>
<h2 id="home">Home</h2><div class="row">""" + ''.join(fig(*f) for f in HOMEF) + ''.join(CS.HOMEF) + """</div>
<h2 id="library">Library</h2><div class="row">""" + ''.join(fig(*f) for f in LIBF) + ''.join(SL.MONTHF) + ''.join(CS.LIBF) + """</div>
<h2 id="remote">Remote</h2><div class="row">""" + ''.join(fig(*f) for f in REMF) + ''.join(CS.REMF) + """</div>
<h2 id="names">Names: one rule everywhere</h2><p class="lede">Every name field (the Remote&rsquo;s Save, Save as new and rename; the Library&rsquo;s in-row edit and rename sheet; scent rename): empty means Save is disabled; from 25 characters the count shows under the field; a taken name gets a grey line and is saved with a number. Taken = a preset&rsquo;s or a saved scene&rsquo;s name, any case; for scents, another scent&rsquo;s name. Rules: <code>handoff/DATA_AND_RULES.md</code> &sect;3.4.</p>
<div class="row">""" + ''.join(SL.NAMEF) + """</div>
<h2 id="connection">Connection (first coded version)</h2><p class="lede">One phone, no setup screens: the first time the Remote opens or a scene is set, Android asks for Nearby devices, then light and speaker connect by themselves. Home and Library stay quiet unless something fails. Rules: <code>handoff/DATA_AND_RULES.md</code> &sect;3.2 and &sect;5. The fuller design (setup, trusted phones, System sheet) is for a later release.</p>
<div class="flows">""" + CL.FLOWS + """</div>
<h3 class="sub">First connection</h3><div class="row">""" + ''.join(CL.G1) + """</div>
<h3 class="sub">When something&rsquo;s wrong: the Remote</h3><div class="row">""" + ''.join(CL.G2) + """</div>
<h3 class="sub">Only the sound arrived</h3><div class="row">""" + ''.join(SL.PARTF) + """</div>
<h3 class="sub">The connection drops mid-use</h3><div class="row">""" + ''.join(SL.DROPF) + """</div>
<h3 class="sub">A track can&rsquo;t play: the speaker is unavailable</h3><div class="row">""" + ''.join(SL.SUNF) + """</div>
<h3 class="sub">Home and Library: quiet unless something&rsquo;s wrong</h3><div class="row">""" + ''.join(CL.G3) + """</div>
<h3 class="sub">Set the scene can&rsquo;t reach the lamp</h3><div class="row">""" + ''.join(CL.G4) + """</div>
</div>
<script>
""" + TABSJS + WITHSTATE + """(function(){
  var phs = Array.prototype.slice.call(document.querySelectorAll(".ph"));
  function load(ph){ if (ph.querySelector("iframe")) return; var f = document.createElement("iframe"), o = JSON.parse(ph.dataset.o); f.title = ph.dataset.tab + (o.__STATE ? ", " + o.__STATE : ""); f.srcdoc = withState(TABS[ph.dataset.tab], o); ph.insertBefore(f, ph.firstChild); }
  function unload(ph){ var f = ph.querySelector("iframe"); if (f) ph.removeChild(f); }
  if ("IntersectionObserver" in window) {
    var near = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) load(e.target); }); }, {rootMargin: "300px 0px"});
    var far = new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) unload(e.target); }); }, {rootMargin: "1600px 0px"});
    phs.forEach(function(p){ near.observe(p); far.observe(p); });
  } else phs.forEach(load);
})();
</script></body></html>"""

# ---- 3 Nov (Rida): every figure in FINAL_screens carries its screen ID from handoff/SCREENS_AND_FLOWS.md
# (a visible tag before the title + an anchor, so FINAL_screens.html#H-2 opens that figure). Matched by title;
# a figure whose title is not in the table is left untagged and named here, so a renamed caption is noticed.
SCREEN_IDS = {
"Home, tonight": "H-1",
"Check-in": "C-1",
"A scene set": "H-2",
"After a check-in": "H-2b",
"A scene made on the Remote": "H-3",
"Me": "H-10",
"Presets": "L-1",
"Saved": "L-2",
"A preset on now": "L-11",
"Check-ins": "L-6",
"Saved, ⋯ open": "L-3",
"Edit, in the row": "L-4",
"Sounds screen": "L-13",
"A different track selected": "L-13b",
"Searching": "L-13c",
"Nothing matches": "L-13d",
"Preview playing": "L-13e",
"Every month": "L-7",
"Scene view": "L-12",
"Saved, empty": "L-5",
"Check-ins, empty": "L-8",
"Sounds, no tracks": "L-13f",
"This month, before its first check-in": "L-9",
"Remote, nothing playing (the start)": "R-1",
"Remote, a scene playing": "R-3",
"Light screen": "R-4",
"Sound screen": "R-5",
"Sound, a long list": "R-5b",
"Scent screen": "R-6",
"Save: the name is empty": "R-7a",
"Save: 27 of 30": "R-7b",
"Save: a name that's taken": "R-7c",
"Library: in-row edit, a taken name": "L-4b",
"1 · First time on the Remote": "X-5a",
"2 · Connecting…": "X-2a",
"3 · Connected": "X-2b",
"4 · Not allowed": "X-2c",
"5 · Partly connected": "X-3a",
"6 · Can't connect": "X-2d",
"7 · Bluetooth is off": "X-2e",
"8 · Turn on: Android's prompt": "X-5b",
"Remote, light unavailable": "X-3b",
"Home, light unavailable": "X-2f",
"Only the sound arrived": "X-1a",
"Reconnecting…": "X-2g",
"Not back after ~5 s": "X-2h",
"Sounds screen, speaker unavailable": "L-13g",
"Sound screen, speaker unavailable": "R-5c",
"9 · Home, all fine": "X-2i",
"10 · Home, can't connect": "X-2j",
"11 · Home, sound unavailable": "X-2k",
"12 · Library, Bluetooth off": "X-2l",
"13 · First Set the scene": "X-4a",
"14 · Can't reach it": "X-4b",
"15 · Bluetooth off": "X-4c",
"16 · Only the light arrived": "X-1b",
"17 · Library scene view": "X-4d",
"18 · Remote, from scratch": "X-4e"
}
SCREEN_IDS.update(CS.IDS)
import html as _html
def _sid_norm(x):
    x = _html.unescape(re.sub(r'<[^>]+>', '', x))
    for a, b in (('\u2019', "'"), ('\u2018', "'"), ('\u201c', '"'), ('\u201d', '"')): x = x.replace(a, b)
    return x.strip()
_sid_miss = []
def _sid_fig(m):
    t = _sid_norm(m.group(2)); sid = SCREEN_IDS.get(t)
    if not sid: _sid_miss.append(t); return m.group(0)
    return m.group(1).replace('<figure>', '<figure id="%s">' % sid, 1) + '<figcaption><h3><span class="sid">%s</span>' % sid + m.group(2) + '</h3>'
SCREENS = re.sub(r'(<figure>(?:(?!</figure>).)*?)<figcaption><h3>(.*?)</h3>', _sid_fig, SCREENS, flags=re.S)
SCREENS = SCREENS.replace('</head>', '<style>.sid{display:inline-block; margin-right:8px; padding:1px 6px; border:1px solid #9a9186; border-radius:4px; font:600 12px/1.4 ui-monospace,Consolas,monospace; color:#605a53; vertical-align:2px} figure[id]{scroll-margin-top:16px}</style></head>', 1)
_sid_old = 'Specs: <code>full_dev_spec.md</code> (Home &sect;1&ndash;3 and &sect;7; Library &sect;7.8). Remote: &sect;1&ndash;2.'
SCREENS = SCREENS.replace(_sid_old, 'Each figure&rsquo;s tag (H-1, R-3, X-2d&hellip;) is its screen ID in <code>handoff/SCREENS_AND_FLOWS.md</code> &sect;1, which lists what&rsquo;s on it and how to reach it. Link straight to one with <code>FINAL_screens.html#ID</code>.', 1)
print('spec line replaced:', _sid_old not in SCREENS)
print('screen IDs tagged:', SCREENS.count('class="sid"'), 'of', SCREENS.count('<figcaption>'), '| untagged:', _sid_miss)

for name, txt in [('FINAL_prototype.html', SHELL), ('FINAL_screens.html', SCREENS)]:
    open(os.path.join(HERE, name), 'w', encoding='utf-8').write(txt); print(name, len(txt))
