# DATA_AND_RULES.md

**What this is:** the data the app keeps, the rules that decide what it does, and what the lamp and the speaker can and can't do. Screens and step-by-step flows are in `SCREENS_AND_FLOWS.md` (IDs like R-3 and flows like §4.9 refer to it).
**Status:** written from the FINAL prototype and a code audit of the existing app.
**Where it is unsure, it says so.** Items marked **[dev]** are for the developer to confirm or decide. Don't guess.

---

## 1. Where the data comes from

| Data | Source | Notes |
|---|---|---|
| Presets (8) | the existing app's `presetThemes.ts` | Golden Hour, Deep Night, Ocean Drift, Rose Garden, Storm Calm, Forest Floor, Candy Dream, Ember Glow. **All 8 ship**; FINAL's Library shows 6 as sample data. Keep their IDs and 8 colours. |
| Moods (the check-in results) | the existing app's `moodArchetypes.ts` + `moodEngine.ts` | **25** archetypes; `CONTENT.md` §3 lists every one with its line and scent. |
| Each preset's and mood's line and scent | `CONTENT.md` §2 and §3 | v1 uses these lines and scents. Where FINAL's sample text or scent differs (e.g. Storm Calm, Forest Floor), `CONTENT.md` wins. |
| Mood names | the code | v1 ships the names in the code. Store moods by **ID** and look the name up when shown, so a later rename changes old check-ins too. |
| Questions (100: 20 each for energy, social, mental, emotional, purpose) | the existing app's `questions.ts` | Keep IDs, dimensions and polarity (scoring doesn't change). 16 are reworded: `CONTENT.md` §5 has the new text. |
| The 4 scents | the design (`CONTENT.md` §4) | Warm Apple Crumble · Malibu · Cosy Cottage · Vanilla and Caramel. IDs 1–4, fixed. |
| Tracks | **unknown**: only on the speaker's SD card | §6. FINAL's track names are placeholders. |

---

## 2. The data model

TypeScript-style, to show the shape; the names are suggestions.

```ts
type Hex = `#${string}`;                 // "#RRGGBB"
type Palette = [Hex, Hex, Hex, Hex, Hex, Hex, Hex, Hex];   // always 8 (the firmware's maximum)
type ScentId = 1 | 2 | 3 | 4;
type TrackRef = { folder: number; file: number };          // the speaker plays by numbers only (§5.2)

// A scene's own parts: these decide when Save appears (§3.3)
interface SceneParts {
  palette: Palette;          // the 8 colours as shown (after Colour range)
  colourRange: number;       // 0–0.6, starts at 0.28 (§3.6)
  track: TrackRef | null;
  scentId: ScentId | null;
}

interface SavedScene extends SceneParts {
  id: string;                // uuid
  name: string;              // §3.4
  origin:                    // Library → Saved groups (L-2)
    | { kind: 'mine' }                                     // "Made by you"
    | { kind: 'preset'; presetId: string }                 // "Based on presets": "Based on Golden Hour"
    | { kind: 'checkin'; checkInId: string };              // "From check-ins": "From a check-in · Thu 22 Oct"
  heldIndex: number | null;  // which of the 8 is held (Cycle off); stored, never counts as an edit
  createdAt: string; lastSetAt: string | null;             // Saved is sorted by last set, newest first
}

interface CheckIn {
  id: string;
  at: string;                // ISO time it finished
  night: string;             // the evening it belongs to, "2026-10-23" (§3.8)
  answers: { questionId: string; value: number; round: number }[];   // value 1–10
  vector: [number, number, number, number, number];                  // the engine's 5 averages
  moodId: string;            // the archetype; name looked up when shown
  palette: Palette;          // the engine's output for these answers (it shifts hues per answers)
  track: TrackRef | null;    // the sound it was set with (random for now, §3.9)
  scentId: ScentId;          // the mood's scent (CONTENT.md §3)
  wasSet: boolean;           // Set the scene, or Not now
}

interface UnfinishedCheckIn { answers: CheckIn['answers']; round: number; currentQuestionId: string; startedAt: string }

interface Scent { id: ScentId; originalName: string; customName: string | null }    // shown: customName ?? originalName

// What's on now ("the session"): Home, the Remote and the Library all read this
interface Session {
  source:                    // what is playing; null = nothing set yet (R-1)
    | { kind: 'preset'; presetId: string }
    | { kind: 'mood'; checkInId: string }
    | { kind: 'saved'; sceneId: string }
    | { kind: 'scratch' }    // built on the Remote, not saved: "New scene"
    | null;
  parts: SceneParts;         // the working copy, including unsaved changes
  baseline: SceneParts | null;   // the saved version; Save shows when parts ≠ baseline (§3.3)
  heldIndex: number | null;
  // the person's own settings for the moment, never part of a scene
  on: { light: boolean; sound: boolean; scent: boolean };    // All = all three
  brightness: number;        // 0.05–1.0
  cycle: boolean;            // Cycle colours (firmware: immersive / static)
  speed: number;             // §5.1
  volume: number;            // 0–30
  playing: boolean;          // the player's ⏸ / ▶
  lastAction: { kind: 'set' | 'adjusted' | 'off'; at: string };   // Home's bottom row (H-2)
  preview: boolean;          // true while building from scratch, before the first Set the scene
}
```

**Not stored as a scene:** presets and moods are read-only data from the code. Setting one copies its parts into the Session; editing it and pressing Save makes a new `SavedScene` (§3.4).

---

## 3. Rules

### 3.1 Starting is explicit, adjusting is live

- **Nothing playing:** the Remote edits a local preview (`Session.preview = true`); nothing reaches the hardware until **Set the scene**.
- **A scene is running** (from a check-in, a preset, a saved scene, or from scratch after Set the scene): every change on the Remote and its screens is sent live.
- **Live:** brightness, colour (a dot, the wheel, Colour range), Cycle and its speed, volume, the switches.
- **Not live:** choosing a track. It is sent on the tap that chooses it, never while someone scrolls the list.
- **Setting a scene never changes brightness, Cycle, speed or volume.** They stay the person's own settings (a confirmed product rule from the code audit). It does switch Light, Sound and Scent on.
- **The scene's sound plays when it is set**, together with the light.

### 3.2 Sending live: throttle and fail fast

- Each lamp command carries the **full state** (§5.1), so in-between values can be dropped.
- **At most one write in flight; send at most every ~150–250 ms; always send the latest value; send one final command when the finger lifts.** The old code writes on every change and waits for each one, so the lamp lags and replays stale values.
- **Connect when the app opens**, never on the first drag (the old app's first send scans for up to 12 s).
- **A drop mid-use fails fast:** the Remote's line says "Reconnecting…" at once, the controls keep working and keep their values, and the latest state is sent when it's back. After **~5 s [dev: set the real value]** it falls through to "Partly connected" or "Can't connect" (SCREENS_AND_FLOWS §4.14).

### 3.3 What counts as an edit (when Save appears)

Save appears when **(a)** a light, a sound and a scent are all chosen, and **(b)** the scene was never saved, or its own parts differ from the saved version.

| Counts (Save appears) | Never counts |
|---|---|
| a different scent | the Light, Sound, Scent and All switches |
| a different track (picked, or skipped with ◀◀ / ▶▶) | brightness, volume |
| a new palette from the wheel | Cycle on / off, its speed |
| moving Colour range | holding a colour (one of the Remote's 4 dots or the Light screen's 8) |
| | renaming a scent |
| | setting a scene from Home or the Library (it becomes the saved version) |

- **Compare by value, by ID:** `parts` vs `baseline`, comparing the 8 colours, the track's folder and file, the scent **ID** and Colour range. FINAL compares the scent's displayed name, so a rename can wrongly show Save; don't copy that.
- Changing the parts back to the saved values hides Save.
- The unsaved state survives leaving the Remote and restarting the app (`Session` is stored).

### 3.4 Saving and names

- **Two save rules:** your own saved scene saves in place (the name can be changed in the same field). Anything else saves as a **new** scene: from scratch it's suggested as "My scene", a preset or a check-in as "[name] 2", and the original stays as it was.

- **Saved has 3 groups** (L-2), from one field, `origin`, set at the first save and never changed: **Made by you** (built from scratch) · **Based on presets** (a preset changed on the Remote and saved) · **From check-ins** (a check-in saved from its scene view with **Save as a scene**, unchanged, or a check-in mood changed on the Remote and saved).

- FINAL doesn't add the new row to the Library's Saved list (its rows are samples); build it.

- After saving, `baseline = parts` and the undo history is cleared.
- **One name rule for every name field** (saved scenes, scent renames):
  - 1–30 characters after trimming, emoji allowed; an empty name can't be saved;
  - **taken** = the name of a preset or a saved scene, ignoring case (for scents: another scent's shown name); your own scene's current name is never taken;
  - a taken name is numbered, visibly: "Golden Hour" → "Golden Hour 2"; a name already ending in a number counts on ("Golden Hour 2" → "Golden Hour 3");
  - the number never takes a name past 30: shorten the name before it;
  - a suggested name ("My scene", "[name] 2") is always a free one.
- **Delete** (Library ⋯ → trash) removes the saved scene, with Undo in the message bar. If it's the scene playing, the Session keeps playing it as an unsaved scene ("New scene", origin mine). *(FINAL doesn't show this case.)*

### 3.5 All and the parts

- **Light, Sound, Scent** switch independently. **All** turns all three off or on; it is **one switch**, shared by Home and the Remote.
- **Off:** light dark, sound paused, scent stopped. **On:** the whole last scene comes back (the Session). Fast repeated taps: the last one wins.
- **Light off** sends the lamp's **off command** (§5.1). Brightness itself never goes below 5%.
- With Light off, the Remote's orb shows the pearl globe.
- **Undo after Set the scene** (the 5 s message bar): re-send what was on before (the previous Session), or turn everything off if nothing was on.
- **Undo / Redo on the Remote:** many steps, both ways, for every one-tap change (including those that don't count for Save). Each step re-sends the restored state live. The history is kept only while on the Remote (not stored) and is cleared by Save or a new Set the scene.

### 3.6 Colours

- A scene has **8 colours**. The Light screen shows all 8; the Remote shows the **first 4, in the same order**.
- **Cycle on:** the lamp moves through the scene's 8 colours (firmware immersive mode); the dots are passive and the speed slider takes the Cycle label's place. It always cycles **the current scene's** palette, never a default one.
- **Cycle off:** one colour is held (firmware static mode): tap any of the 8 on the Light screen or any of the Remote's 4. `heldIndex` starts at 0. If the held colour is one of 5–8, the Remote's 4th dot shows it, ringed.
- **The wheel** sets hue (round) and saturation (toward the centre is whiter). There is no lightness control: brightness is the lamp's ring.
- **The wheel's 8 colours**: the old Hue screen's recipe (`buildPalette()` in `HueScreen.tsx`; copy it out before that screen is deleted, `MIGRATION.md` §2), with **one** contrasting colour instead of two. From the picked colour (H, S, L):
  1. the picked colour; 2. hue +15°, lightness +6; 3. hue −15°, lightness +10; 4. hue +30°, saturation −8;
  5. **the one contrasting colour:** hue +180°, saturation −18, lightness +8;
  6. ~~hue +150°~~ → **a close colour instead: hue +45°, saturation −5, lightness +2** (MOTION.md, check B);
  7. hue −30°, lightness +5; 8. the picked hue, saturation −28, lightness +18.
  - Keep the old clamps on saturation and lightness. The wheel has no lightness control, so the picked colour's lightness is fixed **[dev: use the old picker's default]**.
  - Colour range (below) then smooths these 8. FINAL only steps through sample palettes, so it doesn't show this recipe.
- **Colour range**: the Light screen's slider, labelled **Varied** (left) ↔ **Close** (right) as in FINAL, no number; **0–100%, the old app's full range** (its 0–1 slider), starting at 28% (the old default). **It runs the old app's smoothing algorithm** (Raw → Refined, in `colorMath.ts`), unchanged:
  - it compares the palette with the 10 curated reference palettes (80 colours);
  - each colour's target is 60% its nearest reference colour + 40% the colour in the same place of the best-matching reference palette;
  - the slider sets how far each colour moves toward its target (HSL, shortest way round the hue); at 0 the palette is unchanged.
  - So toward Close the colours get closer to the curated palettes, not to each other. **FINAL's dots only approximate this** (they pull toward the first colour); build the old algorithm, not the prototype's.
  - A check-in's result starts at 28%, as the old app's result did. The held colour starts at the first smoothed colour (`heldIndex` 0), like the old static colour.
- **Mood palettes:** keep the old engine: the nearest archetype's 8 colours, hue-shifted slightly by the answers.

### 3.7 Scents

- Scent is treated as real in the UI (choose, rename, saved with the scene), but **the app sends nothing for it** (the lamp has no scent part yet), and message bars never list it as sent.
- A rename changes `customName` only; "Use original name" clears it. Scenes store the scent **ID**, so a rename shows everywhere.

### 3.8 Time of day (fixed in v1)

- **Bedtime 23:00, wake time 07:00**, fixed in v1 (editable in v2). From them: **evening reset** = bedtime − 6 h (17:00); **"Sleep well"** from bedtime − 1 h (22:00).
- **The night a check-in belongs to** (`CheckIn.night`): made before wake time → the night before; made after wake time → the coming night. So a check-in at 01:00 on the 24th belongs to the 23rd, and one at 15:00 on the 24th belongs to the 24th.
- **Home asks** ("How are you tonight?") from the evening reset if tonight has no check-in.
- **"Check in again"** shows if tonight already has a check-in (by `night`, above); otherwise "Check in" (also when the scene came from the Remote or the Library).
- **Label:** a check-in made before the evening reset shows "Today · [mood]", after it "Tonight · [mood]".
- **A second check-in the same night** replaces tonight's scene; both stay in Library → Check-ins (the calendar shows the latest one per night).
- **All off from 22:00** switches Home to "Sleep well" (no name in v1).
- **Daytime** (wake time → evening reset): Home shows last night's mood, faded.
- **Unfinished check-in:** never cleared while open; cleared the next time the app opens after the evening reset.
- Times on screen follow the phone's 12 / 24-hour setting.

### 3.9 The check-in

- **Rounds of 5**, one question from each dimension per round, in a random order within the round. Skip swaps in another question from the same dimension (the progress circle doesn't fill). Questions don't repeat within a check-in.
- 1–10 scale, **nothing pre-selected** (the old slider started at 5). "See my mood" after the 5th answer and on every later card. No total ever shown.
- **Scoring:** keep the old engine unchanged (positive questions use the score, negative ones 11 − score; average per dimension, 5.5 if a dimension has no answer; nearest archetype by distance).
- **The result's sound** is a random track for now (one matching track per mood later). Its scent is the mood's (`CONTENT.md` §3).

### 3.10 Presets' sounds

The old presets have no sound; FINAL gives each one a placeholder track. **For now a preset's sound is a random track, like a mood's**.

### 3.11 After a power cut or a restart

- **Lamp power cut:** nothing happens automatically. The lamp restarts in its own default (lavender) and the app can't know; the person sets a scene or toggles All.
- **App restart:** opens on Home with the stored Session; reconnects by itself; sends nothing until the person does something.

---

## 4. What is stored

On the phone only: AsyncStorage, with Android Auto Backup on. No account, no server, no analytics.

| Key (suggested) | Holds | Kept |
|---|---|---|
| `@wl/v1/savedScenes` | `SavedScene[]` | until deleted |
| `@wl/v1/checkIns` | `CheckIn[]` | **indefinitely** |
| `@wl/v1/unfinishedCheckIn` | `UnfinishedCheckIn \| null` | until finished, or the first app open after the evening reset |
| `@wl/v1/session` | `Session` (incl. unsaved changes and the baseline) | always the latest |
| `@wl/v1/scents` | the 4 `Scent`s (renames) | always |
| `@wl/v1/devices` | the lamp's and the speaker's saved device IDs | until the app is uninstalled |
| `@wl/v1/flags` | e.g. the Library swipe hint seen, the permission asked once | always |

- **Not stored:** the Undo / Redo history, the connection state, a sound preview playing in the Library.
- Put a version number in every key or record, so later releases can migrate (onboarding and the profile come in v2).
- The old app stores nothing that v1 needs. Its only key, `@wellness_question_pool`, belongs to unused code; leave it unused.

---

## 5. Hardware: what the app can and can't do

### 5.1 The lamp (`WellnessLamp`)

- **Bluetooth LE**, device name `WellnessLamp`; service `12345678-1234-1234-1234-123456789abc`; write characteristic ending `9abd`; JSON, Base64 for `react-native-ble-plx`, MTU 512.
- **Two commands, both full state:**
  - `{"mode":"static","color":"#RRGGBB","brightness":0.8,"startT":0}`: Cycle off; `color` = `palette[heldIndex]`.
  - `{"mode":"immersive","colors":[8 × "#RRGGBB"],"speed":1.0,"brightness":0.8,"startT":0}`: Cycle on.
  - **`startT` only when a scene is set.** The firmware restarts its colour walk whenever `startT` is present, so live writes (brightness, speed, Colour range) leave it out (`MIGRATION.md` §9).
- **Limits:**
  - brightness `0.05–1.0` (5–100%; the firmware applies gamma 2.2). The ring stops at 5% (**clamp at 5%** everywhere a value is sent).
  - speed: firmware `0.1–5.0`; map FINAL's Slow–Fast slider to the old app's range, `0.2–3.0`.
  - at most **8 colours** (more are ignored).
  - the firmware eases to each new colour over ~550 ms, so 4–6 updates a second looks continuous.
- **Off [dev]:** the developer has said turning the light off is a simple Bluetooth command. The code audit found **no off command** in today's app or firmware (brightness stops at 5%). Confirm the command, or add it. That is the only firmware change v1 may need.
- **No readback.** The app can know the lamp is in range (the scan finds it) and that a command arrived (`ok`), never its colour, brightness or on/off state. The UI says "sent", never "done".
- **Several lamps:** one phone connects to one lamp; that lamp passes the state on to up to 10 others over ESP-NOW. No group or peer UI in v1.
- **After a power cut** the lamp starts lavender; it doesn't remember the last scene (v2).

### 5.2 The speaker (`MP3Controller`)

- A **separate** Bluetooth LE device. The phone never plays audio itself.
- Commands: `{"cmd":"playFolder","folder":F,"file":N}`, `pause`, `resume`, `stop`, `{"cmd":"volume","level":0–30}`. Next and previous are done by working out the file number and sending `playFolder` (as the old app does).
- **Volume:** FINAL shows it as a slider; send `round(slider × 30)`. The phone's **volume buttons** change the speaker's volume while the app is open (Android VolumeProvider), in step with the slider.
- **No readback, no track names, no lengths:** the speaker can't report what's on its card or what's playing.
- Its firmware isn't in the repository, so the command list above is the app's side only. **[dev]** Confirm it against the speaker.

### 5.3 Both

- The lamp and the speaker connect, succeed and fail **independently**. A send reports per part ("Light sent · Sound unavailable").
- **Timeouts:** connecting ~10 s per attempt; Set the scene ~8 s; Reconnecting… ~5 s **[dev: set the real values]**.
- A lamp in use by another phone looks like one out of range, so it shows "Can't connect" **[dev: confirm]**.
- Use **one** Bluetooth manager for both devices. The old app makes two and their scans aren't coordinated (DEV-04).

---

## 6. The sound catalog [dev]

**The track list is unknown.** The music exists only on the speaker's SD card; nobody on the design side has the list. The old app assumes **6 folders × 5 tracks** with no names:

| Folder | Old app's label | FINAL's group |
|---|---|---|
| 1 | Rain | Ambient |
| 2 | Forest | Ambient |
| 3 | Ocean | Ambient |
| 4 | Fire | Ambient |
| 5 | Night | Ambient |
| 6 | Music | Music |

The group column is an assumption (FINAL's Sound screens have two groups, Ambient and Music). Check it on the card.

**To do:** read the card, then fill in one row per file and ship it in the app. The speaker can't report the list, so this table is the only source.

| folder | file | group | name shown | length | notes |
|---|---|---|---|---|---|
| 1 | 1 | Ambient | … | m:ss | |

- FINAL's 28 track names ("Night rain", "Slow piano", …) and lengths are **placeholders**. Replace them all.
- If the card changes later, this table must change with it.

---

## 7. Old app → new app

### Keep (works today)
- The lamp protocol (§5.1) and the speaker protocol (§5.2): `lampService.ts`, `mp3Service.ts`.
- The mood engine and the archetypes (`moodEngine.ts`, `moodArchetypes.ts`); the 100 questions (IDs, dimensions, polarity).
- The 8 presets' palettes.
- The palette smoothing (`colorMath.ts`), now behind Colour range (§3.6), and the Hue screen's 8-colour recipe with one change (§3.6).

### Remove or correct
- Five tabs (Glow, Feel, Themes, Hue, Sound) → three (Library · Home · Remote).
- **Send to Lamp** → Set the scene, then live (§3.1).
- Connecting on the first send (12 s scan) → connect when the app opens; fail fast on a drop (§3.2).
- 40 random questions → rounds of 5 (DEV-05); the unreachable "all answered" state (DEV-01).
- The slider starting at 5 → nothing pre-selected.
- Sound connect showing an error after success (DEV-02); the orb using 6 colours while the lamp gets 8 (DEV-03); two Bluetooth managers (DEV-04).
- Applying a preset always trying the Forest folder → the scene's own sound.
- Static / Immersive toggle → Cycle colours; speed labels Glacial … Pulse → a Slow–Fast slider.
- The Hue screen → the Light screen's wheel: its 8-colour recipe is kept, minus the +150° colour; its lightness slider goes (§3.6).
- Raw–Refined (the slider on the result) → **Colour range** on the Light screen (Varied ↔ Close); the smoothing algorithm and its 0–100% range are kept (§3.6).
- Nothing persisted → §4.
- The unused OpenRouter code (no key, not imported): leave it out. Never put an API key in the app.

### New in v1
- Scenes with light, sound and scent; saved scenes; check-in history; scent names and renames.
- Live control with a throttle; All and the per-part switches; the off command (§5.1).
- Holding one of the 8 colours; Colour range; Undo / Redo; one name rule.
- The phone's volume buttons control the speaker.
- Minimal connection: Android's Nearby devices prompt the first time the Remote opens or Set the scene is pressed; then both devices connect in parallel and are remembered.

### Not in v1 (design only; don't build)
- Onboarding, the profile, Settings behind Me, editable bedtime and wake time, the evening reminder, "Play sound with scenes", Delete my data.
- In-app setup screens, the System sheet, trusted phones.
- The lamp storing the last scene, a state report, a sleep timer on the device.
- Scent hardware commands; a multi-lamp (group) UI; "Recently set" in the Library; the "ESP connected by touch" pairing idea; Spotify.

### Waiting on a confirmation
- **[dev]** the off command; the track list; the speaker's commands; the timeouts; another phone vs out of range.

### Bluetooth and firmware changes
- None, apart from the off command if the lamp doesn't have it yet (§5.1).
