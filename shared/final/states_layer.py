# states_layer.py: the states added on 3 Nov 2026 from STATES_TO_ADD.md (Rida: D1 = number a taken name, visibly; D3 = no scent line).
# Used by build_final.py like connection_layer.py: one layer per tab, plus figures for FINAL_screens.html.
#   1  Name fields, one rule everywhere (Remote naming in place = its Save / Save as new / rename, the Library's rename sheet and in-row edit,
#      scent rename): empty = Save disabled; from 25 characters "27 of 30" under the field (grey); a taken name = a grey line
#      "“Golden Hour” is taken · saves as “Golden Hour 2”" and Save saves the numbered name; your own scene's current name is never taken.
#   4  The speaker can't be reached: tapping a track doesn't play it; one line next to the player, "Sound unavailable · Try again". Choosing still works.
#   6  This month before its first check-in: the calendar without orbs + "No check-ins yet this month." + Check in.
# (2 "only the sound arrived" and 3 "reconnecting" are connection states: connection_layer.py.)
import json, re
import connection_layer as CL

def lib_names(lib_html):
    """Preset names and saved names in the Library's sample data (presets are always taken; saved ones until the Library says otherwise)."""
    m = re.search(r'Presets: \[([\s\S]*?)\],\s*Saved: \[([\s\S]*?)\],\s*Checkins', lib_html)
    return [re.findall(r'mk\("([^"]+)"', m.group(1)), re.findall(r'mk\("([^"]+)"', m.group(2))]

STCSS = """<style id="states-layer">
/* 1 · one name rule: the grey line under a name field (the count from 25, a taken name) */
.nh{margin:0; font:500 12px/1.35 "Hanken Grotesk",system-ui,sans-serif; color:#605a53} .nh[hidden]{display:none !important} .nh span{display:block}
.nmf .lim, .card5 .lim, .srow3 .ren3 small{display:none !important}
.nmf .nh{position:absolute; left:0; right:0; top:37px; z-index:6}
.fl.nh2 .mgh:has([data-tab="Light"]){visibility:hidden}   /* a two-line note under the name: the Light heading steps aside while you type */
.nmf button:disabled{color:#a39a8f; cursor:default}
.card5 .nh{margin:8px 0 0}
.edit5 .nh{margin:-6px 0 4px 28px}
.srow3 .ren3{flex-wrap:wrap} .srow3 .ren3 .nh{flex-basis:100%; order:9; margin:0 0 6px}
.srow3 .ia3:disabled{opacity:.35; cursor:default}
/* 4 · the speaker can't be reached: one line by the player (the Remote's Sound screen: right above it; the Library's Sounds screen: under the row tapped) */
.cun.sun{padding:0 8px 0 24px; min-height:48px; font-size:14px} .cun.sun button{font-size:14px; padding:0 16px}
.scr .cun.sun{position:absolute; left:0; right:0; z-index:5; padding:0 8px 0 24px}
html.snd-un .scr .eqb{display:none !important}
/* 6 · this month before its first check-in */
.emo{padding:20px 24px 0; text-align:center} .emo p{margin:0 0 16px; font:400 18px/1.4 var(--serif, "Source Serif 4", Georgia, serif); color:var(--ink, #211c17)}
</style>
"""

STJS = r"""<script>/* states layer (3 Nov): one name rule, the speaker unavailable, this month before its first check-in */
(function(){
  var TAB = @@TAB@@, NM = @@NAMES@@, PRESETS = NM[0], RS = [];   /* RS: names saved on the Remote this session */
  var esc = function(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
  /* ---------- 1 · names ---------- */
  var norm = function(s){ return (s || "").trim().toLowerCase(); };
  function taken(v, list, own){ var n = norm(v); if (!n || (own != null && norm(own) === n)) return false; return list.some(function(x){ return norm(x) === n; }); }
  function numbered(v, list, own){ v = (v || "").trim(); if (!taken(v, list, own)) return v;
    var m = /^(.*\S) (\d{1,2})$/.exec(v), base = m ? m[1] : v, k0 = m ? +m[2] + 1 : 2;   /* "Golden Hour 2" taken: "Golden Hour 3", not "Golden Hour 2 2" */
    for (var k = k0; k < 100; k++) { var sf = " " + k, c = base.slice(0, 30 - sf.length).replace(/\s+$/, "") + sf; if (!taken(c, list, own)) return c; } return v; }
  window.__nameFinal = numbered;
  function libList(){ var ph = document.getElementById("phrvP"), S = ph && ph._items ? ph._items("Saved").map(function(x){ return x.n; }) : NM[1]; return PRESETS.concat(S); }
  function remoteList(){ return (window.__libNames || PRESETS.concat(NM[1])).concat(RS); }
  window.__freeName = function(v){ return numbered(v, remoteList(), null); };   /* the Remote's suggested name ("My scene", "Golden Hour 2") is always a free one */
  var F = [];
  function reg(o){ if (o.inp._nr) return; o.inp._nr = o; F.push(o); o.hint.setAttribute("aria-live", "polite"); o.inp.addEventListener("input", function(){ paint(o); }); paint(o); }
  function hint(after, inside){ var h = document.createElement("p"); h.className = "nh"; h.hidden = true; if (inside) after.appendChild(h); else after.after(h); return h; }
  function paint(o){ var raw = o.inp.value, v = raw.trim(), L = o.list(), own = o.own(), s = "";
    if (o.btn.disabled !== !v) o.btn.disabled = !v;
    if (taken(v, L, own)) s += "<span>“" + esc(v) + "” is taken · saves as “" + esc(numbered(v, L, own)) + "”</span>";
    if (raw.length >= 25) s += "<span>" + raw.length + " of 30</span>";
    if (o.hint._s !== s) { o.hint.innerHTML = s; o.hint._s = s; } o.hint.hidden = !s;
    var fl = o.inp.closest(".fl"); if (fl) fl.classList.toggle("nh2", !!s && fl.classList.contains("naming") && o.hint.offsetHeight > 20); }
  /* saving: never empty; a taken name is saved with its number (runs before each field's own handler) */
  function fin(o, e){ var v = o.inp.value.trim(); if (!v) { e.stopImmediatePropagation(); e.preventDefault(); return; }
    var f = numbered(v, o.list(), o.own()); o.inp.value = f; if (o.saved) o.saved(f, o.own()); }
  document.addEventListener("click", function(e){ for (var i = 0; i < F.length; i++) if (F[i].inp.isConnected && F[i].btn.contains(e.target)) return fin(F[i], e); }, true);
  document.addEventListener("keydown", function(e){ if (e.key === "Enter" && e.target._nr) fin(e.target._nr, e); }, true);
  function find(){
    if (TAB === "Remote") {
      document.querySelectorAll(".fl .nmf").forEach(function(f){ var inp = f.querySelector("input"); if (!inp || inp._nr) return; var ph = f.closest(".fl");
        reg({inp: inp, btn: f.querySelector("button"), hint: hint(f, true), list: remoteList, own: function(){ return ph.__own == null ? null : ph.__own; },
             saved: function(v, own){ if (own != null) RS = RS.filter(function(x){ return norm(x) !== norm(own); }); RS.push(v); }}); });
      document.querySelectorAll(".srow3 .ren3").forEach(function(w){ var inp = w.querySelector("input"); if (!inp || inp._nr) return; var r = w.closest(".srow3");
        var nm = function(x){ var s = x.querySelector(".sn > span"); return s ? s.textContent : ""; };
        reg({inp: inp, btn: w.querySelector('[data-a="ok"]'), hint: hint(w, true), own: function(){ return nm(r); },
             list: function(){ return Array.prototype.filter.call(document.querySelectorAll("#scrScent .srow3"), function(x){ return x !== r; }).map(nm); }}); }); }
    if (TAB === "Library") {
      document.querySelectorAll(".sheet5").forEach(function(sh){ var inp = sh.querySelector(".card5 input"); if (!inp) return;
        if (!sh.hidden && !sh._open) { sh._open = true; var t = sh.querySelector("h3"); sh._own = t && t.textContent === "Rename" ? inp.value : null; }
        if (sh.hidden) sh._open = false;
        if (!inp._nr) reg({inp: inp, btn: sh.querySelector("[data-ok]"), hint: hint(inp), list: libList, own: function(){ return sh._own; }}); });
      document.querySelectorAll(".edit5").forEach(function(ed){ var inp = ed.querySelector(".e5top input"); if (!inp || inp._nr) return; var own = inp.defaultValue;
        reg({inp: inp, btn: ed.querySelector('[data-act="ok"]'), hint: hint(ed.querySelector(".e5top")), list: libList, own: function(){ return own; }}); }); }
    F = F.filter(function(o){ return o.inp.isConnected; }); F.forEach(paint); }
  setInterval(find, 200); document.addEventListener("focusin", find);
  if (TAB === "Remote") document.querySelectorAll(".fl").forEach(function(fl){ new MutationObserver(find).observe(fl, {attributes: true, attributeFilter: ["class"]}); });   /* naming starts: the line is right at once */
  /* the Library tells the Remote which names are taken (the shell passes it on) */
  if (TAB === "Library" && window.parent !== window) { var sig = ""; setInterval(function(){ var L = libList(), s = L.join("|"); if (s !== sig) { sig = s; window.parent.postMessage({lamp:"names", names: L}, "*"); } }, 600); }
  window.addEventListener("message", function(e){ var d = e.data || {}; if (d.lamp === "names" && TAB === "Remote") window.__libNames = d.names;
    if (d.lamp === "emptymonth" && TAB === "Library") { window.__emptyMonth = !!d.on; var ph = document.getElementById("phrvP"); if (!d.on && ph && ph._redraw) ph._redraw(); } });

  /* ---------- 4 · the speaker can't be reached ---------- */
  var SUN = {partly: 1, cant: 1, btoff: 1, denied: 1};
  var sun = function(){ return !!SUN[window.__conn]; };
  function fix(){ var c = window.__conn; if (window.__connAct) window.__connAct(c === "btoff" ? "bton" : c === "denied" ? "settings" : "retry"); }
  function sunLine(){ var d = document.createElement("div"); d.className = "cun sun"; d.setAttribute("role", "alert");
    d.innerHTML = "<span>Sound unavailable</span><button type=\"button\">Try again</button>"; d.querySelector("button").addEventListener("click", fix); return d; }
  document.addEventListener("click", function(e){ if (!sun() || !e.target.closest) return;
    var pl = TAB === "Library" && e.target.closest(".sds5 .pl5");
    if (pl) { e.stopImmediatePropagation(); e.preventDefault(); var sc = pl.closest(".sds5"), r = pl.closest(".r5");   /* ▶ would play on the lamp: it can't, so it doesn't */
      sc.querySelectorAll(".sun").forEach(function(x){ x.remove(); }); r.after(sunLine()); return; }
    var pp = TAB === "Remote" && e.target.closest(".scr .scfull3 .ck:not(.bare)");   /* play on the player: it can't either */
    if (pp) { e.stopImmediatePropagation(); e.preventDefault(); }
    var tr = TAB === "Remote" && (e.target.closest(".scr .tl3 .trow2") || pp);
    if (tr) setTimeout(function(){ remoteLine(tr.closest(".scr")); }, 0); }, true);
  /* the Remote's Sound screen: the track is chosen (it's data) but can't play; the line sits right above the player, the list ends above it, the player shows Play */
  var PLAY = '<svg viewBox="0 0 22 22" fill="currentColor" aria-hidden="true"><path d="M7.5 5.3v11.4a.8.8 0 0 0 1.2.7l8.6-5.7a.8.8 0 0 0 0-1.4L8.7 4.6a.8.8 0 0 0-1.2.7z"/></svg>';
  function remoteLine(scr){ var pl = scr && scr.querySelector(".scfull3"); if (!pl || scr.querySelector(".sun")) return;
    var d = sunLine(), top = pl.offsetTop - 50; d.style.top = top + "px"; scr.appendChild(d);
    var tls = Array.prototype.slice.call(scr.querySelectorAll(".tl3")), vis = tls.filter(function(t){ return t.offsetParent; })[0];   /* the list (it scrolls) ends above the line */
    if (vis) { var y = vis.getBoundingClientRect().top - scr.getBoundingClientRect().top; d._tl = tls; tls.forEach(function(t){ t.style.maxHeight = Math.max(120, top - y - 4) + "px"; }); }
    var b = pl.querySelector(".ck:not(.bare)"); if (b) { d._b = [b, b.innerHTML, b.getAttribute("aria-label")]; b.innerHTML = PLAY; b.setAttribute("aria-label", "Play"); } }
  function unLine(x){ if (x._tl) x._tl.forEach(function(t){ t.style.maxHeight = ""; }); if (x._b) { x._b[0].innerHTML = x._b[1]; x._b[0].setAttribute("aria-label", x._b[2]); } x.remove(); }
  setInterval(function(){ var u = sun(); document.documentElement.classList.toggle("snd-un", u); if (!u) document.querySelectorAll(".sun").forEach(unLine); }, 250);

  /* ---------- 6 · this month, before its first check-in ---------- */
  function emptyMonth(){ var ph = document.getElementById("phrvP"); if (!ph) return; var pane = ph.querySelector('[data-pane="Checkins"]'); if (!pane) return;
    var nx = pane.querySelector(".mnext"); if (ph._yv || (nx && !nx.disabled)) return;   /* only the newest month (its › is disabled) */
    var cal = pane.querySelector(".cal"); if (!cal || !cal.querySelector("button.cell")) return;
    cal.querySelectorAll("button.cell").forEach(function(b){ var i = document.createElement("i"), d = b.querySelector(".cd"); i.className = "dn" + (b.classList.contains("tn") ? " tn" : ""); i.setAttribute("aria-hidden", "true"); i.textContent = d ? d.textContent : ""; b.replaceWith(i); });
    var l = pane.querySelector(".list"), e = document.createElement("div"); e.className = "emo"; e.innerHTML = "<p>No check-ins yet this month.</p><button class=\"pill outline go\">Check in</button>";
    if (l) l.replaceWith(e); else cal.after(e); }
  setInterval(function(){ if (window.__emptyMonth && TAB === "Library") emptyMonth(); }, 300);

  /* ---------- states for the screens file: window.__S2 ---------- */
  var S2 = window.__S2; if (!S2) return;
  var put = function(inp, v){ inp.value = v; inp.dispatchEvent(new Event("input", {bubbles: true})); try { inp.setSelectionRange(v.length, v.length); } catch (x) {} };
  var go = {
    /* the Remote: a scene playing, its track changed, Save pressed, then a name typed */
    name: function(v){ var ph = document.getElementById("fl1"); if (!ph || !ph.__edit) return false; ph.__edit("track", "Fireplace");
      setTimeout(function(){ var c = ph.querySelector(".cta"); if (c && !c.hidden) c.click(); setTimeout(function(){ var inp = ph.querySelector(".nmf input"); if (inp) put(inp, v); }, 250); }, 250); },
    "name-empty": function(){ return go.name(""); }, "name-27": function(){ return go.name("Slow Sunday with the window"); }, "name-taken": function(){ return go.name("Golden Hour"); },
    /* the Library: renaming Friends over in its row to a preset's name */
    taken: function(){ var inp = document.querySelector("#phrvP .edit5 .e5top input"); if (!inp) return false; put(inp, "Golden Hour"); },
    /* the speaker unavailable: tap a track */
    tap: function(){ if (TAB === "Library") { var p = document.querySelectorAll("#phrvP .sds5 .r5 .pl5"); if (!p[1]) return false; p[1].click(); }
      else { var r = document.querySelectorAll("#scrSound .tl3 .trow2"); if (!r[1]) return false; r[1].click(); } },
    emptymonth: function(){ window.__emptyMonth = true; }
  };
  var n = 0, t = setInterval(function(){ n++; if (n > 20) clearInterval(t); try { if (go[S2] && go[S2]() !== false) clearInterval(t); } catch (x) { console.error("state " + S2, x); clearInterval(t); } }, 600);
})();
</script>
"""

def layer(tab, names):
    return STCSS + STJS.replace("@@TAB@@", json.dumps(tab)).replace("@@NAMES@@", json.dumps(names, ensure_ascii=False))

# ================= figures for FINAL_screens.html =================
f = CL.fig
CONN_ON = "connected"
NAMEF = [f("Save: the name is empty", "Done is disabled; nothing is saved without a name (the same in every name field).", "Remote", "playing", CONN_ON, __S2="name-empty"),
         f("Save: 27 of 30", "From 25 characters the count shows under the field, grey. 30 is the limit.", "Remote", "playing", CONN_ON, __S2="name-27"),
         f("Save: a name that&rsquo;s taken", "&ldquo;&ldquo;Golden Hour&rdquo; is taken &middot; saves as &ldquo;Golden Hour 2&rdquo;&rdquo;. Done stays on and saves the numbered name. Your own scene&rsquo;s current name (Update) is never taken.", "Remote", "playing", CONN_ON, __S2="name-taken"),
         f("Library: in-row edit, a taken name", "The same line under the field; Save saves &ldquo;Golden Hour 2&rdquo;. Also the rename sheet and scent rename (scents: taken = another scent&rsquo;s name).", "Library", "edit", CONN_ON, __S2="taken")]
PARTF = [f("Remote, light unavailable", "Grey &ldquo;Partly connected&rdquo;; the Light card&rsquo;s controls go and &ldquo;Light unavailable &middot; Try again&rdquo; takes their place. Sound keeps working.", "Remote", "playing", "partlyL"),
         f("Home, light unavailable", "Names the part that failed, beside Me (the mirror of 11).", "Home", "set", "partlyL"),
         f("Only the sound arrived", "The existing message bar: &ldquo;Sound sent &middot; Light unavailable&rdquo;. (Press Set the scene on this phone.)", "Home", "result", "partlyL")]
DROPF = [f("Reconnecting&hellip;", "The connection dropped while a scene plays. Grey, no action, like Connecting&hellip;. The controls keep working; the latest values are sent when it&rsquo;s back. Home and Library say nothing.", "Remote", "playing", "reconnecting"),
         f("Not back after ~5 s", "It falls through to the usual states: here neither part (&ldquo;Can&rsquo;t connect &middot; Try again&rdquo;); one part: &ldquo;Partly connected&rdquo;. ~5 s: confirm with the dev.", "Remote", "playing", "cant")]
SUNF = [f("Sounds screen, speaker unavailable", "&#9654; doesn&rsquo;t play: the row stays as it was and one line goes under it, &ldquo;Sound unavailable &middot; Try again&rdquo;. Choosing a track for the scene still works (it&rsquo;s data).", "Library", "sounds", "partly", __S2="tap"),
        f("Sound screen, speaker unavailable", "Tapping Fireplace chooses it for the scene but it can&rsquo;t play: one line right above the player; no playing bars.", "Remote", "sound", "partly", __S2="tap")]
MONTHF = [f("This month, before its first check-in", "Earlier months have some. The calendar without orbs; &ldquo;No check-ins yet this month.&rdquo; + Check in (goes to Home). &lsaquo; still goes back a month.", "Library", "checkins", CONN_ON, __S2="emptymonth")]
