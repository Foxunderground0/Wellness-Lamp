# code_states.py (5 Nov 2026, Rida): the states that existed only in code, drawn as phones in FINAL_screens.html.
# Each phone opens its tab in a state (__STATE), then window.__S3 names a short script that taps through to the state,
# the way a person would. Every step retries until it has happened. build_final.py adds layer(tab) to each tab.
import json
import connection_layer as CL

JS = r"""<script>/* code_states.py: drive a phone into a state for FINAL_screens (window.__S3) */
(function(){ var S3 = window.__S3, TAB = @@TAB@@; if (!S3) return;
  var all = function(s){ return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var vis = function(s){ return all(s).filter(function(e){ return e.getClientRects().length && getComputedStyle(e).visibility !== "hidden"; })[0]; };
  var tap = function(s){ var e = typeof s === "string" ? vis(s) : s; if (!e || e.disabled) return false; e.click(); return true; };
  var answer = function(){ var sc = vis("#home .qlayer [data-scale]"); if (!sc) return false; for (var i = 0; i < 6; i++) sc.dispatchEvent(new KeyboardEvent("keydown", {key: "ArrowRight", bubbles: true})); return true; };
  var wait = function(ms){ var t0 = 0; return function(){ if (!t0) t0 = Date.now(); return Date.now() - t0 >= ms; }; };
  var pin = function(sel){ return function(){ var s = vis(sel + ".show") || document.querySelector(sel + ".show"); if (!s) return false;
    setInterval(function(){ s.classList.add("show"); }, 100); return true; }; };
  var freeze = function(){ var f = performance.now(), d = Date.now(); performance.now = function(){ return f; }; Date.now = function(){ return d; }; return true; };
  var drag = function(){ var ph = document.getElementById("fl1"), svg = ph && ph.querySelector("svg.rg"); if (!svg) return false;
    var r = svg.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2, R = r.width*0.44;
    var at = function(deg){ var a = deg*Math.PI/180; return {clientX: cx + R*Math.cos(a), clientY: cy - R*Math.sin(a)}; };
    var ev = function(t, p){ svg.dispatchEvent(new PointerEvent(t, Object.assign({bubbles: true, pointerId: 7, pointerType: "touch", isPrimary: true, button: 0, buttons: 1}, p))); };
    ev("pointerdown", at(60)); [52, 44, 36, 30].forEach(function(d, i){ setTimeout(function(){ ev("pointermove", at(d)); }, 60*(i + 1)); });
    /* a synthetic pointer cannot be captured, so show the drag label the way a held finger would */
    setTimeout(function(){ var rb = svg.closest(".ringbox"), bp = rb && rb.querySelector(".bp"); if (!rb) return;
      rb.classList.add("drag"); if (bp) bp.textContent = Math.max(5, Math.round(+svg.dataset.v*100)) + "%"; }, 400);
    return true; };
  var Q = function(n){ var k = 0; return function(){ if (k === 0) { if (answer()) k = 1; return false; } if (n > 1 && tap("#home .qlayer [data-next]")) { n--; k = 0; } return n <= 1; }; };
  var STEPS = {
    /* Home */
    c3: [function(){ return tap("#home [data-start]"); }, Q(5), function(){ return answer(); }],
    c4: [function(){ return tap("#home [data-start]"); }, Q(5), function(){ return answer(); }, function(){ return tap("#home .qlayer [data-see2]"); }, wait(1600), freeze],
    notnow: [function(){ return tap("#home [data-notnow]"); }],
    h5: [function(){ return tap("#home [data-start]"); }, Q(2), function(){ return answer(); }, function(){ return tap("#home .qlayer .close"); }],
    alloff: [wait(600), function(){ var a = vis("#home [data-homeall]"); if (!a || a.getAttribute("aria-checked") !== "true") return false; a.click(); return true; }],
    sent: [function(){ return tap("#home .setbtn"); }, pin("#home .snack")],
    /* Library */
    l10: [function(){ var p = vis('#phrvP [data-pane="Checkins"]'); if (!p) return false; if (/No check-ins in/.test(p.textContent)) return true; tap('#phrvP [data-pane="Checkins"] .mprev'); return false; }],
    l15: [function(){ return tap('#phrvP .rowi[data-open="Checkins:1"]'); }, wait(900), function(){ return tap("#phrvP .inside .isave"); }],
    /* Remote */
    r2: [function(){ return tap('#fl2 .switch[data-part="light"]'); }],
    save: [function(){ var ph = document.getElementById("fl1"); if (!ph || !ph.__edit) return false; ph.__edit("track", "Fireplace"); return true; }],
    cycle: [function(){ return tap("#fl1 .cyb"); }],
    ring: [wait(400), drag],
    rename: [function(){ return tap("#scrScent .srow3 .more"); }, function(){ return tap('#scrScent .acts3 [data-a="ren"]'); }]
  };
  var list = STEPS[S3]; if (!list) return; var i = 0, n = 0;
  setTimeout(function(){ var t = setInterval(function(){ if (++n > 60) { clearInterval(t); return; }
    try { if (list[i]()) { i++; n = 0; if (i >= list.length) clearInterval(t); } } catch (x) { console.error("state " + S3, x); clearInterval(t); } }, 300); }, 900);
})();
</script>"""

def layer(tab):
    return JS.replace("@@TAB@@", json.dumps(tab))

f = CL.fig
ON = "connected"
HOMEF = [f("After the 5th answer", "See my mood (filled) and &ldquo;Keep going for a sharper read&rdquo; take the Skip &middot; Next row&rsquo;s place. See my mood stays on later cards; no total is ever shown.", "Home", "", ON, __S3="c3"),
         f("Reading your answers", "Back on Home&rsquo;s layout, no button: the pearl develops into the mood&rsquo;s colours (about 4 s, Long exposure: MOTION.md). Held here part-way.", "Home", "", ON, __S3="c4"),
         f("Result", "&ldquo;Tonight&rdquo;, the mood&rsquo;s name and line, its sound and scent, Set the scene and Not now.", "Home", "result", ON),
         f("Mood not set", "After Not now: the mood&rsquo;s name, &ldquo;Not set yet. You can set it any time.&rdquo; and Set the scene (outline).", "Home", "result", ON, __S3="notnow"),
         f("Unfinished check-in", "Closed with &times; after two answers: the button reads Continue and picks up at the next question.", "Home", "", ON, __S3="h5"),
         f("All off", "All switched off: the bottom row says &ldquo;Off&rdquo; and the wash recedes.", "Home", "set", ON, __S3="alloff"),
         f("Message bar on Home", "&ldquo;Sent to your room &middot; Undo&rdquo;, directly above the bottom row, 5 s (held here).", "Home", "result", ON, __S3="sent")]
LIBF = [f("A month with none", "A past month without check-ins: &ldquo;No check-ins in [month].&rdquo; &lsaquo; and &rsaquo; still move between months.", "Library", "checkins", ON, __S3="l10"),
        f("Naming sheet", "Save as a scene, from a check-in&rsquo;s scene view: the sheet over a dimmed backdrop; the name starts as the mood&rsquo;s (numbered if taken); Cancel / Save.", "Library", "checkins", ON, __S3="l15")]
REMF = [f("Remote, building (preview)", "The first change from the start: &ldquo;New scene&rdquo;, nothing has reached the lamp yet, the player shows &#9654;. Pick light, sound, scent (disabled) until all three are chosen, then Set the scene.", "Remote", "", ON, __S3="r2"),
        f("Something to save", "A playing scene changed (here its track): Undo &middot; Save &middot; Redo at the bottom.", "Remote", "playing", ON, __S3="save"),
        f("Cycling", "Cycle on: the key takes the strong surface and its edge line; the speed slider shows under the dots.", "Remote", "playing", ON, __S3="cycle"),
        f("Brightness, while dragging", "The value shows in the ring while a finger is on it (5 to 100%).", "Remote", "playing", ON, __S3="ring"),
        f("Scent rename", "&#8943; &rarr; Rename (the pencil): the field with the current name, all selected; &#10003; saves, &#10005; cancels.", "Remote", "scent", ON, __S3="rename")]
IDS = {"After the 5th answer": "C-3", "Reading your answers": "C-4", "Result": "C-5", "Mood not set": "H-4", "Unfinished check-in": "H-5",
       "All off": "H-6", "Message bar on Home": "X-1c", "A month with none": "L-10", "Naming sheet": "L-15",
       "Remote, building (preview)": "R-2", "Something to save": "R-3b", "Cycling": "R-3c", "Brightness, while dragging": "R-3d", "Scent rename": "R-6b"}
