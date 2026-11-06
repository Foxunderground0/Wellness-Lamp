# Handoff documentation checklist

Everything the dev (working with AI agents) needs to implement the redesign. Eight docs plus the reference-material folders below. Write them in this order — later docs reference earlier ones.

Items marked **[new]** were added after the review of `project_todo.md` Phases 5–8, START_HERE.md and the FINAL files.

**[new] Scope of this handoff = v1.** v1 is exactly what is in `final/FINAL_prototype.html` and `final/FINAL_screens.html`. Onboarding, profile, multiple trusted devices, Settings, the Spotify version and the other FigJam-only concepts are later versions: list them as deferred, never as screens to build.

**[new] Sources for writing the docs:**
- `full_dev_spec.md`: locked decisions (motion §7, Library §7.8, names §4b, bugs §5, not-to-build §6)
- `REDESIGN_FINDINGS.md` (code audit, 7 Oct): the **old** app's behaviour. Diff it against the dev spec and the FINAL prototype to find new behaviour the dev spec doesn't state yet.
- `STRUCTURE.md`, `UX_ISSUE_LOG.md`, `pending_after_jury.md`, `project_todo.md` (Decisions + Phase 3 rules): edge cases and states
- The coding agent (one round trip): current code facts for MIGRATION and PROPOSED_STRUCTURE (see §7)

```text
handoff/
  START_HERE.md
  SCREENS_AND_FLOWS.md
  DATA_AND_RULES.md
  DESIGN_SYSTEM.md
  MOTION.md
  CONTENT.md
  MIGRATION.md
  PROPOSED_STRUCTURE.md
  prototype/            (frozen approved HTML, exploration variants removed)
  animation-reference/  (orb + wash code, videos, screenshots)
  design-system/
    component-gallery.html
    tokens.json
    screenshots/
  assets/               (icons, fonts, textures)
```

**[new]** START_HERE currently says `assets/tokens.json` and doesn't list `design-system/`. Use the layout above everywhere.

If documents conflict, this is the priority order (state it in START_HERE too):
SCREENS_AND_FLOWS → DATA_AND_RULES → MOTION → DESIGN_SYSTEM → prototype → existing app.

---

## 1. START_HERE.md — orientation (1–2 pages)

- [ ] One paragraph: what this project is (design revamp of the existing RN app + behaviour changes + a few new features)
- [ ] What must be preserved (BLE services, offline mood engine, questions/archetypes/presets data)
- [ ] What is new (Home/check-in flow, Remote, Library, scenes, save/update, live controls)
- [ ] What is explicitly out of scope (phone audio playback, accessibility work, backend, iOS polish, scent hardware)
- [ ] Which prototype file is final and how to open it
- [ ] Document priority order (above)
- [ ] Open questions / undecided items, clearly marked so the agent doesn't guess
- [ ] **[new]** Fixes to the current draft (copied to this folder):
  - tokens.json path → `design-system/tokens.json`; add `design-system/` (gallery, tokens, screenshots) to the folder-contents table
  - replace the "freeze the prototype / pick final variants" TODO with the recorded component picks once the prototype is frozen
  - state that v1 = the FINAL prototype + FINAL screens; onboarding, multiple trusted devices and other FigJam concepts are later versions
  - "Set the scene" is a **single tap** (not press-and-hold; this overrides the Phase 3 rule in `project_todo.md`)
  - open questions: add whether scene and scent rename is kept in v1
  - state explicitly that **no BLE or firmware protocol changes are required** for v1 (REDESIGN_FINDINGS' handoff section asks for this), or list them if any turn up
  - check the "What is new" bullets against `full_dev_spec.md` §7.8 (Library tabs, calendar) and the FINAL prototype
  - say what happens to `full_dev_spec.md`: either superseded by these docs (recommended) or listed in the priority order, so it can't act as a conflicting source

## 2. SCREENS_AND_FLOWS.md — the main document  **[✓ approved by Rida, 3 Nov; inventory linked to FINAL_screens IDs]**

- [ ] Screen inventory: every screen, sheet, and overlay with a short name the other docs can reference (Home, Check-in, Remote, Library, Save sheet, Scents screen, etc.)
- [ ] **[new]** The inventory is **v1 only**: built from what is in FINAL_prototype.html and FINAL_screens.html, not from the full STRUCTURE.md inventory. Include the connection-layer screens and states (CONNECTION_draft, merged into FINAL on 2 Nov).
- [ ] **[new]** A short "Deferred to later versions (do not build)" list: onboarding, Finish your profile, Set up and trusted-phone / multiple trusted devices, Devices, Settings, the Spotify version, and any other STRUCTURE.md or FigJam rows not in FINAL. The v1 inventory then lives here, separate from the full product inventory in STRUCTURE.md.
- [ ] Navigation map: which screen leads where, what back does, bottom-nav tabs
- [ ] Every flow written in this format:

```text
FLOW: <name>
Starting state: ...
Steps: user action → UI response → app-state change → hardware command (if any)
Branches: lamp unavailable / speaker unavailable / both
End state: ...
```

- [ ] Flows to cover:
  - First launch / Home before any check-in
  - Start, skip within, leave, and complete a check-in
  - Check-in result → Set the scene / Not now
  - Build a scene from scratch on the Remote (nothing hits hardware until Set the scene)
  - Adjust a running scene live (colour dot, brightness, speed, cycle, volume — throttled live sends)
  - Change track (tap = plays on speaker immediately)
  - Toggle light / sound / scent individually; All toggle
  - Apply a preset from Library
  - Save a new scene; save an edited scene (in place for your own, a copy for presets and check-ins); **[new]** there is no "· Edited" label and no "Update / Save as new" anywhere in FINAL
  - Reapply a saved scene / a past check-in
  - Rename (scenes, scents) if kept
  - Hardware partially connected ("Light unavailable · Try again")
  - App restart: what is restored, what resets
  - **[new]** Bluetooth off; permission denied or withdrawn
  - **[new]** "Setting the scene…" (in progress) and what happens if it fails part-way
  - **[new]** Android Back on every screen, sheet and focused task (H18)
  - **[new]** Empty states: Saved for a new user (UX-67), Check-ins before the first one, plus any other empty list in FINAL
- [ ] **[new]** Screen rules (from Phase 3, still true in v1):
  - where problems show: one blocked control → a line next to it; an app-wide problem with a fix → the top banner, which stays until fixed; never a fading toast for a problem
  - message bars (X-1) only for feedback on the user's own action, in an empty slot so they cover nothing
  - one primary action per screen, anchored at the bottom
  - **no tab bar on focused steps** (decided 3 Nov, built): the check-in's question cards ("Reading your answers" plays on Home's layout, with the tab bar, as FINAL draws it in C-4), the Library's full-screen scene view, and the Library's Sounds screen (× / Back closes, Choose commits). The tab bar **stays** on the Remote's Light, Sound and Scent screens (live controls inside the Remote tab, Back returns)
- [ ] **[new]** Hardening, as one-line rules: long names (30-char limit, truncation), safe areas (touch targets: no polish in v1, Rida 5 Nov)

## 3. DATA_AND_RULES.md — models + product rules (2–3 pages)  **[✓ approved by Rida, 3 Nov]**

- [ ] Scene object: name, source (checkin/preset/saved/scratch), colours, staticColor, mode, speed, brightness, light/sound/scent enabled, soundFolder, soundFile, soundVolume, scentId
- [ ] What persists across restarts (saved scenes, check-in history, last active scene?) vs session-only. **Settled 3 Nov:** check-in history is kept indefinitely (no limit in v1)
- [ ] Scene naming rules: duplicates, suggested names, 30-char limit; your own scene saves in place, anything else saves as a new scene (the 3 Saved groups)
- [ ] What counts as an "edit" (colours, track, scent — not brightness/volume/speed, per prototype)
- [ ] The core behaviour rule: explicit "Set the scene" starts hardware; after that, Remote changes send live
- [ ] Hardware constraints the UI must respect:
  - Lamp and speaker are separate BLE devices; commands succeed/fail independently
  - No readback — UI shows "sent", never confirmed hardware state
  - Sound is folder/file numbers only; volume 0–30
  - Continuous controls need throttled, latest-value-wins writes; fail fast on disconnect (no 12 s mid-drag rescans)
  - Scent is UI-only for now — design the model, no hardware commands
- [ ] Sound catalog table: folder/file number ↔ display name ↔ ambience category. **The track list is unknown (Rida, 3 Nov): it exists only on the MP3Controller's SD card.** Write the table's structure with the prototype's names marked as placeholders, and leave filling it in to the developer, who reads the card. The reconnect timeout is also left open for the developer
- [ ] **[new]** Old → new behaviour table, using REDESIGN_FINDINGS.md as the baseline. Its "Future developer handoff notes" asks for these groups:
  - preserved
  - removed or corrected
  - approved new behaviour
  - concept-only (later versions, do not build)
  - still needs stakeholder confirmation
  - BLE or firmware changes (expected: none)

## 4. DESIGN_SYSTEM.md — tokens + components

- [ ] Colour tokens (ground, ink, muted, surfaces — from prototype `:root` variables)
- [ ] Type scale: both families (serif + sans), sizes and weights per role (title, body, label, nav)
- [ ] Spacing, radii, card dimensions
- [ ] Each component with its chosen final variant: button/pill, toggle switch, slider, brightness ring, question scale, sound player, preset tile, tabs, nav bar, message bar, the naming sheet (L-15, Save as a scene: the only app sheet in v1)
- [ ] States per component: default, pressed, selected, disabled, loading, unavailable, and edited where relevant
- [ ] Which icons/assets you're supplying, with filenames
- [ ] **[new]** Token names are **semantic** (e.g. `text/primary`, `text/secondary`, `surface/card`, `ground`). The prototype uses short names (`--g`, `--ink`, `--mut`, `--surf`, `--surf2`) and has extra `:root` blocks for the variations panel and dark test frames; leave those out.
- [ ] **[new]** Record the spacing, radius, type and shadow values the prototype **actually uses**. Don't invent new scales (Phase 5's 4-pt scale, type ratio and shadow scale are not needed as design work).
- [ ] **[new]** One rule: components use semantic tokens only, never raw values.
- [ ] **[new]** Icon set: record the one set used (SVGs in `phase4_visual/remote_explore_icons_msi/`), stroke/fill style, sizes.
- [ ] **[new]** Text greys, decided before freezing. Contrast on cream `#f7f3ea`: `#8F867B` = 3.23:1 (fails 4.5:1 for normal text; used for the inactive Library tabs in the default `serifsize` tab style), `#B9AE9F` = 1.97:1 (only in a rejected Library exploration, so it goes when those are stripped), `#605A53` = 6.15:1 ✓, `#4A443E` = 8.67:1 ✓. Collapse to two passing secondary greys (UX-45).
- [ ] **[new]** Slider track: the unfilled bar is 3px `#bdb3a4` (1.87:1 on cream) with a 16px knob. Decide whether to strengthen it (UX-58).
- [x] **[new]** Screen-reader labels on icon buttons: not in v1 (Rida, 5 Nov: no screen-reader work).
- [ ] **[new]** **One orb component** (from the 30 Oct Library critique): large = live Globe 39 (Home, scene view, result); small = frozen gradient orb (lists, grids, calendar); no grey drop shadows; states rest, pressed (Sink), set (Corona), on now (ring).
- [ ] For every component, record:
  - React Native component name
  - Screens where it is used
  - Anatomy (the pieces inside it)
  - Variants and states
  - Exact dimensions, padding, gap, font, colour and radius tokens
  - Interaction behaviour
  - Link/anchor to its example in `design-system/component-gallery.html`
- [ ] Provide `design-system/tokens.json` with the same colour, type, spacing, radius, motion and component-size values in machine-readable form. `DESIGN_SYSTEM.md` explains their meaning; the JSON prevents transcription mistakes.
- [ ] Provide `design-system/component-gallery.html` as the equivalent of a Figma component page:
  - Show only the final selected design for each component
  - Show every relevant state side by side
  - Include buttons, icon buttons, cards, sliders, switches, brightness ring, question scale, player, scene rows/tiles, tabs, navigation, message bar and unavailable rows
  - **[new]** Also: the 5-circle check-in progress, palette dots / strip (8, lamp order), the Light screen's colour wheel, the Cycle key + Slow–Fast slider, the scent control (no "coming soon" state), the connection line (X-2), the name field (R-7 / L-4) and the naming sheet (L-15), top bar / headers, both orb sizes, the Me button (a plain person icon)
  - Remove all rejected alternatives and variation controls
- [ ] Add reference screenshots of the component gallery under `design-system/screenshots/`

## 5. MOTION.md — animations

- [ ] Per animation: name, where it occurs, trigger, duration, easing, what visually changes, how it ends, loops or not, reduced-motion variant if the prototype has one
- [ ] Cover: check-in transitions, "reading your answers" (Long exposure), the result reveal, Set the scene (Light bloom), the wash in/out (Crochet form), the message bar, the Library scene view (grows from the tapped orb, 620 ms; swipe)
- [ ] **[new]** Use the locked names and values in `full_dev_spec.md` §7 (Long exposure, Light bloom, Sink, Crochet-form wash, Library scene view). Ignore the `-old` sections there, which are kept only for the record.
- [ ] **[new]** Motion tokens (durations + easings, §7.7) go into `tokens.json` as well
- [ ] **[new]** Reduced-motion: the prototype has `prefers-reduced-motion` handling (13 rules); document each variant
- [ ] **[new] The orb in full detail** (Rida, 3 Nov: "the orb has a LOT of detail"; she may hand over **all the orb code** so it's exact, labelled `algorithmic-reference`), its own section, gathered from `full_dev_spec.md` §7.1 + Appendix A, the orb board and FINAL. Rida's earlier rules exist for several of these; find them before writing:
  - when the pearl orb shows (before a check-in, nothing set, Light off, during "reading your answers", Check in again …);
  - which colours it animates, and where: the Globe 39 style, with many colours at the edges;
  - how it looks with a full palette, with only 1 colour and with 2 colours (FINAL's sample palettes "One colour (Steady)" and "Two colours");
  - how it changes on the Remote (below), and **the orb on the Light (colour) screen** (R-4): what it shows while the wheel, the 8 colours and Colour range change;
  - every orb animation and size change: rest 1.10× (Corona), Light bloom 1.12 → 1.10, the press, Long exposure, the scene view's orbs and stills, the Library's Globe stills.
- [ ] **[new] Custom orbs from any palette** (Rida, 4 Nov): how the orb is built from any 8 colours (a check-in's, a preset's, a saved scene's, or one made on the Light screen's wheel), not only from the sample palettes
- [ ] **[new] The no-mud rule for mixing colours** (Rida, 4 Nov; recorded in `visual_direction_notes.md` lines 53 and 197, and `project_todo.md` line 415): two colours are blended through their **saturated midpoint**, halfway round the colour wheel, never through grey; the wash blends in OKLab with chroma held, so folds and highlights get lighter, never muddy. State the exact rule the orb and wash code use, with an example (e.g. blue + orange)
- [ ] **[new] The Remote's orb** (Rida, 3 Nov): how it responds to brightness (the ring), Cycle speed, and colour changes (a held dot, Cycle on, a new palette); and that it moves while a scene plays
- [ ] **[new]** The scene view's wash speed (measured 3 Nov: ~30 fps, a drift of ~30–56 s; `full_dev_spec.md` §7.6) and the swipe landing
- [ ] **[new]** Expected label for all supplied code: `algorithmic-reference`. `crochet_wash.js`, the orb shader and the animation excerpts in the dev spec appendices are browser Canvas/JS; none is React Native Skia
- [ ] Orb + wash: hand over isolated source code in `animation-reference/`, labelled honestly:
  - `production-ready` only if it's actual React Native Skia code
  - otherwise `algorithmic-reference` — agent ports the math (OKLab/OKLCH blending, layer order, speeds, seeds) to Skia, not browser Canvas, DOM or CSS APIs
- [ ] Inventory every supplied animation file: filename, compatibility label, dependencies, inputs/outputs, and screens that use it
- [ ] Document palette, size, speed, brightness, active/static mode and phase inputs
- [ ] Document colour interpolation, layer/blend order, timing, seeds/randomness, lifecycle (start/pause/resume/reset) and expected performance
- [ ] Include static reference frames plus a 60 fps screen recording of each animation for visual comparison

## 6. CONTENT.md — final copy and data (short)

- [ ] Final names/taglines for presets and example scenes
- [ ] Check-in question copy (or "use existing questions.ts")
- [ ] The four scent names: decided (Mahrukh, 30 Oct): Warm Apple Crumble · Malibu · Cosy Cottage · Vanilla and Caramel
- [ ] Track display names (must match the sound catalog table in DATA_AND_RULES)
- [ ] UI copy that matters: button labels, message bar text ("Sent to your room · Undo"), empty/unavailable states
- [ ] Mark anything still provisional so the agent doesn't treat placeholder copy as final

## 7. MIGRATION.md — what happens to the existing app (1 page)

- [ ] Keep as-is: `lampService.ts`, `mp3Service.ts` (wrap, don't rewrite), `moodEngine.ts`, `colorMath.ts`, `questions.ts`, `moodArchetypes.ts`, `presetThemes.ts`
- [ ] Replace: all five screens, `App.tsx` orchestration, `BottomNav`
- [ ] Delete: `openRouter.ts`, `questionFetcher.ts`, `questionBank.ts`, `QuestionCard.tsx` (dead code)
- [ ] Known bugs to fix during the rebuild: connection flag overwritten by every command result, stop marked success on BLE failure, stale connect check in SoundScreen
- [ ] Suggested build order: tokens/components → navigation shell → Home + check-in → Remote → Library/scenes → polish
- [ ] **[new]** Keep/replace/delete lists and the bug list come from REDESIGN_FINDINGS.md (7 Oct) and `full_dev_spec.md` §5. Before finalising, send the coding agent **one message** asking it to confirm against the current code and save its answers to `shared/`:
  1. Do all keep/replace/delete files still exist under those paths?
  2. Are the three known bugs still present?
  3. What does AsyncStorage persist today, under which keys?
  4. The current `src/` layout, so old paths can be mapped to new ones
  5. Are the BLE command and parameter limits still accurate (sound folder/file numbers, volume 0–30, write timing, the ~150–250 ms throttle)?

## 8. PROPOSED_STRUCTURE.md — target folder layout

```text
src/
  app/
    navigation/        # tabs + stacks, Home is initial route
    state/             # active scene + session state (context/store) — NOT in App.tsx
  features/
    home/
    checkin/
    remote/
    library/
  design-system/
    tokens/
    components/
  animations/
    Orb/
    BackgroundWash/
  domain/
    scene.ts           # the shared Scene object + mappers (preset/check-in/scratch → Scene)
    sound.ts           # sound catalog
  services/
    lamp/              # existing lampService behind an interface + write throttle
    sound/             # existing mp3Service behind an interface
    persistence/       # AsyncStorage: saved scenes, check-in history
  data/                # questions, archetypes, presets (existing files move here)
  assets/
```

- [ ] One sentence on state ownership: screens read/write scene state through `app/state`; only `services/` talks to hardware; `domain/` has no React imports
- [ ] Note that the dev may adjust internals, but the boundaries (features / domain / services) should hold

---

## Not needed (deliberately)

- Figma
- Generated web React code for ordinary screens/components — the coding agent builds these directly in React Native from the gallery, tokens, prototype and specs
- Accessibility spec
- Test plans / acceptance test docs
- Document metadata headers
- Backend/API specs
- Firmware documentation beyond the constraints listed in DATA_AND_RULES
- **[new]** From `project_todo.md` Phases 5–8, no longer needed:
  - all Figma work: variables, components, `figma-generate-*`, Dev Mode, auto layout, layer cleanup
  - Material 3 option grids and the per-component critique loops (components are decided)
  - colour-blind check, 60-30-10 check, focus-ring spec, 200% font-scaling tests
  - onboarding, profile, trusted-phone, Settings and Spotify screens and controls (later versions)
  - the signature-animation and delight tasks (done and locked in `full_dev_spec.md` §7)

## [new] Thesis / case study (not part of the dev handoff)

- [ ] Close the issue-log gate rows against the final prototype (UX-39, 44, 45, 47, 51, 53, 56, 58, 59 all still say `Open`; the log overall is 86 Decided, 22 Open, 1 Designed)
- [ ] Old-app tap counts on the emulator (Phase 9) for the old-vs-new table
- [ ] Stakeholder / friend feedback on the frozen prototype

## Before handing off

- [ ] Freeze the prototype: pick the final variant for every undecided component (toggle, slider, card surface, nav — the prototype panel lists these as "not yet decided"), strip the variations panel, motion lab, and rejected Library explorations
  - **[new]** The components are decided; record the picks. The panel note still says "not yet decided: toggle, slider, card, nav". Current defaults in FINAL_prototype.html: toggle = "Now", slider = "Ink (now)", card = "Flat (now)", nav = "Bar (now)", Library tabs = `serifsize`, sound player = `balbars`, preset tile = `orb`. Confirm these are the picks.
  - **[new]** FINAL_prototype.html still contains the Library exploration rounds (the `lxgrid` figures, e.g. "D1 · The dial"); strip them
  - **[new] Remove, don't hide.** `build_final.py` currently only hides the scaffolding with `display:none` (`section.lab`, `section.lx`, `#vars`, `.page .top`), so the code still carries the variations panel (with its stale "not yet decided" note), the motion lab ("Test the animations"), the Library exploration rounds and every rejected variant's CSS. A coding agent reads the code, so these are a conflicting source. **The building chat produces a stripped copy into `handoff/prototype/`** (same look and behaviour, scaffolding and rejected variants deleted), and checks it in a browser against FINAL. Also remove the Remote's "Change colour" stub ("Not drawn in this prototype yet") if nothing opens it.
  - **[new, 3 Nov]** Also remove the Library edit's unused sound variants (`ph.dataset.sndv` = remote / short / list; FINAL fixes "screen"). The "remote" one carries unreachable code an agent could mistake for v1: "Change on the Remote", a Remote sheet with **Update [name] / Save as new**, and a Scents chooser (`openRemote`, `openScents`)
  - **[new, 3 Nov]** Keep the screen ID tags: `build_final.py` now tags every FINAL_screens figure with its ID from SCREENS_AND_FLOWS §1 (visible tag + anchor, `FINAL_screens.html#H-2`). The stripped copy must keep them, and a renamed figure title must be added to `SCREEN_IDS` (the build prints any untagged figure)
- [x] **[new]** No tab bar on focused steps: decided and built 3 Nov (see SCREENS_AND_FLOWS rules)
- [x] **[new]** Fix the failing text greys (see DESIGN_SYSTEM) before extracting tokens: done (`text-muted` 6.2:1, `text-muted-strong` 8.7:1; FINAL draws them)
- [x] **[new]** Impeccable `audit` pass done 3 Nov (`final/AUDIT_FINAL_3nov.md`); the touch targets under 48dp were accepted as they are
- [ ] **[new]** Visually check the Remote colour picker (UX-51). The prototype CSS contains both a fully saturated rainbow wheel and a softened orb-shaded wheel; a code read couldn't tell which one renders.
- [ ] **[new]** Clean up `full_dev_spec.md`: move the superseded `-old` / `-later` sections (7.5-old, 7.6-old, 7.8-later) into an archive appendix or a separate file, remove contradictions with the handoff docs, and decide its role (recommended: a source and record, superseded by `handoff/`)
- [ ] **[new]** Walk through the frozen prototype on a real phone (phone browser)
- [ ] Build the final component gallery and verify its values match `tokens.json` and DESIGN_SYSTEM.md
- [ ] Label every animation source file `production-ready` or `algorithmic-reference`; include recordings and still frames
- [ ] Supply original SVG icons, font files and textures with clear filenames
- [ ] Sound catalog: left to the developer (read from the SD card); make sure DATA_AND_RULES and START_HERE say so
- [ ] Confirm the four scent names
- [ ] Mark remaining open questions in START_HERE instead of leaving them implicit
