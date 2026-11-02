# Handoff documentation checklist

Everything the dev (working with AI agents) needs to implement the redesign. Eight docs plus three asset folders. Write them in this order — later docs reference earlier ones.

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
  assets/               (icons, fonts, textures)
```

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

## 2. SCREENS_AND_FLOWS.md — the main document

- [ ] Screen inventory: every screen, sheet, and overlay with a short name the other docs can reference (Home, Check-in, Remote, Library, Save sheet, Scents screen, etc.)
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
  - Save a new scene; update a saved scene; save edits as new; the "· Edited" state
  - Reapply a saved scene / a past check-in
  - Rename (scenes, scents) if kept
  - Hardware partially connected ("Light unavailable → Try again")
  - App restart: what is restored, what resets

## 3. DATA_AND_RULES.md — models + product rules (2–3 pages)

- [ ] Scene object: name, source (checkin/preset/saved/scratch), colours, staticColor, mode, speed, brightness, light/sound/scent enabled, soundFolder, soundFile, soundVolume, scentId
- [ ] What persists across restarts (saved scenes, check-in history, last active scene?) vs session-only
- [ ] Scene naming rules: duplicates, suggested names, 30-char limit, update vs save-as-new
- [ ] What counts as an "edit" (colours, track, scent — not brightness/volume/speed, per prototype)
- [ ] The core behaviour rule: explicit "Set the scene" starts hardware; after that, Remote changes send live
- [ ] Hardware constraints the UI must respect:
  - Lamp and speaker are separate BLE devices; commands succeed/fail independently
  - No readback — UI shows "sent", never confirmed hardware state
  - Sound is folder/file numbers only; volume 0–30
  - Continuous controls need throttled, latest-value-wins writes; fail fast on disconnect (no 12 s mid-drag rescans)
  - Scent is UI-only for now — design the model, no hardware commands
- [ ] Sound catalog table: folder/file number ↔ display name ↔ ambience category. **Only you can provide this — confirm against what's actually on the MP3Controller SD card.**

## 4. DESIGN_SYSTEM.md — tokens + components

- [ ] Colour tokens (ground, ink, muted, surfaces — from prototype `:root` variables)
- [ ] Type scale: both families (serif + sans), sizes and weights per role (title, body, label, nav)
- [ ] Spacing, radii, card dimensions
- [ ] Each component with its chosen final variant: button/pill, toggle switch, slider, brightness dial, question scale, sound player, preset tile, tabs, nav bar, snackbar, bottom sheet
- [ ] States per component: default, pressed, selected, disabled, unavailable
- [ ] Which icons/assets you're supplying, with filenames

## 5. MOTION.md — animations

- [ ] Per animation: name, where it occurs, trigger, duration, easing, what visually changes, how it ends, loops or not, reduced-motion variant if the prototype has one
- [ ] Cover: check-in transitions, "reading your answers" sequence, result reveal, Set-the-scene peak (Light leak / Light bloom — name the locked choices), background wash in/out, snackbar, sheet open/close, Library window morph
- [ ] Orb + wash: hand over your React reference code, labelled honestly:
  - `production-ready` only if it's actual React Native Skia code
  - otherwise `algorithmic reference` — agent ports the math (OKLab/OKLCH blending, layer order, speeds, seeds) to Skia, not the browser APIs
- [ ] Include palette input format, speed input, static-mode rendering, and a 60 fps screen recording of each animation for visual comparison

## 6. CONTENT.md — final copy and data (short)

- [ ] Final names/taglines for presets and example scenes
- [ ] Check-in question copy (or "use existing questions.ts")
- [ ] The four scent names (prototype marks these PROVISIONAL — confirm first)
- [ ] Track display names (must match the sound catalog table in DATA_AND_RULES)
- [ ] UI copy that matters: button labels, snackbar text ("Sent to your room"), empty/unavailable states
- [ ] Mark anything still provisional so the agent doesn't treat placeholder copy as final

## 7. MIGRATION.md — what happens to the existing app (1 page)

- [ ] Keep as-is: `lampService.ts`, `mp3Service.ts` (wrap, don't rewrite), `moodEngine.ts`, `colorMath.ts`, `questions.ts`, `moodArchetypes.ts`, `presetThemes.ts`
- [ ] Replace: all five screens, `App.tsx` orchestration, `BottomNav`
- [ ] Delete: `openRouter.ts`, `questionFetcher.ts`, `questionBank.ts`, `QuestionCard.tsx` (dead code)
- [ ] Known bugs to fix during the rebuild: connection flag overwritten by every command result, stop marked success on BLE failure, stale connect check in SoundScreen
- [ ] Suggested build order: tokens/components → navigation shell → Home + check-in → Remote → Library/scenes → polish

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
- Accessibility spec
- Test plans / acceptance test docs
- Document metadata headers
- Backend/API specs
- Firmware documentation beyond the constraints listed in DATA_AND_RULES

## Before handing off

- [ ] Freeze the prototype: pick the final variant for every undecided component (toggle, slider, card surface, nav — the prototype panel lists these as "not yet decided"), strip the variations panel, motion lab, and rejected Library explorations
- [ ] Confirm the sound catalog against the real SD card contents
- [ ] Confirm the four scent names
- [ ] Mark remaining open questions in START_HERE instead of leaving them implicit
