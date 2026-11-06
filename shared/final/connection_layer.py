# connection_layer.py: the connection states (Rida, 2 Nov 2026; temporary, for the first coded version) and "On now" as playing bars.
# Used by build_final.py (one layer per tab, the live phone's test menu, the flows and the state phones in FINAL_screens.html).
# The flow: no setup screens; the first time the Remote opens or Set the scene is pressed, Android asks for Nearby devices; then light and
# speaker connect in parallel. Remote line: Connecting... / Connected / Partly connected / Can't connect - Try again / Bluetooth is off - Turn on /
# Allow nearby devices - Open settings. Home and Library stay quiet unless something fails. Set the scene that can't reach the lamp: one line
# above the button, which becomes the fix. The fuller design (setup, trusted phones, System sheet) stays on the FigJam board for a later release.
import json
ERR = "#9a3b1f"   # the Remote's existing error colour (remote_final.html .cst): 6.5:1 on the cream
CONNCSS = """<style id="conn-layer">
/* the connection line: top right, beside Me, the same slot as remote_final.html's .cst; 48 px tall */
.cline{position:absolute; right:58px; top:34px; min-height:48px; max-width:184px; display:flex; align-items:center; justify-content:flex-end; gap:5px; flex-wrap:wrap; row-gap:0; text-align:right; border:0; background:none; padding:0 4px; margin:0; font:600 12.5px/1.3 "Hanken Grotesk",system-ui,sans-serif; color:#605a53; z-index:9; cursor:default; -webkit-tap-highlight-color:transparent}
.cline[hidden]{display:none !important}
.cline.e{color:@@ERR@@; cursor:pointer} .cline .sep{opacity:.7}
.cline.q .act, .cline.q .sep, .cline.wrap2 .sep{display:none} .cline.wrap2{flex-direction:column; align-items:flex-end; justify-content:center}
.c-hide .cline{display:none !important}
/* a part that can't be reached (the Remote): its controls go, one line + Try again takes their place */
.cun-hide{display:none !important}
.cun{display:flex; align-items:center; justify-content:space-between; min-height:52px; font:500 15px "Hanken Grotesk",system-ui,sans-serif; color:#605a53}
.cun button{min-height:48px; padding:0 4px 0 12px; border:0; background:none; font:600 15px "Hanken Grotesk",system-ui,sans-serif; color:@@ERR@@; cursor:pointer}
/* Set the scene can't reach the lamp: one line right above the button (decided 2 Nov, option a) */
.cerr{position:absolute; text-align:center; font:500 14px/1.35 "Hanken Grotesk",system-ui,sans-serif; color:@@ERR@@; z-index:9; pointer-events:none}
/* "On now" = playing bars before the name, everywhere in the Library: preset tiles, Saved and Check-ins rows, the scene view (Rida, 2 Nov; the calendar keeps its ring).
   They move (Rida, 2 Nov, knowing WCAG 2.2.2 asks for a way to stop motion over 5 s); still with Android's Remove animations. Not on the Remote (cut 30 Oct). */
#phrvP .nowtag{display:none !important}
.eqb{display:inline-flex !important; flex-direction:row !important; align-items:flex-end !important; gap:2px !important; width:auto !important; height:.72em !important; margin:0 .45em 0 0 !important; padding:0 !important; vertical-align:baseline !important; background:none !important; border:0 !important} .eqb i{display:block !important; position:static !important; flex:none !important; width:2.5px !important; height:100% !important; margin:0 !important; border-radius:1px; background:currentColor !important; transform-origin:bottom} .eqb i:nth-child(1){transform:scaleY(.55)} .eqb i:nth-child(2){transform:scaleY(1)} .eqb i:nth-child(3){transform:scaleY(.75)}
.eqb i{animation:eqb 1.1s ease-in-out infinite} .eqb i:nth-child(2){animation-delay:-.35s} .eqb i:nth-child(3){animation-delay:-.7s} @keyframes eqb{0%,100%{transform:scaleY(.35)} 50%{transform:scaleY(1)}} @media (prefers-reduced-motion:reduce){.eqb i{animation:none}}
.isub .eqb{height:.8em}
/* Android's own dialogs, drawn only so the prototype can show them (the app doesn't design these) */
.cdlg{position:absolute; inset:0; z-index:60; background:rgba(0,0,0,.32); display:flex; align-items:center; justify-content:center}
.cdlg .card{width:296px; box-sizing:border-box; padding:24px 24px 8px; border-radius:28px; background:#fbf8fd; color:#1c1b1f; text-align:center; font:400 15px/1.45 Roboto,"Hanken Grotesk",system-ui,sans-serif; box-shadow:0 8px 24px rgba(0,0,0,.18)}
.cdlg .ico{width:24px; height:24px; margin:0 auto 14px; color:#3f5aa8}
.cdlg p{margin:0 0 18px; font-size:17px; line-height:1.4} .cdlg p b{font-weight:500}
.cdlg .bt{display:block; width:100%; min-height:48px; border:0; border-top:1px solid #e3e0e8; background:none; font:500 15px Roboto,"Hanken Grotesk",system-ui,sans-serif; color:#3f5aa8; cursor:pointer}
.cdlg .sys{margin:6px 0 0; font-size:11px; color:#8a8790}
</style>
""".replace("@@ERR@@", ERR)

# one script for all three tabs; %s = the tab's name
CONNJS = r"""<script>/* connection layer + "On now" bars (2 Nov) */
(function(){
  var TAB = %s, conn = window.__CONN || "never"; window.__conn = conn;
  var LOCAL = window.parent === window || !!window.__CONNSTATIC;   /* a state phone on the screens page simulates on its own */
  var OUT = window.__OUT || "both", T = 0, pending = null;
  function roots(){ var ids = TAB === "Home" ? ["home"] : TAB === "Library" ? ["phrvP"] : ["fl1", "fl2"];
    return ids.map(function(i){ return document.getElementById(i); }).filter(Boolean); }
  /* what the top line says, per tab: [message, action, fix]; Home and Library say nothing unless something needs fixing */
  function lineFor(s){
    var R = TAB === "Remote";
    return { connecting: R ? ["Connecting…"] : null, connected: R ? ["Connected"] : null,
             partly: R ? ["Partly connected"] : ["Sound unavailable", "Try again", "retry"],
             partlyL: R ? ["Partly connected"] : ["Light unavailable", "Try again", "retry"],   /* 3 Nov: only the sound arrived */
             reconnecting: R ? ["Reconnecting…"] : null,   /* 3 Nov: the connection dropped mid-use; Home and Library stay quiet */
             cant: ["Can’t connect", "Try again", "retry"], btoff: ["Bluetooth is off", "Turn on", "bton"],
             denied: ["Allow nearby devices", "Open settings", "settings"] }[s] || null; }
  function paint(){
    roots().forEach(function(r){
      var b = r.querySelector(":scope > .cline"); if (!b) { b = document.createElement("button"); b.className = "abs cline"; b.type = "button"; r.appendChild(b);
        b.addEventListener("click", function(){ if (b._fix) act(b._fix); }); }
      var cst = r.querySelector(".cst"); if (cst) cst.hidden = true;   /* remote_final.html's own placeholder line */
      var L = lineFor(conn); b.hidden = !L; if (!L) return;
      b._fix = L[2] || null; b.className = "abs cline " + (L[2] ? "e" : "q");
      b.innerHTML = '<span class="msg">' + L[0] + '</span><span class="sep">·</span><span class="act">' + (L[1] || "") + "</span>";
      b.setAttribute("aria-label", L[0] + (L[1] ? ". " + L[1] : "")); b.tabIndex = L[2] ? 0 : -1;
      if (!L[2]) b.setAttribute("role", "status"); else b.removeAttribute("role");
      b.classList.remove("wrap2"); var m = b.querySelector(".msg"), a = b.querySelector(".act"); b.classList.toggle("wrap2", !!(L[1] && a.offsetTop > m.offsetTop + 4));   /* two lines: no dot */
    });
    paintPart("Sound", conn === "partly"); paintPart("Light", conn === "partlyL"); }
  /* the Remote, one part unavailable: that card's controls go, one line + Try again (Sound: "partly"; Light: "partlyL", 3 Nov) */
  function paintPart(k, un){
    if (TAB !== "Remote") return;
    roots().forEach(function(r){
      var h = r.querySelector('[data-tab="' + k + '"]'); h = h && h.closest(".mgh"); if (!h) return;
      var el = h.nextElementSibling;
      while (el && !el.classList.contains("mgsec") && !el.classList.contains("mgh")) { if (!el.classList.contains("cun")) el.classList.toggle("cun-hide", un); el = el.nextElementSibling; }
      var c = h.nextElementSibling && h.nextElementSibling.classList.contains("cun") ? h.nextElementSibling : null;
      if (un && !c) { c = document.createElement("div"); c.className = "cun"; c.innerHTML = '<span>' + k + ' unavailable</span><button type="button">Try again</button>'; h.after(c); c.querySelector("button").addEventListener("click", function(){ act("retry"); }); }
      if (!un && c) c.remove();
    }); }
  /* the outcome of a connection attempt */
  var OK = {connected: 1, partly: 1, partlyL: 1};   /* enough is connected for Set the scene to go through */
  function setConn(s){ conn = s; window.__conn = s; paint(); if (pending) settle(); else if (OK[s]) clearAllErr(); }
  function attempt(){ clearTimeout(T); if (OUT === "btoff") { setConn("btoff"); return; } setConn("connecting");
    T = setTimeout(function(){ setConn({both:"connected", light:"partly", sound:"partlyL", none:"cant"}[OUT] || "connected"); }, 1600); }
  function act(a){
    if (!LOCAL) { window.parent.postMessage({lamp:"connact", act:a}, "*"); return; }
    if (a === "ask") { if (conn === "never") dialog("perm"); return; }
    if (a === "allow" || a === "retry" || a === "settings") return attempt();
    if (a === "deny") return setConn("denied");
    if (a === "bton") return dialog("bt");
    if (a === "btallow") { if (OUT === "btoff") OUT = "both"; return attempt(); }
    if (a === "btdeny") return setConn("btoff"); }
  window.__connAct = act;
  /* Android's dialogs (system UI: drawn only to show the moment) */
  var NEAR = '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7l10 10-5 5V2l5 5L7 17"/></svg>';
  function dialog(k){
    var r = activeRoot(); if (!r || r.querySelector(".cdlg")) return;
    var d = document.createElement("div"); d.className = "cdlg"; d.setAttribute("role", "dialog");
    d.innerHTML = k === "perm"
      ? '<div class="card">' + NEAR + '<p>Allow <b>Wellness Lamp</b> to find, connect to, and determine the relative position of nearby devices?</p><button class="bt" data-a="allow">Allow</button><button class="bt" data-a="deny">Don’t allow</button><p class="sys">Android’s own prompt</p></div>'
      : '<div class="card">' + NEAR + '<p><b>Wellness Lamp</b> wants to turn on Bluetooth</p><button class="bt" data-a="btallow">Allow</button><button class="bt" data-a="btdeny">Deny</button><p class="sys">Android’s own prompt</p></div>';
    r.appendChild(d);
    d.querySelectorAll("[data-a]").forEach(function(b){ b.addEventListener("click", function(){ d.remove(); act(b.dataset.a); }); }); }
  function activeRoot(){ var rs = roots(); if (TAB !== "Remote") return rs[0];
    for (var i = 0; i < rs.length; i++) if (rs[i].classList.contains("act")) return rs[i]; return rs[0]; }
  /* Set the scene (Home's result, the Library's scene view, the Remote from scratch): starting is explicit, so it's the one place a failure shows in place */
  var SEL = TAB === "Home" ? ".setbtn" : TAB === "Library" ? ".iset" : ".cta.set";
  var FIX = {cant:["Can’t connect. Move closer and try again.", "Try again", "retry"], btoff:["Bluetooth is off.", "Turn on Bluetooth", "bton"], denied:["Allow nearby devices to connect.", "Open settings", "settings"]};
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest(SEL); if (!b || b._pass) return;
    if (b._err) { e.stopImmediatePropagation(); e.preventDefault(); var f = FIX[b._err][2]; clearErr(b); wait(b); act(f); return; }
    if (OK[conn]) return;             /* goes through as today */
    e.stopImmediatePropagation(); e.preventDefault(); wait(b);
    if (conn === "never") act("ask"); else if (conn === "cant") act("retry"); else if (conn !== "connecting" && conn !== "reconnecting") setTimeout(settle, 450);
  }, true);
  function wait(b){ if (!b._label) b._label = "Set the scene"; b.textContent = "Setting the scene…"; b.disabled = true; b.setAttribute("aria-busy", "true"); pending = b; }
  function settle(){ var b = pending; if (!b) return;
    if (OK[conn]) { pending = null; b.removeAttribute("aria-busy"); b.disabled = false; b.textContent = b._label; b._pass = true; b.click(); b._pass = false; return; }
    if (FIX[conn]) { pending = null; b.removeAttribute("aria-busy"); showErr(b, conn); } }
  function showErr(b, s){
    clearErr(b); b._err = s; b.disabled = false; b.textContent = FIX[s][1];
    if (TAB === "Remote") return;   /* no room above the Remote's button (the Scent row): its top line already says what happened */
    var host = b.offsetParent || b.parentElement, line = document.createElement("div"); line.className = "cerr"; line.textContent = FIX[s][0]; line.setAttribute("role", "alert");
    var wide = b.offsetWidth >= 240; line.style.left = (wide ? b.offsetLeft : 0) + "px"; line.style.width = (wide ? b.offsetWidth : host.offsetWidth) + "px"; line.style.top = (b.offsetTop - 30) + "px";
    host.appendChild(line); b._line = line; var r = b.closest(".phone, .ph, #home, #phrvP"); if (r) r.classList.add("c-hide"); }
  function clearErr(b){ if (b._line) b._line.remove(); b._line = null; if (b._err) { b._err = null; b.textContent = b._label || "Set the scene"; }
    var r = b.closest(".phone, .ph, #home, #phrvP"); if (r) r.classList.remove("c-hide"); }
  function clearAllErr(){ document.querySelectorAll(SEL).forEach(function(b){ if (b._err) clearErr(b); }); }
  /* only part arrived: the existing message bar says which ("Light sent · Sound unavailable", or "Sound sent · Light unavailable", 3 Nov) */
  /* 5 Nov (Rida): a half-sent message has no Undo; "Sent to your room" gets it back */
  new MutationObserver(function(ms){ ms.forEach(function(m){ var s = m.target; if (!s.classList.contains("show") || !s.classList.contains("snack")) return; var t = s.querySelector("span"), u = s.querySelector(".undo");
    if (conn === "partly" || conn === "partlyL") { if (t && /^Sent to your room/.test(t.textContent)) t.textContent = conn === "partly" ? "Light sent · Sound unavailable" : "Sound sent · Light unavailable"; if (u && t && /unavailable/.test(t.textContent)) u.hidden = true; }
    else if (u && t && /^Sent to your room/.test(t.textContent)) u.hidden = false; }); })
    .observe(document.documentElement, {subtree:true, attributes:true, attributeFilter:["class"]});
  /* Home: nothing during the check-in (a focused task, no Me); the Library: nothing in the full-screen scene view */
  /* the Remote redraws its button on every change; keep the waiting / fix label on it */
  setInterval(function(){ document.querySelectorAll(SEL).forEach(function(b){
    if (b._err && b.textContent !== FIX[b._err][1]) { b.textContent = FIX[b._err][1]; b.disabled = false; }
    if (b === pending && b.textContent !== "Setting the scene\u2026") { b.textContent = "Setting the scene\u2026"; b.disabled = true; b.setAttribute("aria-busy", "true"); } }); }, 150);
  setInterval(function(){ roots().forEach(function(r){
    var full = TAB === "Home" ? !!document.querySelector("#home .qlayer:not([hidden])") : TAB === "Library" ? !!Array.prototype.some.call(r.querySelectorAll(".inside"), function(x){ return !x.hidden && x.getBoundingClientRect().height > 400; }) : false;
    r.classList.toggle("c-full", full); var b = r.querySelector(":scope > .cline"); if (b && lineFor(conn)) b.style.visibility = full ? "hidden" : ""; }); }, 300);
  /* switches take a darker shade of the scene's own colour (Rida, 2 Nov): its hue and saturation, lightness lowered until it clears 3:1 on the cream */
  window.__swc = function(hex){ var m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim()); if (!m) { var g = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(hex || ""); if (!g) return null; hex = "#" + [g[1], g[2], g[3]].map(function(v){ return (+v).toString(16).padStart(2, "0"); }).join(""); m = /^#([0-9a-f]{6})$/i.exec(hex); }
    var n = parseInt(m[1], 16), r = (n >> 16 & 255)/255, g2 = (n >> 8 & 255)/255, b = (n & 255)/255, mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), h = 0, sa = 0, l = (mx + mn)/2, d = mx - mn;
    if (d) { sa = l > .5 ? d/(2 - mx - mn) : d/(mx + mn); h = mx === r ? (g2 - b)/d + (g2 < b ? 6 : 0) : mx === g2 ? (b - r)/d + 2 : (r - g2)/d + 4; h /= 6; }
    var rgb = function(L){ if (!sa) return [L, L, L]; var q = L < .5 ? L*(1 + sa) : L + sa - L*sa, pp = 2*L - q, f = function(t){ t = (t + 1) %% 1; return t < 1/6 ? pp + (q - pp)*6*t : t < .5 ? q : t < 2/3 ? pp + (q - pp)*(2/3 - t)*6 : pp; }; return [f(h + 1/3), f(h), f(h - 1/3)]; };
    var lum = function(c){ return c.map(function(v){ return v <= .03928 ? v/12.92 : Math.pow((v + .055)/1.055, 2.4); }).reduce(function(a, v, i){ return a + v*[.2126, .7152, .0722][i]; }, 0); }, CREAM = .893;
    var L = l, c = rgb(L); while ((CREAM + .05)/(lum(c) + .05) < 3 && L > .05) { L -= .02; c = rgb(L); }
    return "#" + c.map(function(v){ return Math.round(v*255).toString(16).padStart(2, "0"); }).join(""); };
  /* the prototype shell: state changes and dialogs come from it */
  window.addEventListener("message", function(e){ var d = e.data || {};
    if (d.lamp === "conn") setConn(d.s);
    if (d.lamp === "conndlg") dialog(d.k); });
  /* a state phone on the screens page: window.__CONN / __DLG / __INL / __OUT */
  function boot(){
    paint();
    if (!LOCAL) window.parent.postMessage({lamp:"connact", act:"hello"}, "*");
    var st = window.__STATE || "";
    if (TAB === "Home" && st === "result") setTimeout(function(){ var t = document.querySelector("#home [data-start]"); if (t) { t.textContent = "Set the scene"; t.click(); } }, 700);   /* v2's own way back to a mood's result */
    if (TAB === "Library" && st === "onnow") {   /* set Golden Hour from its tile, as a person would, then close the scene view (steps retry until each one has happened) */
      var ph = document.getElementById("phrvP"), q = function(sel){ return Array.prototype.filter.call(ph.querySelectorAll(sel), function(x){ return x.offsetParent; })[0]; }, step = 0, n = 0;
      var tick = setInterval(function(){ n++; window.__dbg = [step, n]; if (n > 90) clearInterval(tick);
        var isOn = ph._on && ph._on.n === "Golden Hour";
        if (step === 0) { if (isOn) { step = 2; return; } var t = ph.querySelector('[data-open="Presets:0"]'); if (t && t.offsetParent) { t.click(); step = 1; } return; }
        if (step === 1) { var bt = q(".iset"); if (bt && !bt.disabled) bt.click(); if (isOn) step = 2; return; }
        if (step === 2) { step = 3; setTimeout(function(){ step = 6; }, 2600); return; }
        if (step === 6) { var x = q(".ix"); if (x) x.click(); setTimeout(function(){ ph.querySelectorAll(".inside").forEach(function(v){ v.hidden = true; }); step = 4; }, 600); step = 7; return; }   /* the close button, and the end state it leads to (its fade can stall in a background frame) */
        if (step === 4) { step = 5; clearInterval(tick); setTimeout(function(){ 
          ph.querySelectorAll(".ocell.onnow").forEach(function(c){ var t = c.querySelector(".nowtag"), o = c.querySelector(".gst, .orb"), nm = c.querySelector("b");
            c.setAttribute("aria-label", (nm ? nm.textContent : "") + ", on now"); }); }, 500); } }, 400); }
    if (TAB === "Library") { var P = document.getElementById("phrvP"); if (P) {
      var EQ = '<span class="eqb" aria-hidden="true"><i></i><i></i><i></i></span>';
      setInterval(function(){
        P.querySelectorAll(".onnow").forEach(function(el){ if (el.classList.contains("cell")) return; var b = el.querySelector("b"); if (b && !b.querySelector(".eqb")) { b.insertAdjacentHTML("afterbegin", EQ); el.setAttribute("aria-label", b.textContent + ", on now"); } });
        P.querySelectorAll("[data-open] .eqb").forEach(function(q){ var el = q.closest("[data-open]"); if (!el.classList.contains("onnow")) q.remove(); });
        P.querySelectorAll(".isub").forEach(function(x){ var t = x.textContent; if (/ \u00b7 On now$/.test(t)) x.innerHTML = EQ + "On now \u00b7 " + t.replace(/ \u00b7 On now$/, ""); });
      }, 250); } }
    if (TAB === "Library" && st === "scene2") setTimeout(function(){ var o = Array.prototype.filter.call(document.querySelectorAll("#phrvP [data-open]"), function(x){ return x.offsetParent; }); if (o[1]) o[1].click(); }, 700);
    if (TAB === "Remote" && st === "ready") setTimeout(function(){ var r = document.getElementById("fl2"); if (!r) return; var c = function(s){ var x = r.querySelector(s); if (x) x.click(); };
      c(".crow .dot"); c('[data-pick="sound"]'); c('[data-pick="scent"]'); }, 900);
    var waitMs = 1800;
    if (window.__DLG) setTimeout(function(){ dialog(window.__DLG); }, waitMs);
    if (window.__INL) setTimeout(function(){ var b = Array.prototype.filter.call(document.querySelectorAll(SEL), function(x){ return x.offsetParent; })[0]; if (!b) return;
      b._label = "Set the scene"; if (window.__INL === "wait") wait(b); else showErr(b, window.__INL); }, waitMs);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ setTimeout(boot, 50); }); else setTimeout(boot, 50);
})();
</script>
"""
def layer(tab): return CONNCSS + (CONNJS % json.dumps(tab))

LIVE = """<div class="live"><div class="frame" id="frame"><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i></div>
<div class="ctl"><p class="ctlh">Test the connection</p>
<p class="ctlp">What the next attempt finds:</p>
<div class="chips" id="out"><button data-o="both" aria-pressed="true">Both connect</button><button data-o="light">Only the light</button><button data-o="sound">Only the sound</button><button data-o="none">Neither</button><button data-o="btoff">Bluetooth off</button></div>
<div class="chips"><button id="drop">Drop the connection</button><button id="reopen">Reopen the app</button><button id="reset">Reset prototype</button></div>
<p class="ctlp">The Library:</p>
<div class="chips"><button id="emo" aria-pressed="false">No check-ins yet this month</button></div>
<p class="ctlp" id="now">Now: not asked yet</p>
<p class="ctln">Starts like a first launch: Home, nothing asked. Open the Remote (or set a scene) to see Android ask for Nearby devices.</p>
<p class="ctln">Drop the connection: the Remote says &ldquo;Reconnecting&hellip;&rdquo;. With Both connect it&rsquo;s back in ~2 s; otherwise after ~5 s it falls through to what the next attempt finds.</p></div></div>"""
LIVEJS = r"""(function(){
  var frame = document.getElementById("frame"), F = {}, CONN = "never", OUT = "both", T = 0;
  var NAMES = {never:"not asked yet", connecting:"Connecting…", connected:"Connected", partly:"Partly connected (sound unavailable)", partlyL:"Partly connected (light unavailable)", reconnecting:"Reconnecting…", cant:"Can’t connect", btoff:"Bluetooth is off", denied:"Nearby devices not allowed"};
  function bcast(m){ Object.keys(F).forEach(function(k){ var w = F[k].contentWindow; if (w) w.postMessage(m, "*"); }); }
  function setC(s){ CONN = s; bcast({lamp:"conn", s:s}); document.getElementById("now").textContent = "Now: " + NAMES[s]; }
  function attempt(){ clearTimeout(T); if (OUT === "btoff") { setC("btoff"); return; } setC("connecting"); T = setTimeout(function(){ setC({both:"connected", light:"partly", sound:"partlyL", none:"cant"}[OUT]); }, 1600); }
  var UP = {connected: 1, partly: 1, partlyL: 1};
  function pickOut(o){ OUT = o; document.querySelectorAll("#out button").forEach(function(b){ b.setAttribute("aria-pressed", String(b.dataset.o === o)); }); }
  function build(){ Object.keys(F).forEach(function(k){ frame.removeChild(F[k]); }); F = {}; clearTimeout(T); CONN = "never"; pickOut("both"); document.getElementById("emo").setAttribute("aria-pressed", "false"); document.getElementById("now").textContent = "Now: " + NAMES.never;
    ["Home", "Library", "Remote"].forEach(function(t){ var f = document.createElement("iframe"); f.title = t; if (t === "Home") f.className = "on"; f.srcdoc = TABS[t]; frame.insertBefore(f, frame.firstChild); F[t] = f; }); }
  build();
  document.querySelectorAll("#out button").forEach(function(b){ b.addEventListener("click", function(){ pickOut(b.dataset.o); }); });
  /* 3 Nov: a drop mid-use: Reconnecting... (the Remote only); back within ~5 s, or it falls through to the outcome */
  document.getElementById("drop").addEventListener("click", function(){ if (!UP[CONN]) return; clearTimeout(T); setC("reconnecting");
    T = setTimeout(function(){ if (OUT === "btoff") return setC("btoff"); setC({both:"connected", light:"partly", sound:"partlyL", none:"cant"}[OUT]); }, OUT === "both" ? 2000 : 5000); });
  document.getElementById("emo").addEventListener("click", function(){ var b = this, on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", String(on)); if (F.Library) F.Library.contentWindow.postMessage({lamp:"emptymonth", on:on}, "*"); });
  document.getElementById("reopen").addEventListener("click", function(){ if (CONN !== "never" && CONN !== "denied") attempt(); });
  document.getElementById("reset").addEventListener("click", function(){ try { ["hero1-pal", "library-swipe-hint-seen"].forEach(function(k){ localStorage.removeItem(k); }); } catch (x) {} build(); });
  window.addEventListener("message", function(e){ var d = e.data || {}, src = e.source;
    if (!Object.keys(F).some(function(k){ return F[k].contentWindow === src; })) return;   /* the state phones below run on their own */
    if (d.lamp === "nav" && F[d.to]) { Object.keys(F).forEach(function(k){ F[k].className = k === d.to ? "on" : ""; });
      if (d.to === "Remote" && CONN === "never") setTimeout(function(){ F.Remote.contentWindow.postMessage({lamp:"conndlg", k:"perm"}, "*"); }, 350); }
    if (d.lamp === "set" || d.lamp === "all" || d.lamp === "names") Object.keys(F).forEach(function(k){ var w = F[k] && F[k].contentWindow; if (w && w !== src) w.postMessage(d, "*"); });
    if (d.lamp === "connact") { var a = d.act;
      if (a === "hello") src.postMessage({lamp:"conn", s:CONN}, "*");
      else if (a === "ask") { if (CONN === "never") src.postMessage({lamp:"conndlg", k:"perm"}, "*"); }
      else if (a === "allow" || a === "retry" || a === "settings") attempt();
      else if (a === "deny") setC("denied");
      else if (a === "bton") src.postMessage({lamp:"conndlg", k:"bt"}, "*");
      else if (a === "btallow") { if (OUT === "btoff") pickOut("both"); attempt(); }
      else if (a === "btdeny") setC("btoff"); } });
})();
"""

# ================= the flows (drawn as plain boxes) =================

def node(t, sub="", k=""): return '<div class="n %s"><b>%s</b>%s</div>' % (k, t, ('<small>%s</small>' % sub) if sub else "")
AR = '<div class="ar" aria-hidden="true">&rarr;</div>'
def arl(t): return '<div class="arl"><span>%s</span><i aria-hidden="true">&rarr;</i></div>' % t
def branch(items): return '<div class="br">' + ''.join('<div class="bi"><span class="lbl">%s</span>%s</div>' % (l, n) for l, n in items) + '</div>'
OUTCOMES = [("Both", node("Connected", "Remote line, grey. Home and Library: nothing.", "ok")),
            ("One", node("Partly connected", "Remote: grey line + &ldquo;Sound unavailable &middot; Try again&rdquo; (or &ldquo;Light unavailable&rdquo;) on that part&rsquo;s card. Home, Library: those words beside Me.", "warn")),
            ("Neither", node("Can&rsquo;t connect &middot; Try again", "On every tab, beside Me.", "bad")),
            ("Bluetooth off", node("Bluetooth is off &middot; Turn on", "On every tab, beside Me. Turn on opens Android&rsquo;s prompt.", "bad"))]
FLOWS = """<div class="flow"><h3>1 &middot; The first time</h3><p class="fl">No setup screens. Home works without the lamp (the check-in needs nothing).</p><div class="fr">
""" + node("Opens the Remote, or presses Set the scene", "the first time either happens") + AR + node("Android: Allow nearby devices?", "the system prompt", "sys") + arl("Allow") + node("Connecting&hellip;", "light and speaker in parallel; Remote line only") + AR + branch(OUTCOMES) + """</div>
<div class="fr ind">""" + arl("Don&rsquo;t allow") + node("Allow nearby devices &middot; Open settings", "on every tab, beside Me", "bad") + """</div></div>
<div class="flow"><h3>2 &middot; Every time after</h3><p class="fl">The app reconnects by itself to the light and speaker it found the first time.</p><div class="fr">
""" + node("The app opens", "on Home, as always") + AR + node("Connecting&hellip;", "Remote line only; Home stays quiet") + AR + branch(OUTCOMES) + """</div>
<div class="fr">""" + node("The connection drops while you use it", "e.g. mid-drag on the Remote") + AR + node("Reconnecting&hellip;", "Remote line only, grey; the controls keep working") + AR + branch([
    ("back within ~5 s", node("Connected", "the latest values are sent", "ok")),
    ("one part, after ~5 s", node("Partly connected", "that part&rsquo;s card: unavailable &middot; Try again", "warn")),
    ("neither, after ~5 s", node("Can&rsquo;t connect &middot; Try again", "values kept; Try again sends them", "bad"))]) + """</div></div>
<div class="flow"><h3>3 &middot; Set the scene when it isn&rsquo;t connected</h3><p class="fl">Home&rsquo;s result, the Library&rsquo;s scene view, the Remote from scratch. Starting is explicit, so a failure shows right where you pressed (decided 2 Nov, option a).</p><div class="fr">
""" + node("Set the scene") + AR + node("Setting the scene&hellip;", "button disabled; the command waits (first time: Android asks first)") + AR + branch([
    ("connects", node("The scene is set", "as today. Only one part: &ldquo;Light sent &middot; Sound unavailable&rdquo; / &ldquo;Sound sent &middot; Light unavailable&rdquo;.", "ok")),
    ("can&rsquo;t", node("&ldquo;Can&rsquo;t connect. Move closer and try again.&rdquo;", "one line above; the button says Try again", "bad")),
    ("Bluetooth off", node("&ldquo;Bluetooth is off.&rdquo;", "the button says Turn on Bluetooth", "bad")),
    ("not allowed", node("&ldquo;Allow nearby devices to connect.&rdquo;", "the button says Open settings", "bad"))]) + AR + node("The fix", "Try again / Android&rsquo;s prompt / Android settings &rarr; back to Setting the scene&hellip;") + """</div></div>
<div class="flow"><h3>4 &middot; The fixes</h3><div class="fr">""" + branch([
    ("Try again", node("Connecting&hellip;", "then one of the outcomes")),
    ("Turn on", node("Android: turn on Bluetooth?", "Allow &rarr; Connecting&hellip;", "sys")),
    ("Open settings", node("Android settings for the app", "Nearby devices on &rarr; back &rarr; Connecting&hellip;", "sys"))]) + """</div></div>"""

# ================= the state phones =================
def fig(h, p, tab, st="", conn="never", **o):
    d = {"__STATE": st, "__CONN": conn, "__CONNSTATIC": True}; d.update(o)
    return '<figure><div class="ph" data-tab="%s" data-o=\'%s\'><i class="cn tl"></i><i class="cn tr"></i><i class="cn bl"></i><i class="cn br"></i></div><figcaption><h3>%s</h3><p>%s</p></figcaption></figure>\n' % (tab, json.dumps(d).replace("'", "&#39;"), h, p)
G1 = [fig("1 &middot; First time on the Remote", "Android asks for Nearby devices. Nothing of ours on screen yet.", "Remote", "", "never", __DLG="perm"),
      fig("2 &middot; Connecting&hellip;", "Light and speaker in parallel. Grey, no action: nothing to do yet.", "Remote", "", "connecting"),
      fig("3 &middot; Connected", "Grey, beside Me. Not a button.", "Remote", "playing", "connected"),
      fig("4 &middot; Not allowed", "&ldquo;Allow nearby devices &middot; Open settings&rdquo;: the whole line is the button.", "Remote", "", "denied")]
G2 = [fig("5 &middot; Partly connected", "Grey line; the Sound card says what and offers the fix. Light keeps working.", "Remote", "playing", "partly"),
      fig("6 &middot; Can&rsquo;t connect", "Red line, the whole line is Try again. Your settings stay. A lamp in use by another phone shows this too: over Bluetooth the phone can&rsquo;t tell the difference (confirm with the dev).", "Remote", "playing", "cant"),
      fig("7 &middot; Bluetooth is off", "Turn on opens Android&rsquo;s own prompt (next phone).", "Remote", "playing", "btoff"),
      fig("8 &middot; Turn on: Android&rsquo;s prompt", "Allow &rarr; Connecting&hellip;", "Remote", "playing", "btoff", __DLG="bt")]
G3 = [fig("9 &middot; Home, all fine", "Nothing about the connection.", "Home", "set", "connected"),
      fig("10 &middot; Home, can&rsquo;t connect", "The same line as the Remote&rsquo;s, in the same place, beside Me.", "Home", "set", "cant"),
      fig("11 &middot; Home, sound unavailable", "Names the part that failed.", "Home", "set", "partly"),
      fig("12 &middot; Library, Bluetooth off", "Same line, same place.", "Library", "", "btoff")]
G4 = [fig("13 &middot; First Set the scene", "On Home&rsquo;s result, the first time: Android asks; the button waits.", "Home", "result", "never", __DLG="perm", __INL="wait"),
      fig("14 &middot; Can&rsquo;t reach it", "One line right above; the button becomes Try again.", "Home", "result", "cant", __INL="cant"),
      fig("15 &middot; Bluetooth off", "The button becomes the fix.", "Home", "result", "btoff", __INL="btoff"),
      fig("16 &middot; Only the light arrived", "The existing message bar: &ldquo;Light sent &middot; Sound unavailable&rdquo;. (Press Set the scene on this phone.)", "Home", "result", "partly"),
      fig("17 &middot; Library scene view", "Same line, same button change.", "Library", "scene2", "cant", __INL="cant"),
      fig("18 &middot; Remote, from scratch", "No room above this button (the Scent row is there), so the Remote&rsquo;s top line says what happened and the button becomes Try again.", "Remote", "ready", "cant", __INL="cant")]

