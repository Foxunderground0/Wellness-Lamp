# build_gallery.py: build handoff/design-system/component-gallery.html from FINAL_screens.html.
# Every card is a phone from FINAL_screens (the same tab documents, the same withState), cropped to one component.
# --live writes the page with live phones (iframes); shoot_gallery.js photographs each card of that page into
# design-system/gallery/, and the default build is the page of those pictures (no iframes, nothing to load).
# usage: python build_gallery.py [path/to/FINAL_screens.html] [--live] [--out path/to/component-gallery.html]
import html, json, os, re, struct, sys

T = os.path.dirname(os.path.abspath(__file__))
HANDOFF = os.path.normpath(os.path.join(T, '..', 'handoff'))
SHOTS = os.path.join(HANDOFF, 'design-system', 'gallery')
args = sys.argv[1:]
OUT = os.path.join(HANDOFF, 'design-system', 'component-gallery.html')
LIVE = '--live' in args
if LIVE: args.remove('--live')
if '--out' in args:
    i = args.index('--out'); OUT = args[i + 1]; del args[i:i + 2]
SRC = args[0] if args else os.path.join(HANDOFF, 'prototype', 'FINAL_screens.html')
DS = os.path.join(HANDOFF, 'DESIGN_SYSTEM.md')
TOKENS = os.path.join(HANDOFF, 'design-system', 'tokens.json')


# ---------------------------------------------------------------- what each card shows
# S: a state cropped from a phone. sel = CSS selector inside the phone; the first visible match is used,
#    or with union=True every visible match together. run = JS run inside the phone after it loads (a tap FINAL's
#    own controls make), at run_at ms. how = what the run does, for the caption.
# F: the full phone at 50%.   H: drawn as nothing (a hidden state), caption only.   N: a state FINAL draws nowhere.
def S(label, sid, sel, union=False, pad=8, run=None, run_at=2500, how=None):
    return dict(k='S', label=label, id=sid, sel=sel, union=union, pad=pad, run=run, run_at=run_at, how=how)
def F(label, sid): return dict(k='F', label=label, id=sid)
def H(label, sid): return dict(k='H', label=label, id=sid)
def N(label): return dict(k='N', label=label)

def U(*sels): return ', '.join(sels)
HOME, LIB, REM, SUB = '#home ', '#phrvP ', '.fl.act ', '.scr.act '
VIS = "Array.prototype.filter.call(document.querySelectorAll(%s), function(x){ return x.getClientRects().length; })[0]"
def tap(sel): return "var e = " + (VIS % json.dumps(sel)) + "; if (e) e.click();"
def pin(sel): return ("var pt = setInterval(function(){ var s = document.querySelector(%s); if (s) { clearInterval(pt); "
                      "setInterval(function(){ s.classList.add('show'); }, 100); } }, 100);" % json.dumps(sel))

SPEC = {
# ----- Shared, Home and check-in
'c-page-header': [
    S('Date (Home)', 'H-1', U(HOME + '.corner', HOME + '.me'), union=True),
    S('Page title (Library)', 'L-1', U(LIB + '.ptitle', LIB + '.me'), union=True),
    S('Page title with the connection line (Remote)', 'R-3', U(REM + '.ptitle', REM + '.me', REM + '.cline'), union=True),
    S('Date with a problem line (Home)', 'X-2j', U(HOME + '.corner', HOME + '.me', HOME + '.cline'), union=True),
],
'c-me-button': [S('Default', 'H-10', HOME + '.me')],
'c-connection-line': [
    S('Info: Connecting…', 'X-2a', U(REM + '.cline', REM + '.me'), union=True),
    S('Info: Connected', 'X-2b', U(REM + '.cline', REM + '.me'), union=True),
    S('Info: Partly connected', 'X-3a', U(REM + '.cline', REM + '.me'), union=True),
    S('Info: Reconnecting…', 'X-2g', U(REM + '.cline', REM + '.me'), union=True),
    S('Problem: Can’t connect · Try again', 'X-2d', U(REM + '.cline', REM + '.me'), union=True),
    S('Problem: Bluetooth is off · Turn on', 'X-2e', U(REM + '.cline', REM + '.me'), union=True),
    S('Problem, two lines: Allow nearby devices / Open settings', 'X-2c', U(REM + '.cline', REM + '.me'), union=True),
    S('Problem on Home: Sound unavailable · Try again', 'X-2k', U(HOME + '.cline', HOME + '.me'), union=True),
    S('Problem on Home: Light unavailable · Try again', 'X-2f', U(HOME + '.cline', HOME + '.me'), union=True),
    S('Problem on Home: Can’t connect · Try again', 'X-2j', U(HOME + '.cline', HOME + '.me'), union=True),
    S('Problem on the Library: Bluetooth is off · Turn on', 'X-2l', U(LIB + '.cline', LIB + '.me'), union=True),
    H('Hidden: Home when all is fine', 'X-2i'),
],
'c-tab-bar': [
    S('Home is the current tab', 'H-1', '.nvn'),
    S('Library is the current tab', 'L-1', '.nvn'),
    S('Remote is the current tab', 'R-3', '.nvn'),
],
'c-pill-button': [
    S('Filled, main: Set the scene', 'C-5', HOME + '.setbtn'),
    S('Outline, main: Check in', 'H-1', HOME + '.mainbtn'),
    S('Text, main: Not now', 'C-5', HOME + '.notnow'),
    S('Outline, main (Library): Go to Remote', 'L-5', LIB + '.empty .go'),
    S('Filled, row: Save', 'L-4', LIB + '.e5a [data-act=ok]'),
    S('Text, row: Cancel', 'L-4', LIB + '.e5a [data-act=cancel]'),
    S('Outline, row (Remote): Save', 'R-3b', REM + '.btm .cta'),
    S('Disabled, filled: Next before an answer', 'C-1', '.qlayer [data-next]'),
    S('Disabled, row: Pick light, sound, scent', 'R-2', REM + '.btm .cta'),
    S('Busy: Setting the scene…', 'X-4a', HOME + '.setbtn'),
    S('Label changed to the fix: Try again', 'X-4b', HOME + '.setbtn'),
    N('Pressed (the shared pressed overlay; Set the scene also shrinks to 0.97)'),
    N('Disabled, outline (outline-faint border)'),
],
'c-text-link-button': [
    S('Skip', 'C-1', '.qlayer [data-skip]'),
    S('Keep going for a sharper read', 'C-3', '.qlayer [data-keep]'),
    S('Choose (underlined)', 'R-1', REM + '[data-pick=sound]'),
],
'c-round-icon-button': [
    S('Pause, 48 (the Remote’s player)', 'R-3', REM + '.mgtr .ck:not(.bare)'),
    S('Play, 48 (a preview)', 'R-2', REM + '.mgtr .ck:not(.bare)'),
    S('Play, 52 (the Sound screen’s player)', 'R-5', SUB + '.scfull3 .ck:not(.bare)'),
    N('Pressed (fill surface-strong)'),
],
'c-icon-button': [
    S('× Close the check-in', 'C-1', '.qlayer .close'),
    S('‹ Previous question', 'C-3', '.qlayer .backicon'),
    S('× Close the scene view', 'L-12', '.inside .ix'),
    S('◀◀ Previous track', 'R-3', REM + '.mgtr [aria-label="Previous track"]'),
    S('▶▶ Next track', 'R-3', REM + '.mgtr [aria-label="Next track"]'),
    S('Undo, 44', 'R-3b', REM + '.btm .ur.u'),
    S('Redo, 44, disabled', 'R-3b', REM + '.btm .ur.r'),
    S('‹ Back to the Remote', 'R-4', SUB + '.back'),
    S('⋯ in a saved scene’s view', 'L-2', '.inside button[aria-label^="More"]', run=tap(LIB + '[data-open="Saved:3"]'), how='tapped a saved scene'),
    N('Pressed (the shared pressed overlay, round)'),
],
'c-toggle-switch': [
    S('Large, on: Home’s All', 'H-2', HOME + '[data-homeall]'),
    S('Large, off: Home’s All', 'H-6', HOME + '[data-homeall]'),
    S('Large, on, another scene’s colour', 'H-3', HOME + '[data-homeall]'),
    S('Large, on: the Remote’s All', 'R-3', REM + '.topall'),
    S('Large, off: the Remote’s All', 'R-1', REM + '.topall'),
    S('Small, on: Light', 'R-3', REM + '[data-part=light]'),
    S('Small, off: Light', 'R-1', REM + '[data-part=light]'),
],
'c-message-bar': [
    S('With Undo: Sent to your room (Home)', 'X-1c', HOME + '.snack.show'),
    S('With Undo: Sent to your room (Library)', 'L-11', LIB + '.snack.show'),
    S('Message only: Sound sent · Light unavailable', 'X-1a', HOME + '.snack.show',
      run=tap(HOME + '.setbtn') + pin(HOME + '.snack.show'), how='pressed Set the scene'),
    S('Message only: Light sent · Sound unavailable', 'X-1b', HOME + '.snack.show',
      run=tap(HOME + '.setbtn') + pin(HOME + '.snack.show'), how='pressed Set the scene'),
    S('With Undo: Scene deleted', 'L-3', LIB + '.snack.show',
      run=tap(LIB + '.srow.acts [data-act=delete]') + pin(LIB + '.snack.show'), how='tapped the trash'),
    N('Message only: Changes saved, Renamed, Saved'),
],
'c-part-unavailable-line': [
    S('Card size: Sound unavailable', 'X-3a', REM + '.cun'),
    S('Card size: Light unavailable', 'X-3b', REM + '.cun'),
    S('List size: above the Remote’s player', 'R-5c', SUB + '.cun.sun'),
    S('List size: under a track (Library)', 'L-13g', '.sds5 .cun.sun'),
],
'c-playing-bars': [
    S('Before a preset’s name', 'L-11', LIB + '.ocell.onnow b'),
    S('Before tonight’s check-in', 'L-6', LIB + '.rowi.onnow b'),
    S('Before “On now” in the scene view', 'L-12', '.inside .isub'),
    S('Before the current track (Remote)', 'R-5', SUB + '.trow2.on'),
    S('Sound-line size, while the preview plays', 'L-12', '.inside .snd5', run=tap('.inside .snd5'), how='tapped the sound line'),
    N('Still (with Android’s Remove animations)'),
],
'c-scene-name-field': [
    S('Empty: Done disabled', 'R-7a', U(REM + '.nmf', REM + '.nmf .nh'), union=True),
    S('From 25 characters: 27 of 30', 'R-7b', U(REM + '.nmf', REM + '.nmf .nh'), union=True),
    S('A name that’s taken', 'R-7c', U(REM + '.nmf', REM + '.nmf .nh'), union=True),
],
'c-home-stage': [
    F('Pearl (before the check-in)', 'H-1'),
    F('A scene set', 'H-2'),
    F('All off', 'H-6'),
    N('Daytime (H-8) and Sleep well (H-7)'),
],
'c-home-headline': [
    S('Question title', 'H-1', HOME + 'h2.title'),
    S('Label and mood name', 'C-5', U(HOME + '.label', HOME + 'h2.title[data-title]'), union=True),
    S('Label and scene name', 'H-2', U(HOME + '.label', HOME + 'h2.title[data-title]'), union=True),
    S('Line: the start', 'H-1', HOME + 'p.line'),
    S('Line: the mood’s line', 'C-5', HOME + 'p.line[data-line]'),
    S('Line: Made on the Remote', 'H-3', HOME + 'p.line[data-line]'),
    S('Line: Not set yet', 'H-4', HOME + 'p.line'),
    S('Line: Reading your answers…', 'C-4', HOME + 'p.line'),
    N('A long title stepping down from display to headline, then title'),
],
'c-home-scene-details': [
    S('Shown (the result)', 'C-5', HOME + '.details'),
    H('Gone once the scene is set', 'H-2'),
],
'c-home-main-button': [
    S('Check in', 'H-1', HOME + '.mainbtn'),
    S('Continue', 'H-5', HOME + '.mainbtn'),
    S('Check in again', 'H-2b', HOME + '.mainbtn'),
    S('Set the scene (after Not now)', 'H-4', HOME + '.mainbtn'),
],
'c-home-bottom-row': [
    S('Set at [time]', 'H-2', HOME + '.bottomrow'),
    S('Off (All off)', 'H-6', HOME + '.bottomrow'),
    N('Adjusted at [time] (H-9)'),
],
'c-check-in-screen': [
    F('First round, first question', 'C-1'),
    F('After the 5th answer', 'C-3'),
    N('Later rounds (no circles; Skip · Next outline, then See my mood)'),
],
'c-check-in-top-bar': [
    S('First card: ‹ hidden, keeps its place', 'C-1', U('.qlayer .backicon', '.qlayer .dots5', '.qlayer .close'), union=True),
    S('With ‹ (a previous answer)', 'C-3', U('.qlayer .backicon', '.qlayer .dots5', '.qlayer .close'), union=True),
],
'c-check-in-progress': [
    S('None answered', 'C-1', '.qlayer .dots5 i', union=True),
    S('Some answered', 'C-3', '.qlayer .dots5 i', union=True),
    N('Gone from the second round on'),
],
'c-check-in-question': [
    S('A question', 'C-1', '.qlayer .q'),
    S('Another question', 'C-3', '.qlayer .q'),
],
'c-answer-scale': [
    S('Unanswered, with the hint (the first card; C-2 is drawn on C-1)', 'C-1', U('.qlayer .ends', '.qlayer .scale', '.qlayer .hint'), union=True),
    S('Answered: the knob', 'C-3', U('.qlayer .ends', '.qlayer .scale'), union=True),
    N('Pressed / dragging (the knob grows, with a ring)'),
],
'c-check-in-actions': [
    S('First round: Skip · Next', 'C-1', '.qlayer .actrow'),
    S('After the 5th answer: Keep going, See my mood', 'C-3', U('.qlayer [data-keep]', '.qlayer [data-see2]'), union=True),
    N('Later cards: Skip · Next (outline), then See my mood'),
],
'c-result-actions': [
    S('Set the scene · Not now', 'C-5', U(HOME + '.setbtn', HOME + '.notnow'), union=True),
    S('Setting the scene…', 'X-4a', U(HOME + '.setbtn', HOME + '.notnow'), union=True),
    S('Can’t reach the lamp: Try again', 'X-4b', U(HOME + '.cerr', HOME + '.setbtn', HOME + '.notnow'), union=True),
    S('Bluetooth off: Turn on Bluetooth', 'X-4c', U(HOME + '.cerr', HOME + '.setbtn', HOME + '.notnow'), union=True),
    N('Permission denied: Allow nearby devices to connect. + Open settings'),
],
# ----- Remote
'c-remote-screen': [
    F('Nothing on yet (the start)', 'R-1'),
    F('Preview: New scene', 'R-2'),
    F('Live: a scene playing', 'R-3'),
    F('Naming', 'R-7a'),
    F('A part unavailable', 'X-3a'),
],
'c-remote-scene-line': [
    S('Nothing on yet', 'R-1', U(REM + '.hdr', REM + '.topall'), union=True),
    S('New scene', 'R-2', U(REM + '.hdr', REM + '.topall'), union=True),
    S('A scene', 'R-3', U(REM + '.hdr', REM + '.topall'), union=True),
    S('Naming: the name field takes the row', 'R-7a', REM + '.nmf'),
    N('Your own saved scene (the pencil after the name)'),
    N('All off with a scene loaded (the name turns text-muted)'),
],
'c-remote-card-header': [
    S('Light', 'R-3', REM + '.mgh:has([data-tab=Light])'),
    S('Sound', 'R-3', REM + '.mgh:has([data-tab=Sound])'),
    S('Scent, with the scent’s name', 'R-3', REM + '.mgh:has([data-tab=Scent])'),
    S('Scent, nothing chosen: Choose', 'R-1', REM + '.mgh:has([data-tab=Scent])'),
    N('Pressed (heading button)'),
],
'c-brightness-ring': [
    S('Resting', 'R-3', REM + '.ringbox'),
    S('Dragging: the value', 'R-3d', REM + '.ringbox'),
    S('Nothing on yet / Light off', 'R-1', REM + '.ringbox'),
    S('Light unavailable: the line takes its place', 'X-3b', REM + '.cun'),
],
'c-colour-dots': [
    S('The Remote’s 4, one held', 'R-3', REM + '.dset'),
    S('Nothing on yet: pearl dots', 'R-1', REM + '.dset'),
    S('The Light screen’s 8', 'R-4', SUB + '.d8'),
    N('A colour from 5 to 8 held in the 4th slot'),
    N('Light off with a scene loaded (the row dimmed)'),
],
'c-cycle-key': [
    S('Off: Cycle', 'R-3', REM + '.cyb'),
    S('On: Cycling', 'R-3c', REM + '.cyb'),
    S('Nothing on yet (dimmed)', 'R-1', REM + '.cyb'),
],
'c-cycle-speed-slider': [S('Cycle on', 'R-3c', REM + '.spd')],
'c-line-slider': [
    S('Volume', 'R-3', REM + '.srow2'),
    S('Volume, Sound off (dimmed)', 'R-1', REM + '.srow2'),
    S('Cycle speed', 'R-3c', REM + '.spd'),
    S('Colour range', 'R-4', SUB + '.rng'),
    N('Volume while dragging (the value replaces the icon)'),
],
'c-sound-player': [
    S('Remote, live: pause', 'R-3', REM + '.mgtr'),
    S('Remote, preview: play', 'R-2', REM + '.mgtr'),
    S('Remote, no sound yet', 'R-1', REM + '.mgtr'),
    S('Sound screen, pinned with the volume', 'R-5', SUB + '.scfull3'),
    S('Sound screen, speaker unavailable', 'R-5c', U(SUB + '.cun.sun', SUB + '.scfull3'), union=True),
    S('Sound unavailable: the line takes its place', 'X-3a', REM + '.cun'),
],
'c-remote-sound-line': [
    S('Sound line: a track', 'R-3', REM + '.mgtn'),
    S('Sound line: No sound yet · Choose', 'R-1', REM + '.mgtn'),
    S('Scent line: a scent', 'R-3', REM + '.mgh:has([data-tab=Scent])'),
    S('Scent line: No scent yet · Choose', 'R-1', REM + '.mgh:has([data-tab=Scent])'),
    N('Scent off with a scent chosen (the name muted and dimmed)'),
],
'c-remote-bottom-group': [
    S('Preview: Pick light, sound, scent (disabled)', 'R-2', REM + '.btm'),
    S('Preview, all chosen: Set the scene', 'R-2', REM + '.btm',
      run="var r = document.querySelector('.fl.act'); ['.crow .dot', '[data-pick=sound]', '[data-pick=scent]'].forEach(function(s){ var x = r && r.querySelector(s); if (x) x.click(); });",
      how='picked a colour, a sound and a scent'),
    S('Live, something to save: Save', 'R-3b', REM + '.btm'),
    S('Undo and Redo, nothing to save', 'R-3c', REM + '.btm'),
    S('Can’t reach the lamp: Try again', 'X-4e', REM + '.btm'),
    H('Hidden: nothing to show', 'R-1'),
    N('Setting the scene… (busy) on the Remote'),
],
'c-sub-screen-header': [
    S('Light', 'R-4', U(SUB + '.cbar', SUB + '.scrsub'), union=True),
    S('Sound', 'R-5', U(SUB + '.cbar', SUB + '.scrsub'), union=True),
    S('Scent', 'R-6', U(SUB + '.cbar', SUB + '.scrsub'), union=True),
],
'c-light-screen': [F('Light screen', 'R-4')],
'c-colour-wheel': [
    S('Resting', 'R-4', SUB + '.gwo'),
    N('Dragging'),
],
'c-remote-sound-screen': [
    F('Default', 'R-5'),
    F('A long list', 'R-5b'),
    F('Speaker unavailable', 'R-5c'),
],
'c-remote-track-row': [
    S('Current, playing', 'R-5', SUB + '.trow2.on'),
    S('Plain', 'R-5', SUB + '.trow2:not(.on)'),
    S('Speaker unavailable: chosen, no bars', 'R-5c', SUB + '.trow2.on'),
],
'c-scent-row': [
    S('Plain', 'R-6', SUB + '.srow3:not(.on)'),
    S('Current: the tick', 'R-6', SUB + '.srow3.on'),
    S('Actions open: Rename', 'R-6', SUB + '.srow3', run=tap(SUB + '.srow3 .more'), how='tapped ⋯'),
    S('Renaming', 'R-6b', SUB + '.srow3.renaming'),
    N('Renamed (the original name as a second line)'),
],
# ----- Library
'c-library-heading-tabs': [
    S('Presets current', 'L-1', LIB + '.tabs'),
    S('Saved current', 'L-2', LIB + '.tabs'),
    S('Check-ins current', 'L-6', LIB + '.tabs'),
],
'c-globe-still': [
    S('Tile size', 'L-1', LIB + '.ocell .gst'),
    S('Tile size, On now (the ring)', 'L-11', LIB + '.ocell.onnow .gst'),
    S('Row size', 'L-2', LIB + '[data-pane=Saved] .gs'),
    S('Row size, On now', 'L-6', LIB + '.rowi.onnow .gs'),
    S('Calendar size', 'L-6', LIB + '.cal .cell:not(.onnow) .gs'),
    S('Calendar size, On now', 'L-6', LIB + '.cal .cell.onnow .gs'),
],
'c-preset-tile': [
    S('Default', 'L-1', LIB + '.ocell'),
    S('On now', 'L-11', LIB + '.ocell.onnow'),
],
'c-saved-scene-row': [
    S('Made by you: sound · scent', 'L-2', LIB + '[data-pane=Saved] .srow'),
    S('From check-ins: the date', 'L-2', LIB + '.srow:has([data-open="Saved:1"])'),
    S('Based on presets: the preset', 'L-2', LIB + '[data-pane=Saved] .srow:last-child',
      run="var p = document.querySelector('#phrvP [data-pane=Saved]'); if (p) p.scrollTop = p.scrollHeight;", how='scrolled to the end'),
    S('Open: pen and trash', 'L-3', LIB + '.srow.acts'),
    N('On now (the ring and the playing bars)'),
],
'c-list-group-heading': [
    S('Saved group', 'L-2', LIB + '[data-pane=Saved] h4'),
    S('Night heading (Check-ins)', 'L-6', LIB + '[data-pane=Checkins] .list > .nh'),
],
'c-saved-row-editor': [
    S('Default', 'L-4', LIB + '.edit5'),
    S('A name that’s taken', 'L-4b', LIB + '.edit5'),
    N('Count from 25 characters'),
    N('Empty name: Save disabled'),
    N('A new sound chosen'),
],
'c-name-rule-hint': [
    S('Taken (Library, in the row)', 'L-4b', LIB + '.edit5 .nh'),
    S('Count (Remote)', 'R-7b', REM + '.nmf .nh'),
    S('Taken (Remote)', 'R-7c', REM + '.nmf .nh'),
    N('Both messages stacked'),
    N('Under the naming sheet’s field (L-15) and in scent rename (R-6b)'),
],
'c-choice-chip': [
    S('Selected', 'L-4', LIB + '.ch5[aria-pressed=true]'),
    S('Unselected', 'L-4', LIB + '.ch5[aria-pressed=false]'),
],
'c-sound-picker-screen': [
    F('Opened on the current sound', 'L-13'),
    F('A different track chosen', 'L-13b'),
    F('Searching', 'L-13c'),
    F('Nothing matches', 'L-13d'),
    F('Preview playing', 'L-13e'),
    F('No tracks here yet', 'L-13f'),
    F('Speaker unavailable', 'L-13g'),
],
'c-sound-search-field': [
    S('Empty', 'L-13', '.sds5 .q5w'),
    S('With a query: the ×', 'L-13c', '.sds5 .q5w'),
    N('Focused (the charcoal ring)'),
],
'c-category-tabs': [
    S('Music current', 'L-13b', '.sds5 .t5'),
    S('Dimmed while searching', 'L-13c', '.sds5 .t5'),
    S('On the Remote’s Sound screen', 'R-5', SUB + '.sw-seg'),
],
'c-track-row': [
    S('In this scene', 'L-13', '.sds5 .r5:has(.s5)'),
    S('Chosen', 'L-13b', '.sds5 .r5:has(.p5[aria-pressed=true])'),
    S('Playing on the lamp', 'L-13e', '.sds5 .r5:has(.pl5.on)'),
    S('Plain', 'L-13b', '.sds5 .r5:has(.s5:empty)'),
    S('Search result: with its category', 'L-13c', '.sds5 .r5'),
    S('Speaker unavailable: the line under it', 'L-13g', U('.sds5 .r5:has(+ .cun)', '.sds5 .cun.sun'), union=True),
],
'c-sound-unavailable-line': [S('Shown under the tapped row', 'L-13g', '.sds5 .cun.sun')],
'c-check-in-calendar': [
    S('A month with check-ins', 'L-6', LIB + '.ck5'),
    S('This month, before its first check-in', 'L-9', LIB + '.ck5'),
    S('A past month with none', 'L-10', U(LIB + '.ck5', LIB + '.ck0'), union=True),
    N('‹ disabled on the oldest month'),
],
'c-calendar-day': [
    S('Plain', 'L-6', LIB + '.cal i.dn'),
    S('Today, no check-in', 'L-9', LIB + '.cal .dn.tn'),
    S('With a check-in', 'L-6', LIB + '.cal .cell:not(.onnow)'),
    S('Tonight, On now', 'L-6', LIB + '.cal .cell.onnow'),
],
'c-check-in-row': [
    S('One check-in in a night', 'L-6', LIB + '[data-pane=Checkins] .rowi:not(.onnow):not(.inn)'),
    S('Under a night heading: the time only', 'L-6', LIB + '[data-pane=Checkins] .rowi.inn'),
    S('On now', 'L-6', LIB + '[data-pane=Checkins] .rowi.onnow'),
],
'c-year-view': [S('Every month', 'L-7', LIB + '[data-pane=Checkins]')],
'c-year-month-tile': [
    S('Current month', 'L-7', LIB + '.ym.cur'),
    S('Past month', 'L-7', LIB + '.ym:not(.cur):not(.fut)'),
    S('Future month (dimmed)', 'L-7', LIB + '.ym.fut'),
],
'c-library-empty-state': [
    S('Saved, empty', 'L-5', LIB + '.empty'),
    S('Check-ins, empty', 'L-8', LIB + '.empty'),
    S('This month, before its first check-in', 'L-9', LIB + '.emo'),
    S('A past month with none (line only)', 'L-10', LIB + '.ck0'),
],
'c-scene-view': [
    F('A check-in, On now', 'L-12'),
    F('A preset, can’t reach the lamp', 'X-4d'),
],
'c-scene-name-strip': [
    S('First-but-one scene, neighbours both sides', 'X-4d', '.inside .strip'),
    S('A check-in with a long neighbour', 'L-12', '.inside .strip'),
    N('Dragging'),
],
'c-scene-sound-line': [
    S('Not playing: ▶', 'L-12', '.inside .idet'),
    S('Playing: the bars', 'L-12', '.inside .idet', run=tap('.inside .snd5'), how='tapped the sound line'),
],
'c-scene-view-actions': [
    S('Set the scene · Save as a scene (a check-in)', 'L-6', U('.inside .iset', '.inside .isave'), union=True,
      run=tap(LIB + '[data-open="Checkins:1"]'), how='opened a check-in'),
    S('On now: the button is gone, Save as a scene stays', 'L-12', '.inside .isave'),
    S('Can’t reach the lamp: Try again', 'X-4d', U('.inside .cerr', '.inside .iset'), union=True),
    N('Setting the scene… (busy)'),
],
'c-naming-sheet': [
    S('Open', 'L-15', '.sheet5 .card5'),
    N('Count, taken name, and empty name (Save disabled)'),
],
}


# ---------------------------------------------------------------- read the sources
src = open(SRC, encoding='utf-8').read()
i = src.index('const TABS = {'); end = i; TABS = {}
for tab in ('Home', 'Library', 'Remote'):
    q = src.index(tab + ': "', end) + len(tab) + 2
    TABS[tab], end = json.JSONDecoder().raw_decode(src, q)
helpers = re.search(r'const NOJUMP = [\s\S]*?\nconst withState = [^\n]*\n', src).group(0)
PHONES = {m.group(1): [m.group(2), json.loads(m.group(3))]
          for m in re.finditer(r'<figure id="([^"]+)"><div class="ph" data-tab="(\w+)" data-o=\'([^\']*)\'', src)}

# Comments inside the app documents carry working notes (names, dates, file names); the gallery keeps the code and drops those words.
NOTE_RE = [(re.compile(r'\((?:Rida|the designer), \d{1,2} (?:Oct|Nov)(?: \d{4})?(?:: |; |, )'), '('),
           (re.compile(r' ?\((?:Rida|the designer), \d{1,2} (?:Oct|Nov)(?: \d{4})?\)'), ''),
           (re.compile(r'\b(?:Rida|Mahrukh)\b'), 'design'),
           (re.compile(r'full_dev_spec\.md'), 'the spec'),
           (re.compile(r',? ?\(?\b\d{1,2} (?:Oct|Nov)(?:ember|ober)?(?: \d{4})?\)?:?'), '')]
COMMENT = re.compile(r'/\*[\s\S]*?\*/|<!--[\s\S]*?-->|(?<=[\s;{}(])//[^\n]*')
def scrub(t):
    def one(m):
        c = m.group(0)
        if len(c) > 1500 or re.search(r'''["'];|function\s*\(''', c): return c
        for rx, to in NOTE_RE: c = rx.sub(to, c)
        return c
    return COMMENT.sub(one, t)
TABS = {k: scrub(v) for k, v in TABS.items()}
helpers = scrub(helpers)
left = sum(len(re.findall(r'\bRida\b|full_dev_spec', v)) for v in TABS.values())

fonts = '\n'.join(dict.fromkeys(re.findall(r'@font-face\{[^}]*\}', TABS['Home'])))
tokens = json.load(open(TOKENS, encoding='utf-8'))

# DESIGN_SYSTEM.md: the three groups and their components, in order
ds = open(DS, encoding='utf-8').read().split('\n')
GROUPS = []; in_comp = False
for n, line in enumerate(ds, 1):
    if line.startswith('## '): in_comp = line.strip() == '## Components'
    if not in_comp: continue
    if line.startswith('### '): GROUPS.append(dict(name=line[4:].strip(), comps=[]))
    m = re.match(r'#### (.+?) \((.+)\)\s+\{#(c-[\w-]+)\}\s*$', line)
    if m: GROUPS[-1]['comps'].append(dict(name=m.group(1), rn=re.findall(r'`([^`]+)`', m.group(2)), id=m.group(3), line=n))
COMPS = [c for g in GROUPS for c in g['comps']]
missing = [c['id'] for c in COMPS if c['id'] not in SPEC]; extra = [k for k in SPEC if k not in {c['id'] for c in COMPS}]
if missing or extra: sys.exit('spec does not match DESIGN_SYSTEM.md: missing %s, extra %s' % (missing, extra))
for k, v in SPEC.items():
    for s in v:
        if 'id' in s and s['id'] not in PHONES: sys.exit('%s: no phone %s in %s' % (k, s['id'], SRC))


# ---------------------------------------------------------------- the page
E = html.escape
NOSHOT = []
def slug(t): return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')
def idlink(sid): return '<a class="sid" href="../prototype/FINAL_screens.html#%s">%s</a>' % (sid, sid)

def card(cid, n, s):
    if s['k'] == 'N':
        return ('<figure class="st nd"><div class="ndbox">%s<br><span>Not drawn in FINAL: see '
                '<a href="../DESIGN_SYSTEM.md#%s">DESIGN_SYSTEM</a></span></div></figure>') % (E(s['label']), cid)
    if s['k'] == 'H':
        return ('<figure class="st hid"><div class="vp hidbox">Nothing shown</div><figcaption><b>%s</b> %s</figcaption></figure>'
                % (E(s['label']), idlink(s['id'])))
    cap = '<figcaption><b>%s</b> %s%s</figcaption>' % (E(s['label']), idlink(s['id']), (' <i>after it %s</i>' % E(s['how'])) if s.get('how') else '')
    if not LIVE:
        k = '%s-%d' % (cid, n); f = os.path.join(SHOTS, k + '.png')
        if not os.path.exists(f):
            NOSHOT.append(k); return '<figure class="st"><div class="vp hidbox">No picture yet</div>%s</figure>' % cap
        w, h = struct.unpack('>II', open(f, 'rb').read(24)[16:24])
        return ('<figure class="st"><div class="vp%s"><img src="gallery/%s.png" width="%d" height="%d" alt="%s"></div>%s</figure>'
                % (' full' if s['k'] == 'F' else '', k, w // 2, h // 2, E(s['label']), cap))
    if s['k'] == 'F':
        return '<figure class="st" data-k="%s:%d" data-id="%s" data-full="1"><div class="vp full"></div>%s</figure>' % (cid, n, s['id'], cap)
    at = ' data-sel="%s" data-pad="%d"' % (E(s['sel']), s['pad'])
    if s['union']: at += ' data-union="1"'
    if s['run']: at += ' data-run="%s" data-run-at="%d"' % (E(s['run']), s['run_at'])
    return '<figure class="st" data-k="%s:%d" data-id="%s"%s><div class="vp"></div>%s</figure>' % (cid, n, s['id'], at, cap)

def lh(t):
    v = t['$value']; return round(v['fontSize'] * v['lineHeight'])
def fam(t):
    f = t['$value']['fontFamily']; return 'serif' if 'serif}' in f else 'sans'
SAMPLE = {'display': 'Quietly In Between', 'headline': 'Library', 'title': 'Golden Hour', 'title-small': 'Scenes you save live here.',
          'tab': 'Set at 22:10', 'body': 'A few questions, then an atmosphere for your room.', 'body-strong': 'Set the scene',
          'heading': 'Light', 'small': 'Night rain · Vanilla and Caramel', 'small-strong': 'Cycle', 'caption': 'Evening birds',
          'caption-strong': 'Made by you', 'status': 'Can’t connect · Try again', 'micro': 'M T W T F S S'}
FAMNAME = {k: v['$value'][0] for k, v in tokens['font']['family'].items()}

def foundations():
    col = ''.join('<div class="sw"><i style="background:%s"></i><b>%s</b><code>%s</code><span>%s</span></div>'
                  % (E(v['$value']), E(k), E(v['$value']), E(v.get('$description', ''))) for k, v in tokens['color'].items())
    typ = ''.join('<div class="ty"><div class="tys" style="font-family:\'%s\'; font-size:%spx; line-height:%dpx; font-weight:%d">%s</div>'
                  '<div class="tym"><b>%s</b> %s · %s / %d · %d</div></div>'
                  % (FAMNAME[fam(v)], v['$value']['fontSize'], lh(v), v['$value']['fontWeight'], E(SAMPLE.get(k, 'Golden Hour')),
                     E(k), FAMNAME[fam(v)], v['$value']['fontSize'], lh(v), v['$value']['fontWeight'])
                  for k, v in tokens['typography'].items())
    spc = ''.join('<div class="sp"><i style="width:%dpx"></i><b>%s</b><code>%s</code></div>' % (v['$value'], E(k), v['$value'])
                  for k, v in tokens['space'].items())
    icd = os.path.join(HANDOFF, 'design-system', 'icons')
    ics = json.load(open(os.path.join(icd, 'icons.json'), encoding='utf-8'))
    ico = ''.join('<div class="ic"><i style="width:%dpx;height:%dpx">%s</i><b>%s</b><code>%d</code><span>%s</span></div>'
                  % (o['size'] * 1.5, o['size'] * 1.5, open(os.path.join(icd, o['name'] + '.svg'), encoding='utf-8').read(),
                     E(o['name']), o['size'], E(o['use'])) for o in ics)
    def rv(v): return v if isinstance(v, str) else '%dpx' % v
    rad = ''.join('<div class="rd"><i style="border-radius:%s"></i><b>%s</b><code>%s</code></div>'
                  % (rv(v['$value']), E(k), E(str(v['$value']))) for k, v in tokens['radius'].items())
    return ('<section id="foundations"><h2>Foundations</h2><p class="lede">From <a href="tokens.json">tokens.json</a>. '
            'Sizes are dp, type sizes sp; line heights are the React Native values.</p>'
            '<h3 id="f-colour">Colour</h3><div class="sws">%s</div>'
            '<h3 id="f-type">Type</h3><div class="tys-grid">%s</div>'
            '<div class="two"><div><h3 id="f-space">Spacing</h3><div class="sps">%s</div></div>'
            '<div><h3 id="f-radius">Corners</h3><div class="rds">%s</div></div></div>'
            '<h3 id="f-icons">Icons</h3><p class="lede">Every icon the app draws, from <a href="icons/">icons/</a> (one SVG each, '
            '<code>currentColor</code> so the app tints them), shown here at 1.5x. The number is the size drawn, in dp. '
            'The paper grain is <a href="grain.png">grain.png</a>: a 160 dp tile at 2x, repeated over the ground with multiply at 40%%.</p>'
            '<div class="ics">%s</div></section>') % (col, typ, spc, rad, ico)

body = []
toc = []
for g in GROUPS:
    gid = slug(g['name'])
    toc.append('<p><a href="#%s"><b>%s</b></a>: %s</p>' % (gid, E(g['name']), ' · '.join('<a href="#%s">%s</a>' % (c['id'], E(c['name'])) for c in g['comps'])))
    body.append('<section class="grp" id="%s"><h2>%s</h2>' % (gid, E(g['name'])))
    for c in g['comps']:
        rn = ', '.join('<code>%s</code>' % E(r) for r in c['rn'])
        cards = ''.join(card(c['id'], n, s) for n, s in enumerate(SPEC[c['id']]))
        body.append('<section class="comp" id="%s"><h3>%s</h3><p class="meta">%s · <a href="../DESIGN_SYSTEM.md#%s">../DESIGN_SYSTEM.md#%s</a></p>'
                    '<div class="sts">%s</div></section>' % (c['id'], E(c['name']), rn, c['id'], c['id'], cards))
    body.append('</section>')

CSS = r'''
html,body{margin:0; background:#f7f3ea; color:#211c17; font:15px/1.5 "Hanken Grotesk",system-ui,sans-serif}
.wrap{max-width:1180px; margin:0 auto; padding:32px 24px 80px}
h1{font:400 34px/1.15 "Source Serif 4",Georgia,serif; margin:0 0 8px}
h2{font:400 28px/1.2 "Source Serif 4",Georgia,serif; margin:56px 0 4px; padding-top:20px; border-top:1px solid #d9d1c4}
h3{font:400 21px/1.25 "Source Serif 4",Georgia,serif; margin:36px 0 2px}
section[id], h3[id]{scroll-margin-top:12px}
a{color:#211c17} .lede{max-width:78ch; color:#4a443e; margin:0 0 6px}
.toc{margin:18px 0 0; font-size:14px; color:#4a443e} .toc p{margin:0 0 6px} .toc a{text-decoration-color:#bdb3a4}
.meta{margin:0 0 12px; font-size:13.5px; color:#605a53} .meta code{font:500 13px ui-monospace,Consolas,monospace; color:#211c17}
.sts{display:flex; flex-wrap:wrap; gap:22px 26px; align-items:flex-start}
.st{margin:0; max-width:360px}
.vp{position:relative; overflow:hidden; width:160px; height:56px; border-radius:10px; background:#efe9dd; box-shadow:0 0 0 1px #d9d1c4}
.vp iframe{position:absolute; left:0; top:0; width:360px; height:800px; border:0; display:block; opacity:0; transition:opacity .25s}
.vp.ok iframe{opacity:1}
.vp.full{width:180px; height:400px; border-radius:18px} .vp.full iframe{transform:scale(.5); transform-origin:0 0; opacity:1}
.vp:has(img){width:auto; height:auto; box-shadow:0 0 0 1px #d9d1c4} .vp img{display:block}
.st figcaption{margin-top:7px; font-size:13px; line-height:1.4; color:#4a443e; max-width:300px}
.st figcaption b{font-weight:500; color:#211c17} .st figcaption i{font-style:normal; color:#8a8178}
.sid{display:inline-block; margin-left:4px; padding:0 5px; border:1px solid #9a9186; border-radius:4px; font:600 11.5px/1.45 ui-monospace,Consolas,monospace; color:#605a53; text-decoration:none; vertical-align:1px}
.sid:hover{background:#ece6da}
.nd .ndbox{width:200px; box-sizing:border-box; padding:10px 12px; border:1px dashed #bdb3a4; border-radius:10px; font-size:13px; line-height:1.4; color:#605a53}
.nd .ndbox span{display:block; margin-top:4px; color:#8a8178; font-size:12.5px} .nd .ndbox a{color:#8a8178}
.hidbox{display:flex; align-items:center; justify-content:center; width:160px; height:56px; font-size:12.5px; color:#8a8178; background:transparent; box-shadow:none; border:1px dashed #bdb3a4; box-sizing:border-box}
.sws{display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:10px 18px}
.sw{display:grid; grid-template-columns:44px 1fr; grid-template-rows:auto auto; column-gap:10px; font-size:12.5px; line-height:1.35; color:#4a443e}
.sw i{grid-row:1 / span 2; width:44px; height:44px; border-radius:10px; box-shadow:inset 0 0 0 1px rgba(33,28,23,.14)}
.sw b{font-weight:600; color:#211c17; font-size:13.5px} .sw b + code{margin-left:6px}
.sw code{font:12px ui-monospace,Consolas,monospace; color:#605a53} .sw span{grid-column:2}
.sw > b, .sw > code{grid-column:2; grid-row:1; display:inline} .sw > code{justify-self:end}
.tys-grid{display:grid; grid-template-columns:repeat(auto-fill,minmax(360px,1fr)); gap:14px 28px}
.ty{border-bottom:1px solid #e4ddcf; padding-bottom:8px} .tys{color:#211c17; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
.tym{font-size:12.5px; color:#605a53; margin-top:2px} .tym b{font-weight:600; color:#211c17; margin-right:4px}
.two{display:grid; grid-template-columns:1fr 1fr; gap:28px}
.sp, .rd{display:grid; grid-template-columns:110px 1fr 40px; align-items:center; gap:10px; font-size:13px; margin-bottom:6px}
.sp i{display:block; height:12px; background:#3b342e; border-radius:2px; grid-column:2; grid-row:1}
.sp b, .rd b{grid-column:1; grid-row:1; font-weight:600} .sp code, .rd code{grid-column:3; grid-row:1; font:12px ui-monospace,Consolas,monospace; color:#605a53}
.rd i{display:block; width:72px; height:40px; background:#ece6da; box-shadow:inset 0 0 0 1.5px #3b342e; grid-column:2; grid-row:1}
.ics{display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:12px 18px}
.ic{display:grid; grid-template-columns:44px 1fr auto; column-gap:10px; align-items:center; font-size:12.5px; line-height:1.35; color:#4a443e}
.ic i{grid-row:1 / span 2; justify-self:center; color:#211c17} .ic i svg{width:100%; height:100%; display:block}
.ic b{font-weight:600; color:#211c17; font-size:13px} .ic code{font:12px ui-monospace,Consolas,monospace; color:#605a53}
.ic span{grid-column:2 / span 2}
@media (max-width:760px){ .two{grid-template-columns:1fr} }
'''

JS = r'''
const PHONES = __PHONES__;
(function(){
  const W = 360, Hh = 800, CHECK = /[?&]check\b/.test(location.search), SHOOT = /[?&]shoot\b/.test(location.search), BATCH = +((location.search.match(/batch=(\d+)/) || [])[1] || 6);
  const ONLY = (location.search.match(/only=([\w,-]+)/) || [])[1];
  const cards = Array.prototype.slice.call(document.querySelectorAll('.st[data-k]')).filter(function(c){
    return !CHECK || !ONLY || ONLY.split(',').some(function(o){ return c.dataset.k.indexOf(o) === 0; }); });
  function shown(e, w){
    const r = e.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right <= 0 || r.bottom <= 0 || r.left >= W || r.top >= Hh) return false;
    if (w.getComputedStyle(e).visibility === 'hidden') return false;
    for (let a = e; a && a.nodeType === 1; a = a.parentElement) { const cs = w.getComputedStyle(a); if (cs.display === 'none' || +cs.opacity < 0.05) return false; }
    return true; }
  function clip(e, w){
    const r = e.getBoundingClientRect(); let x0 = r.left, y0 = r.top, x1 = r.right, y1 = r.bottom;
    for (let a = e.parentElement; a && a !== w.document.documentElement && a !== w.document.body; a = a.parentElement) {
      const cs = w.getComputedStyle(a); if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const q = a.getBoundingClientRect();
      if (cs.overflowX !== 'visible') { x0 = Math.max(x0, q.left); x1 = Math.min(x1, q.right); }
      if (cs.overflowY !== 'visible') { y0 = Math.max(y0, q.top); y1 = Math.min(y1, q.bottom); } }
    x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(W, x1); y1 = Math.min(Hh, y1);
    return x1 - x0 >= 1 && y1 - y0 >= 1 ? {x0: x0, y0: y0, x1: x1, y1: y1, a: (x1 - x0) * (y1 - y0) / Math.max(1, r.width * r.height)} : null; }
  function why(e, w){
    const r = e.getBoundingClientRect(), o = [' (' + [r.left, r.top, r.width, r.height].map(Math.round).join(',')];
    for (let a = e; a && a.nodeType === 1; a = a.parentElement) { const cs = w.getComputedStyle(a);
      if (cs.display === 'none' || +cs.opacity < 0.05 || (a === e && cs.visibility === 'hidden')) o.push((a.id ? '#' + a.id : a.tagName.toLowerCase() + '.' + String(a.className).split(' ').join('.')) + ' d=' + cs.display + ' o=' + cs.opacity + ' v=' + cs.visibility); }
    return o.join('; ') + ')'; }
  function measure(c, f){
    let d, w; try { d = f.contentDocument; w = f.contentWindow; } catch (e) { return {err: 'blocked'}; }
    if (!d || !d.body) return {err: 'not loaded'};
    let els; try { els = Array.prototype.slice.call(d.querySelectorAll(c.dataset.sel)); } catch (e) { return {err: 'bad selector'}; }
    const hits = els.filter(function(e){ return shown(e, w); }).map(function(e){ return {e: e, r: clip(e, w)}; }).filter(function(h){ return h.r; });
    if (!hits.length) return {err: els.length ? 'matched, but nothing visible' + (CHECK ? why(els[0], w) : '') : 'no match'};
    const use = c.dataset.union ? hits : [hits.filter(function(h){ return h.r.a > 0.95; })[0] || hits[0]];
    const R = use.reduce(function(m, h){ return m ? {x0: Math.min(m.x0, h.r.x0), y0: Math.min(m.y0, h.r.y0), x1: Math.max(m.x1, h.r.x1), y1: Math.max(m.y1, h.r.y1)} : h.r; }, null);
    const p = +c.dataset.pad || 0;
    return {x: Math.max(0, Math.floor(R.x0 - p)), y: Math.max(0, Math.floor(R.y0 - p)), x1: Math.min(W, Math.ceil(R.x1 + p)), y1: Math.min(Hh, Math.ceil(R.y1 + p)),
            text: use.map(function(h){ return (h.e.textContent || h.e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(); }).join(' | ').slice(0, 90)}; }
  function apply(c, f, m){
    const vp = c.querySelector('.vp'); vp.style.width = (m.x1 - m.x) + 'px'; vp.style.height = (m.y1 - m.y) + 'px';
    f.style.left = -m.x + 'px'; f.style.top = -m.y + 'px'; vp.classList.add('ok'); }
  function load(c){
    if (c._f) return; const ph = PHONES[c.dataset.id], f = document.createElement('iframe'), o = ph[1];
    f.title = c.dataset.id + ': ' + (c.querySelector('figcaption b') || {}).textContent; f.setAttribute('loading', 'eager');
    c._f = f; c._done = false; delete c.dataset.status;
    f.addEventListener('load', function(){ start(c, f); });
    f.srcdoc = withState(TABS[ph[0]], o); c.querySelector('.vp').appendChild(f); }
  function unload(c){ if (!c._f || (CHECK && !c._done)) return; c._f.remove(); c._f = null; c.querySelector('.vp').classList.remove('ok'); }
  function start(c, f){
    const t0 = performance.now(), run = c.dataset.run, runAt = +c.dataset.runAt || 2500, until = run ? runAt + 8000 : 11000;
    let ran = false, last = null, m = null, trace = [], was = '';
    (function tick(){
      if (c._f !== f) return; const t = performance.now() - t0;
      if (run && !ran && t >= runAt) { ran = true; try { f.contentWindow.eval(run); } catch (e) { c._runErr = String(e); } }
      // a fade inside a small cropped frame can stall half way; jump finite transitions to their end state
      try { f.contentDocument.getAnimations().forEach(function(a){ try { if (a.playState === 'running' && a.effect.getComputedTiming().iterations !== Infinity) a.finish(); } catch (e) {} }); } catch (e) {}
      if (!c.dataset.full) { try { m = measure(c, f); } catch (e) { m = {err: String(e)}; } if (!m.err) { if (t > 600 || !last) apply(c, f, m); last = m; }
        const now = m.err || [m.x, m.y, m.x1 - m.x, m.y1 - m.y].join(','); if (CHECK && now !== was) { trace.push(Math.round(t) + ' ' + now); was = now; } }
      if (t < until) return setTimeout(tick, 300);
      if (!c.dataset.full && last) apply(c, f, last);
      c._done = true; c._res = c.dataset.full ? {ok: true} : {ok: !!(m && !m.err), err: m && m.err, kept: !!(m && m.err && last), rect: last && [last.x, last.y, last.x1 - last.x, last.y1 - last.y], text: last && last.text, run: c._runErr, trace: trace.join(' / ')};
      c.dataset.status = c._res.ok ? 'ok' : (c._res.kept ? 'kept' : 'missing');
      c.dispatchEvent(new CustomEvent('cropped', {bubbles: true}));
    })(); }
  if (CHECK) {
    if (/[?&]big\b/.test(location.search)) { const st = document.createElement('style'); st.textContent = '.vp:not(.ok):not(.full){width:360px !important;height:800px !important} .vp iframe{opacity:1 !important}'; document.head.appendChild(st); }
    const res = []; window.__CHECK = {done: false, res: res, n: cards.length};
    (function next(i){
      if (i >= cards.length) { window.__CHECK.done = true; return; }
      const b = cards.slice(i, i + BATCH); let left = b.length;
      b[0].scrollIntoView({block: 'start'});
      function fin(c){ if (c._rep) return; c._rep = true;
        res.push(Object.assign({k: c.dataset.k, id: c.dataset.id, sel: c.dataset.sel || '(full phone)'}, c._res || {ok: false, err: 'timed out'}));
        if (--left === 0) {
          const go = function(){ b.forEach(function(x){ x._f && x._f.remove(); x._f = null; }); next(i + BATCH); };
          if (!SHOOT) return go();
          window.__GO = false; window.__READY = b.map(function(x){ return x.dataset.k; });
          (function wait(){ if (window.__GO) { window.__READY = null; go(); } else setTimeout(wait, 100); })(); } }
      b.forEach(function(c){ c.addEventListener('cropped', function(){ fin(c); }); load(c); setTimeout(function(){ fin(c); }, 30000); });
    })(0);
    return; }
  if (!('IntersectionObserver' in window)) { cards.forEach(load); return; }
  const near = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) load(e.target); }); }, {rootMargin: '400px 0px'});
  const far = new IntersectionObserver(function(es){ es.forEach(function(e){ if (!e.isIntersecting) unload(e.target); }); }, {rootMargin: '2400px 0px'});
  cards.forEach(function(c){ near.observe(c); far.observe(c); });
})();
'''

def jsstr(o): return json.dumps(o, ensure_ascii=True).replace('</', '<\\/').replace('<!--', '<\\!--')
tabs_js = 'const TABS = {' + ', '.join('%s: %s' % (k, jsstr(TABS[k])) for k in ('Home', 'Library', 'Remote')) + '};\n'
n_states = sum(1 for v in SPEC.values() for s in v if s['k'] in 'SFH')
n_notes = sum(1 for v in SPEC.values() for s in v if s['k'] == 'N')
page = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>Wellness Lamp: component gallery</title><style>' + fonts + CSS + '</style></head><body><div class="wrap">'
        '<h1>Component gallery</h1>'
        + ('<p class="lede">Every component of the app, in every state the prototype draws. Each picture is a phone from '
        '<a href="../prototype/FINAL_screens.html">FINAL_screens.html</a> (the same app code, opened in the same state), cut down to one '
        'component with a little of what surrounds it, shown at 1x (the files are 2x). The tag under each picture is the screen it comes from: '
        'it opens that phone, where anything that moves can be seen moving. '
        'Whole screens show the full phone at half size. The specs are in <a href="../DESIGN_SYSTEM.md">DESIGN_SYSTEM.md</a> '
        '(the link under each name goes to its entry); the values in <a href="tokens.json">tokens.json</a>.</p>'
        '<p class="lede">A few states need a tap first; their caption says what was tapped. A dashed box is a state the prototype doesn’t draw.</p>'
        if not LIVE else
        '<p class="lede">Live build: every card is a phone that loads as you scroll. Open with ?check&amp;shoot to photograph the cards '
        '(tools/shoot_gallery.js).</p>') +
        '<nav class="toc"><p><a href="#foundations"><b>Foundations</b></a>: <a href="#f-colour">Colour</a> · <a href="#f-type">Type</a> · '
        '<a href="#f-space">Spacing</a> · <a href="#f-radius">Corners</a> · <a href="#f-icons">Icons</a></p>' + ''.join(toc) + '</nav>'
        + foundations() + ''.join(body) +
        '</div>' + ('<script>' + tabs_js + helpers + JS.replace('__PHONES__', jsstr(PHONES)) + '</script>' if LIVE else '') + '</body></html>')
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w', encoding='utf-8').write(page)
print('wrote %s (%.1f MB, %s): %d components in %d groups, %d states drawn, %d not drawn; source %s; notes left in code: %d'
      % (OUT, len(page) / 1e6, 'live' if LIVE else 'pictures', len(COMPS), len(GROUPS), n_states, n_notes, SRC, left))
if NOSHOT: print('no picture for %d cards: %s' % (len(NOSHOT), ', '.join(NOSHOT)))
