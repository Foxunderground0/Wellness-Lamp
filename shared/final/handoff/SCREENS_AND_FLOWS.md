# SCREENS_AND_FLOWS — v1

The main document. It wins over every other doc (see START_HERE, *Document priority*). It covers every v1 screen, sheet and state, how they connect, and every flow step by step. Data shapes, persistence and hardware details are in `DATA_AND_RULES.md`; animation values are in `MOTION.md`; final copy is in `CONTENT.md`.

**Conventions**
- Each screen and state has an ID (H-, C-, L-, R-, X-). The other docs use these IDs.
- *Drawn:* the figure title in `prototype/FINAL_screens.html` showing that state. *Written:* the state is described here only, not drawn.
- UI copy is in quotes. Copy marked *(provisional)* is not final (see `CONTENT.md`).
- "Sends" means a BLE command to the lamp (light) or the speaker (sound). Scent never sends anything (UI and data only).

---

## 1. Screen inventory

Same sections and order as `prototype/FINAL_screens.html`. **Each figure there carries its ID as a tag before its title** (H-1, R-3, X-2d…), and the ID here links straight to it (`FINAL_screens.html#H-2`); the **Figure** column is its title. Build each screen by comparing this row with that figure. **On screen** lists what's on it, top to bottom. Every tab screen has the status bar at the top and the tab bar (Library · Home · Remote) at the bottom unless it says *no tab bar*; Me is top right on every tab (opens nothing in v1). States not drawn in FINAL_screens follow in §1.6.

### 1.1 Home

| ID | Figure | On screen |
|---|---|---|
| [H-1](prototype/FINAL_screens.html#H-1) | Home, tonight | The date (top left, two lines: "Thursday," / "22 October"; on every Home state) · Me · title "How are you tonight?" · line "A few questions, then an atmosphere for your room." · the pearl orb (centre) · **Check in** (outline) |
| [C-1](prototype/FINAL_screens.html#C-1) | Check-in | *No tab bar, no Me.* 5 progress circles (top) · × (top right; closes, your answers are kept) · the question · the 1–10 answer line (tap to place the dot; nothing pre-selected) · **Skip** · **Next** |
| [H-2](prototype/FINAL_screens.html#H-2) | A scene set | The date · Me · label "Tonight" · scene name · its line (no sound or scent lines once a scene is set: no room above Check in again) · the orb at rest (1.10×, Corona) over the crochet wash · the button **Check in** (it reads "Check in again" once tonight has a check-in) · bottom row "Set at 21:42" + **All** switch (in the scene's deep colour) |
| [H-2b](prototype/FINAL_screens.html#H-2b) | After a check-in | As H-2 for tonight's mood; the button reads **Check in again** |
| [H-3](prototype/FINAL_screens.html#H-3) | A scene made on the Remote | As H-2; name "New scene" (until saved), line "Made on the Remote" *(provisional)* |
| [H-10](prototype/FINAL_screens.html#H-10) | Me | The Me button (a circle, top right). v1: a plain person icon (no name, no initial); opens nothing |
| [C-3](prototype/FINAL_screens.html#C-3) | After the 5th answer | C-1 with **See my mood** (filled) + "Keep going for a sharper read" (text button) in place of Skip · Next; See my mood stays on later cards; no total ever shown |
| [C-4](prototype/FINAL_screens.html#C-4) | Reading your answers | Back on Home's layout (the date, Me and the tab bar return): the orb developing from pearl to the mood's colours (about 4 s); status line "Reading your answers…"; no button |
| [C-5](prototype/FINAL_screens.html#C-5) | Result | Label "Tonight" · mood name · its line · sound · scent · **Set the scene** (filled) · **Not now** (text) |
| [H-4](prototype/FINAL_screens.html#H-4) | Mood not set | After Not now: the mood name · "Not set yet. You can set it any time." · **Set the scene** (outline) |
| [H-5](prototype/FINAL_screens.html#H-5) | Unfinished check-in | H-1 with the button reading **Continue** (closed with × after an answer or two; picks up at the next question) |
| [H-6](prototype/FINAL_screens.html#H-6) | All off | H-2 with All off: bottom row "Off"; the wash recedes |
| [X-1c](prototype/FINAL_screens.html#X-1c) | Message bar on Home | H-2b just after Set the scene: message bar "Sent to your room · Undo", directly above the bottom row (5 s) |

### 1.2 Library

| ID | Figure | On screen |
|---|---|---|
| [L-1](prototype/FINAL_screens.html#L-1) | Presets | Heading tabs **Presets** · Saved · Check-ins (serif; current larger, ink) · 2-column grid of Globe stills; under each: name, sound (note icon), scent |
| [L-2](prototype/FINAL_screens.html#L-2) | Saved | Tabs · group headings **Made by you · From check-ins · Based on presets** (sticky) · 64 px rows: Globe still, name, second line (sound · scent / check-in date / which preset), ⋯. Which group a scene goes in is set when it's first saved on the Remote (4.9) |
| [L-11](prototype/FINAL_screens.html#L-11) | A preset on now | As L-1; the scene that's on has moving playing bars before its name and a 2 px warm-grey ring round its orb |
| [L-6](prototype/FINAL_screens.html#L-6) | Check-ins | Tabs · "[Month] ▾" with ‹ › · 7-column calendar: a Globe still with the date on each night with a check-in (the latest if several; tonight's keeps its ring) · that month's list (rows as L-2; tonight's row with playing bars) |
| [L-3](prototype/FINAL_screens.html#L-3) | Saved, ⋯ open | As L-2; the row shows pen (edit) and trash (delete) |
| [L-4](prototype/FINAL_screens.html#L-4) | Edit, in the row | In the row: Globe still + name field · "Sound · [track] · [category] ›" · "Scent" + the 4 scents as chips · **Cancel** / **Save** |
| [L-13](prototype/FINAL_screens.html#L-13) | Sounds screen | *No tab bar.* × (top left) · "Sound" · "For [scene] · now [sound]" · search field · Ambient · Music tabs · one 56 px row per track (name, ▶); the current one tinted with "In this scene" |
| [L-13b](prototype/FINAL_screens.html#L-13b) | A different track selected | As L-13; the tint moves to the chosen track ("Chosen"); the original keeps "In this scene"; **Choose [track]** (full width, bottom) |
| [L-13c](prototype/FINAL_screens.html#L-13c) | Searching | As L-13 with a query: results from both categories, each with its category under the name; the tabs dim |
| [L-13d](prototype/FINAL_screens.html#L-13d) | Nothing matches | As L-13c: "Nothing matches “[query]”." (no button; × in the field clears it) |
| [L-13e](prototype/FINAL_screens.html#L-13e) | Preview playing | As L-13; the playing row says "Playing on the lamp", ▶ becomes ⏸ |
| [L-7](prototype/FINAL_screens.html#L-7) | Every month | Year view (no title): years as headings, 12 months each; every past month tappable (a month with none opens L-10), the month you came from tinted, future months dimmed |
| [L-12](prototype/FINAL_screens.html#L-12) | Scene view | *No tab bar.* Full screen over the crochet backdrop · × (top left) · the tab's names in a strip (current centred, neighbours cut off at the edges) · subheading (source · time; "On now" with playing bars when on) · the orb (176 dp, in the same place as Home's) · its line · sound line (▶, or playing bars while it plays, + underlined "Ambient · [track]": a button) · scent line · **Set the scene** (full width; it goes once the scene is on) · a **check-in's** view also has **Save as a scene** (text button, near the bottom; opens L-15) · a **saved scene's** view has **⋯** (opens that row's pen and trash, L-3) |
| [L-5](prototype/FINAL_screens.html#L-5) | Saved, empty | Tabs · "Scenes you save live here." · **Go to Remote** (outline) |
| [L-8](prototype/FINAL_screens.html#L-8) | Check-ins, empty | Tabs · "Each evening's check-in shows up here." · **Check in** (outline) |
| [L-13f](prototype/FINAL_screens.html#L-13f) | Sounds, no tracks | As L-13; the list area: "No tracks here yet." |
| [L-9](prototype/FINAL_screens.html#L-9) | This month, before its first check-in | As L-6 with an empty calendar · "No check-ins yet this month." *(provisional)* · **Check in** (goes to Home's check-in); ‹ still goes back a month |
| [L-10](prototype/FINAL_screens.html#L-10) | A month with none | L-6 for a past month without check-ins: "No check-ins in [month]."; ‹ › still move between months |
| [L-15](prototype/FINAL_screens.html#L-15) | Naming sheet | *Over the scene view.* A dimmed backdrop · a cream sheet from the bottom (rounded top corners) · title "Save as a scene" (serif) · the name field (starts with the mood's name, numbered if taken; the name rule) · from 25 characters "27 of 30" · **Cancel** (text) · **Save** (filled) |

### 1.3 Remote

| ID | Figure | On screen |
|---|---|---|
| [R-1](prototype/FINAL_screens.html#R-1) | Remote, nothing playing (the start) | Me · connection line · scene line "Nothing on yet" + **All** (top right) · **Light ›** + switch · brightness ring round the pearl globe (sun icon below) · 4 pearl dots + **Cycle** · **Sound ›** + switch · "No sound yet" + **Choose** · ◀◀ ▶ ▶▶ · volume (speaker icon) · **Scent ›** + "No scent yet" + **Choose** + switch. **No bottom button yet:** it appears with the first change (every first change switches a part on) |
| [R-3](prototype/FINAL_screens.html#R-3) | Remote, a scene playing | As R-1 with the scene: its name (with a pencil after it if it's your own saved scene), its 4 colours, track name + category, ◀◀ ⏸ ▶▶, scent name; the switches in the scene's deep colour · bottom group: Undo · **Save** (only when there's something to save, §4.9) · Redo (Undo / Redo show once there's something to undo or redo) |
| [R-4](prototype/FINAL_screens.html#R-4) | Light screen | ‹ Back · "Light" · the scene's name · the colour wheel (round = hue, inward = whiter) · the scene's 8 colours (tap to hold one) · Colour range (Varied ↔ Close) |
| [R-5](prototype/FINAL_screens.html#R-5) | Sound screen | ‹ · "Sound" · the scene's name · Ambient · Music tabs · track rows (name, length; playing bars before the current track; the list opens with the current track in the middle) · the player pinned at the bottom |
| [R-5b](prototype/FINAL_screens.html#R-5b) | Sound, a long list | As R-5; the list scrolls above the pinned player |
| [R-6](prototype/FINAL_screens.html#R-6) | Scent screen | ‹ · "Scent" · the scene's name · the 4 scents (the one in use ticked and tinted; ⋯ → Rename / Use original name; a renamed scent shows its original name underneath) |
| [R-2](prototype/FINAL_screens.html#R-2) | Remote, building (preview) | R-1 after the first change: "New scene"; nothing has reached the lamp; the player shows ▶; bottom: Undo · **Pick light, sound, scent** (disabled) · Redo; it becomes **Set the scene** once a light, a sound and a scent are chosen |
| [R-3b](prototype/FINAL_screens.html#R-3b) | Something to save | R-3 after a change (here the track): bottom group Undo · **Save** · Redo |
| [R-3c](prototype/FINAL_screens.html#R-3c) | Cycling | R-3 with Cycle on: the key reads "Cycling" on the strong surface with its edge line; the dots give way to the speed slider (Slow ↔ Fast) |
| [R-3d](prototype/FINAL_screens.html#R-3d) | Brightness, while dragging | R-3 with a finger on the ring: the value ("72%", 5 to 100) replaces the sun icon under the globe |
| [R-6b](prototype/FINAL_screens.html#R-6b) | Scent rename | R-6 after ⋯ → Rename (the pencil): the scent's name as an underlined field, all selected, with ✓ and ✕ (the name rule, §3.6) |

### 1.4 Names: one rule everywhere

| ID | Figure | On screen |
|---|---|---|
| [R-7a](prototype/FINAL_screens.html#R-7a) | Save: the name is empty | R-3 with the scene name as an underlined field + **Done** (disabled) |
| [R-7b](prototype/FINAL_screens.html#R-7b) | Save: 27 of 30 | As R-7a with a long name; grey "27 of 30" under the field |
| [R-7c](prototype/FINAL_screens.html#R-7c) | Save: a name that's taken | As R-7a; grey "“Golden Hour” is taken · saves as “Golden Hour 2”" *(provisional)*; Done stays on |
| [L-4b](prototype/FINAL_screens.html#L-4b) | Library: in-row edit, a taken name | L-4 with the same grey line under the name field |

### 1.5 Connection

The four flow diagrams at the top of the section are §4.13. Each state below is the base screen named in its figure plus the line or change described (X-2, X-3, X-4).

| ID | Figure | On screen |
|---|---|---|
| [X-5a](prototype/FINAL_screens.html#X-5a) | 1 · First time on the Remote | R-1 under Android's Nearby devices prompt; nothing of ours yet |
| [X-2a](prototype/FINAL_screens.html#X-2a) | 2 · Connecting… | R-1; grey "Connecting…" beside Me (no action) |
| [X-2b](prototype/FINAL_screens.html#X-2b) | 3 · Connected | R-3; grey "Connected" beside Me (not a button) |
| [X-2c](prototype/FINAL_screens.html#X-2c) | 4 · Not allowed | R-1; the whole line "Allow nearby devices · Open settings" is the button |
| [X-3a](prototype/FINAL_screens.html#X-3a) | 5 · Partly connected | R-3; grey "Partly connected"; the Sound card's controls give way to "Sound unavailable · Try again"; Light keeps working |
| [X-2d](prototype/FINAL_screens.html#X-2d) | 6 · Can't connect | R-3; red "Can't connect · Try again" (the whole line); settings stay. A lamp in use by another phone shows the same |
| [X-2e](prototype/FINAL_screens.html#X-2e) | 7 · Bluetooth is off | R-3; "Bluetooth is off · Turn on" |
| [X-5b](prototype/FINAL_screens.html#X-5b) | 8 · Turn on: Android's prompt | Android's Bluetooth prompt; Allow → Connecting… |
| [X-3b](prototype/FINAL_screens.html#X-3b) | Remote, light unavailable | R-3; grey "Partly connected"; the Light card's controls give way to "Light unavailable · Try again" |
| [X-2f](prototype/FINAL_screens.html#X-2f) | Home, light unavailable | H-2; "Light unavailable · Try again" beside Me |
| [X-1a](prototype/FINAL_screens.html#X-1a) | Only the sound arrived | Home after Set the scene; message bar "Sound sent · Light unavailable" |
| [X-2g](prototype/FINAL_screens.html#X-2g) | Reconnecting… | R-3; grey "Reconnecting…" (no action); controls keep working |
| [X-2h](prototype/FINAL_screens.html#X-2h) | Not back after ~5 s | R-3; red "Can't connect · Try again" (or "Partly connected" if one part is back) |
| [L-13g](prototype/FINAL_screens.html#L-13g) | Sounds screen, speaker unavailable | L-13; ▶ doesn't play; "Sound unavailable · Try again" under the tapped row (the only place it shows: no connection line at the top) |
| [R-5c](prototype/FINAL_screens.html#R-5c) | Sound screen, speaker unavailable | R-5; the tapped track is chosen but doesn't play; "Sound unavailable · Try again" right above the player; no playing bars |
| [X-2i](prototype/FINAL_screens.html#X-2i) | 9 · Home, all fine | H-2; nothing about the connection |
| [X-2j](prototype/FINAL_screens.html#X-2j) | 10 · Home, can't connect | H-2; red "Can't connect · Try again" beside Me |
| [X-2k](prototype/FINAL_screens.html#X-2k) | 11 · Home, sound unavailable | H-2; "Sound unavailable · Try again" beside Me |
| [X-2l](prototype/FINAL_screens.html#X-2l) | 12 · Library, Bluetooth off | L-1; "Bluetooth is off · Turn on" beside Me |
| [X-4a](prototype/FINAL_screens.html#X-4a) | 13 · First Set the scene | C-5 under Android's Nearby devices prompt; the button shows "Setting the scene…" and waits |
| [X-4b](prototype/FINAL_screens.html#X-4b) | 14 · Can't reach it | C-5; one red line right above the button; the button becomes **Try again** |
| [X-4c](prototype/FINAL_screens.html#X-4c) | 15 · Bluetooth off | C-5; the line above; the button becomes **Turn on Bluetooth** |
| [X-1b](prototype/FINAL_screens.html#X-1b) | 16 · Only the light arrived | Home after Set the scene; message bar "Light sent · Sound unavailable" |
| [X-4d](prototype/FINAL_screens.html#X-4d) | 17 · Library scene view | L-12; the same line above Set the scene; the button becomes the fix |
| [X-4e](prototype/FINAL_screens.html#X-4e) | 18 · Remote, from scratch | R-3 in preview; no room above the button, so the Remote's top line says what happened; the button becomes **Try again** |

### 1.6 Not drawn in FINAL_screens

| ID | Screen / state | On screen | Where to see it (FINAL_prototype.html is the live prototype) |
|---|---|---|---|
| C-2 | First question, first time | C-1 plus the hint "Tap where you'd place yourself" | drawn as part of [C-1](prototype/FINAL_screens.html#C-1) (the first question shows the hint) |
| H-7 | Sleep well | From 22:00 with All off: "Sleep well"; the orb says "Check in again" (or "Tap to begin" if tonight's scene didn't come from a check-in) | written only (this table) |
| H-8 | Daytime | 07:00–17:00: last night's mood, faded, label "Last night" (a check-in made today before 17:00 shows "Today" instead, §4); the orb says "Check in for today" | written only (this table) |
| H-9 | Adjusted at | H-2 with the bottom row "Adjusted at [time]" (tonight's scene changed on the Remote without setting a new one) | written only (this table) |
| R-7 | Naming in place | R-7a–c (the name field + Done) | drawn as [R-7a](prototype/FINAL_screens.html#R-7a), [R-7b](prototype/FINAL_screens.html#R-7b), [R-7c](prototype/FINAL_screens.html#R-7c) (§1.4) |
| X-1 | Message bar | One at a time, bottom, in an empty slot (on Home, above the bottom row), 5 s: "Sent to your room · Undo", "Light sent · Sound unavailable", "Sound sent · Light unavailable", "Scene deleted · Undo", "Changes saved", "Renamed", "Saved" | drawn as [X-1a](prototype/FINAL_screens.html#X-1a), [X-1b](prototype/FINAL_screens.html#X-1b), [X-1c](prototype/FINAL_screens.html#X-1c); the others: FINAL_prototype (Set the scene, delete or edit a saved scene, Save as a scene) |
| X-2 | Connection line | Top right beside Me (48 px). Remote: always. Home and Library: only when something's wrong | drawn as [X-2a](prototype/FINAL_screens.html#X-2a) … [X-2l](prototype/FINAL_screens.html#X-2l) (§1.5) |
| X-3 | Part unavailable (Remote) | The part's controls give way to one row with Try again | drawn as [X-3a](prototype/FINAL_screens.html#X-3a), [X-3b](prototype/FINAL_screens.html#X-3b) (§1.5) |
| X-4 | Set the scene can't reach the lamp | One line right above the button; the button becomes the fix (on the Remote the top line carries it) | drawn as [X-4a](prototype/FINAL_screens.html#X-4a) … [X-4e](prototype/FINAL_screens.html#X-4e) (§1.5) |
| X-5 | Android's own dialogs | Nearby devices permission; turn on Bluetooth (not designed by us) | drawn as [X-5a](prototype/FINAL_screens.html#X-5a), [X-5b](prototype/FINAL_screens.html#X-5b) (§1.5) |

---

## 2. Navigation map

- **Tab bar:** Library · **Home** · Remote, Home in the middle. The app always opens on Home. No dot or status on the tabs.
- **Home** → Check in → C-1 … C-5 → Set the scene → H-2 · Not now → H-4.
- **Library** → a tile or row → L-12 (scene view) → × / Back → the tab it came from. Saved ⋯ → pen → L-4 → Sound › → L-13 (× / Back → L-4, old sound kept) · scent: the chips in the row.
- **Remote** → Light › / Sound › / Scent › → R-4 / R-5 / R-6 (‹ / Back → R-3). They slide in from the right and Back slides them out (MOTION.md §6); switching tabs is instant.
- **Empty-state buttons:** Go to Remote → Remote tab · Check in → Home's check-in.
- **Android Back:**
  - check-in card: the previous card; on the first card it leaves the check-in, progress saved (same as ×);
  - scene view, the Library's Sounds screen (L-13): close, nothing changed;
  - the year view (L-7): back to the month you were on;
  - Remote sub-screens: back to the Remote;
  - sheets, dialogs and name fields: close / cancel;
  - the Remote or Library tab: goes to Home; Home: leaves the app.
- **No tab bar on focused steps:** the check-in cards (C-1…C-3; C-4 is back on Home's layout), the scene view (L-12), the Library's Sounds screen (L-13). The tab bar **stays** on the Remote's Light, Sound and Scent screens (live controls inside the Remote tab).

---

## 3. Screen rules (every screen)

1. **Starting is explicit, adjusting is live.** Nothing reaches the hardware until **Set the scene** (a single tap). While a scene is running, every change on the Remote or its screens sends live (throttled; `DATA_AND_RULES.md`). **Exception:** choosing a track is applied by its tap, never streamed while browsing.
2. **Where problems show:**
   - one blocked control: a line right next to it;
   - an app-wide problem with a fix: the connection line (X-2), which stays until fixed;
   - **never a fading toast for a problem**.
3. **Message bars** (X-1) only for feedback on the person's own action, in an empty slot so they cover nothing (on Home: above the bottom row, never over it). 5 s everywhere. Undo only on "Sent to your room" and "Scene deleted", never on a half-sent message ("Light sent · Sound unavailable").
4. **One primary action per screen,** anchored at the bottom. Main actions are 52 px; buttons inside a row and the Remote's bottom row are 44 px.
5. **No readback.** The UI says what was sent, never what the hardware is doing.
6. **Names: one rule in every name field** (R-7, L-4, Library rename, scent rename):
   - 30 characters;
   - from 25, a grey count under the field: "27 of 30";
   - empty: Save / Done / ✓ disabled;
   - a taken name (a preset's or saved scene's name, ignoring case; for scents, another scent's name) shows "“Golden Hour” is taken · saves as “Golden Hour 2”" *(provisional)*, and Save saves the numbered name;
   - your own scene's current name is never taken.
7. **Long names:**
   - headlines (Home, result, scene view) wrap to 2 lines, then step down a size (34 → 28 → 24 sp on Home);
   - the Remote's scene name is the exception: one line ending in "…" (there's room for one line beside All);
   - rows and tiles truncate with "…" after one line;
   - emoji allowed.
8. **Text and layout:** every screen scrolls at 200% system text; the main button stays pinned. Portrait only. Times follow the phone's 12/24-hour setting.
9. **Remove animations** (Android) is honoured everywhere (each animation's still version is in `MOTION.md`).
10. **Time of day uses fixed times in v1:** bedtime 23:00, wake 07:00, evening reset 17:00 (bedtime − 6 h), "Sleep well" from 22:00 (bedtime − 1 h). Editable in v2.

---

## 4. Flows

Hardware branches are the same in every flow that sends (§4.0); each flow lists only what differs.

### 4.0 Standard hardware branches (when something is sent)

- **Light unavailable** (sound OK): the sound part is sent; message bar "Sound sent · Light unavailable" (no Undo); Remote: X-3 for Light, line "Partly connected"; Home / Library: "Light unavailable · Try again" beside Me.
- **Speaker unavailable** (light OK): message bar "Light sent · Sound unavailable" (no Undo); Remote: X-3 for Sound; Home / Library: "Sound unavailable · Try again".
- **Both unavailable / not connected yet:** the button shows "Setting the scene…" (busy: DESIGN_SYSTEM's busy rule) and the command waits; the first time, Android's Nearby devices prompt shows first. If it can't connect: X-4 (Try again / Turn on Bluetooth / Open settings).
- **Bluetooth off:** "Bluetooth is off · Turn on" → Android's prompt → Connecting… → the outcome.
- **Permission denied:** "Allow nearby devices · Open settings" (the app's page in Android settings).
- **Scent** is never sent and never listed in message bars.

### 4.1 First launch / Home before any check-in

```text
FLOW: First launch
Starting state: app installed, never opened; no data.
Steps:
  1. Open the app → Home H-1 (pearl orb, Check in). No connection attempt, no setup screens, nothing about the lamp on Home.
  2. Tap Check in → 4.2. Or tap Remote → Android's Nearby devices prompt (first time) → 4.13.
Branches: none (Home works without the lamp; the check-in needs nothing).
End state: H-1, or the check-in, or the Remote.
```

### 4.2 Check-in: start, answer, skip, leave, finish

```text
FLOW: Check-in
Starting state: H-1 (or H-5 Continue, or H-2 Check in again).
Steps:
  1. Tap Check in → C-1 (full screen, no tab bar, Me hidden). Check in again first returns Home to the pearl orb (the wash fades; the lamp keeps the current scene).
  2. Tap a point on the 1–10 scale → it's marked; Next → the next card; a progress circle fills.
  3. Skip → another question from the same category replaces it; the circle doesn't fill.
  4. Back / ‹ → the previous card.
  5. × → leaves; progress is kept → Home shows Continue (H-5); the current scene (if any) keeps playing.
  6. After the 5th answer → C-3: See my mood, or Keep going for a sharper read (more cards; See my mood stays on each).
  7. See my mood → C-4 Reading your answers (about 4 s) → C-5 Result.
Rules: rounds of 5, one question per category (energy, social, mental, emotional, purpose); nothing pre-selected; no total ever shown; progress saved for resume; an unfinished check-in is cleared the next time the app opens after the evening reset.
Branches: none (no hardware).
End state: C-5 Result, or H-5.
```

### 4.3 Result → Set the scene / Not now

```text
FLOW: Result
Starting state: C-5.
Steps:
  1. Set the scene → "Setting the scene…" (0.6 s, as in the scene view) → sends light + sound (the scene's sound plays with it) → Light bloom on the orb; the wash starts at 0.9 s; Home's controls (All, "Set at …") at 1.5 s; message bar "Sent to your room · Undo" at 3.0 s for 5 s → H-2.
  2. Undo (within 5 s) → everything returns (orb, wash); back to the result; the app re-sends what was on before (the previous scene), or turns everything off if nothing was on.
  3. Not now → H-4: the mood name, "Not set yet. You can set it any time.", Set the scene (sets it as in step 1).
Branches: §4.0 (states 13–16 are drawn on this screen).
End state: H-2 (set) or H-4 (not set).
Notes: a second check-in the same night replaces tonight's scene; Library → Check-ins keeps both. A check-in before wake time counts for the night before; after wake time, for the coming night.
```

### 4.4 Build a scene from scratch on the Remote

```text
FLOW: From scratch
Starting state: R-1 (nothing playing).
Steps:
  1. Any change (a colour dot, the Light switch, All, Choose a sound / scent) → R-2 "New scene". Everything is a local preview: the orb and dots change, nothing is sent.
  2. A colour (a dot or the Light screen) or switching Light on counts as a chosen light; Sound and Scent need one chosen each (Choose opens R-5 / R-6).
  3. All switches Light, Sound and Scent together in the preview.
  4. The player shows ▶ until Set the scene (nothing plays in a preview); a tap toggles it.
  5. When light, sound and scent are all chosen, the bottom button becomes Set the scene → sends the whole preview at once → the session is live (R-3) and the player shows ⏸. Home shows it (H-3).
Branches: §4.0; state 18 (no room above the button: the top line carries the message; the button becomes Try again).
End state: R-3, live; or R-2 if left without setting (kept as the last Remote values).
```

### 4.5 Adjust a running scene live

```text
FLOW: Live adjust
Starting state: R-3 (a scene is running, from any source).
Steps:
  1. Drag the brightness ring (5–100%; the value shows as % only while the finger is down) / the Cycle speed / volume → sends live: at most one write in flight, every ~150–250 ms, latest value wins, a final value on release.
  2. Tap one of the 4 dots (Cycle off) → that colour is held on the lamp (static); on the Light screen any of the 8 can be held; a held colour from 5–8 takes the Remote's 4th dot, ringed.
  3. Cycle on → the light and orb move through the scene's 8 colours; the 4 dots make way for the Slow–Fast speed slider (dots return with Cycle off).
  4. Light screen: the wheel or Colour range → a new palette, sent live (throttled).
  5. Undo / Redo (bottom) → one-tap changes step back / forward, each re-sent live; the history lasts for this visit to the Remote and is cleared when the scene is saved or a new scene is set.
Counts as an edit (Save appears): a different scent, a different track (picked or skipped), a new palette from the wheel, moving Colour range. Never counts: switches, All, brightness, volume, Cycle and its speed, choosing a dot, renaming a scent. Compare scents by ID, not by name: the prototype compares the displayed name, so a scent rename followed by another change can wrongly show Save.
Branches: link drops → 4.14; a part unavailable → X-3.
End state: R-3, with Save if edited.
```

### 4.6 Change track

```text
FLOW: Change track
Starting state: R-3 or R-5 (scene running).
Steps:
  1. ◀◀ / ▶▶ on the Remote → the previous / next track plays on the speaker at once; counts as an edit.
  2. R-5 (opens with the current track in the middle of the list): tap a track → it plays on the speaker at once and becomes the scene's track (playing bars move to it); counts as an edit.
Branches: speaker unavailable → the track is still chosen for the scene (data); it doesn't play; one line right above the player, "Sound unavailable · Try again"; no playing bars (drawn).
End state: R-3 / R-5 with the new track.
```

### 4.7 Toggle light / sound / scent; All

```text
FLOW: Part switches
Starting state: R-3 or H-2.
Steps:
  1. Light switch off → sends the lamp's off command (fully dark); the orb shows the pearl globe. On → the scene's light again.
  2. Sound switch off → pauses the speaker. On → resumes.
  3. Scent switch → UI only.
  4. All (Remote and Home are the same switch) off → light off, sound paused, scent off; Home's bottom row "Off"; the wash recedes. On → the whole last scene again; Home's line goes back to what it said ("Set at 22:10").
  5. Fast repeated taps: the last one wins.
Never counts as an edit.
Branches: §4.0 per part.
End state: the switches as set.
```

### 4.8 Apply a preset / saved scene / past check-in

```text
FLOW: Set from the Library
Starting state: L-1, L-2 or L-6.
Steps:
  1. Tap a tile, row or calendar orb → L-12 scene view (grows from the tapped orb, 620 ms). First time ever: "Swipe for the next one" (stored; never again).
  2. Swipe sideways or tap a neighbour's name → the next scene of the same tab (orb and names move together; backdrop cross-fades).
  3. Sound line → plays this scene's sound on the speaker; bars move; again → stops. Swiping switches the sound with the scene.
  4. Set the scene → "Setting the scene…" (0.6 s) → sends → Light bloom; the button goes at 1.5 s; the subheading gains the playing bars: "On now · Tonight · 21:42"; "Sent to your room · Undo" at 3.0 s for 5 s. The view stays open.
  4b. A check-in's view: Save as a scene → L-15 (the mood's name; numbered if taken) → Save → saved unchanged in Saved under "From check-ins" ("From a check-in · [date]"); message bar "Saved". Cancel / Back → nothing saved.
  4c. A saved scene's view: ⋯ → the view closes, Saved opens with that row's pen and trash (L-3; 4.10).
  5. × / Back → the tab; that scene shows On now (L-11); Home shows it (H-2); the Remote shows it as its saved version (no Save until its palette, track or scent changes).
Branches: §4.0; state 17 (one line above the button; the button becomes the fix).
End state: the scene running; L-11 marks it.
```

### 4.9 Save a scene

```text
FLOW: Save
Starting state: R-3 with Save showing: a light, a sound and a scent are chosen, and the scene was never saved or one of its own parts differs from its saved version (4.5).
Steps:
  1. A scene made from scratch → Save → R-7: the scene name becomes an underlined field with "My scene" (selected to type over; numbered if taken) → type → Done → saved in the Library under "Made by you"; Home's name updates.
  2. An edited preset or check-in mood → Save → a new scene; the original stays as it was; the field starts with "[name] 2" → Done → in Saved under **Based on presets** (a preset) or **From check-ins** (a check-in). That group never changes later.

  3. Your own saved scene, edited → Save → the field shows its current name → Done saves it in place (renamed if you typed a new name). There's no separate "save as new" on the Remote.
  4. Your own saved scenes show a small pencil after the name: tapping the name renames it (R-7).
  5. Changing the edited parts back to the saved values hides Save.
After saving: Save goes, the Undo / Redo history is cleared, and this is the scene's saved version.
Rules: §3.6 (names). Save stays, also after leaving the Remote and coming back, until saved or changed back.
Branches: none (saving is local).
End state: R-3 without Save; the scene in Library → Saved, in its group.
Prototype note: FINAL updates the Remote and Home on Save but doesn't add the row to the Library's Saved list (the Library shows sample rows). Build the row.
```

### 4.10 Edit, rename, delete a saved scene (Library)

```text
FLOW: Edit in the Library
Starting state: L-2.
Steps:
  1. ⋯ → L-3 (pen, trash in the row).
  2. Pen → L-4: name field (the keyboard opens only when tapped), Sound › → L-13, scent chips.
  3. L-13: opens on the current sound ("In this scene", tinted row); tap a track → it's selected ("Chosen"); ▶ plays a preview on the speaker ("Playing on the lamp"); search covers both categories, word starts, ignores accents; tabs dim while searching; Choose [track] (bottom) → back to L-4 with the new sound; × / Back → back, old sound kept, no prompt.
  4. Save → message bar "Changes saved" (sound or scent changed) or "Renamed" (only the name). Cancel → nothing changes.
  5. Trash → the row goes; "Scene deleted · Undo" brings it back. Deleting the scene that's playing: it keeps playing as an unsaved "New scene" (DATA_AND_RULES §3.4).
Rules: §3.6.
Branches: L-13 with the speaker unavailable → ▶ doesn't play; one line under that row, "Sound unavailable · Try again"; choosing still works.
End state: L-2 updated.
```

### 4.11 Scents: choose, rename, original name

```text
FLOW: Scents
Starting state: R-6.
Steps:
  1. Tap a scent → ticked; it's the scene's scent (an edit, if it differs from the saved one). UI only.
  2. ⋯ → Rename → the name becomes a field (§3.6, ✓ / ✕) → the new name shows on the Remote; the original stays as a second line underneath.
  3. ⋯ → Use original name → back to the original; the second line goes.
The four scents: Warm Apple Crumble · Malibu · Cosy Cottage · Vanilla and Caramel. Renaming never counts as an edit.
End state: R-6.
```

### 4.12 Browse check-ins

```text
FLOW: Check-ins
Starting state: L-6.
Steps:
  1. "[Month] ▾" → L-7 year view (oldest at the top, opens on the month you were on; every past month tappable, a month with none → L-10; future months dimmed) → a month → its calendar + list. Back → the month you were on.
  2. ‹ → the previous month (also months with none → L-10).
  3. Tap an orb or a row → L-12 with that month's check-ins as the swipe list. Two check-ins in one night: one orb (the latest); the list shows both under the night's heading, each with its time.
Empty: L-8 (no check-ins at all), L-9 (this month, before its first).
End state: L-6 / L-12.
```

### 4.13 Connection (first time, every time after, the fixes)

```text
FLOW: Connection
Starting state: any.
Steps:
  1. First time the Remote opens or Set the scene is tapped → Android's Nearby devices prompt → Allow → light and speaker connect in parallel ("Connecting…" on the Remote line only) → both → "Connected" (grey, not a button). The devices are saved.
  2. Every time after → the app reconnects by itself to the saved devices whenever it opens; Home stays quiet.
  3. Try again (any red line or button) → Connecting… → one of the outcomes.
Branches: one part → "Partly connected" + X-3; neither → "Can't connect · Try again" (also when the lamp is in use by another phone; confirm with the dev); Bluetooth off → "Bluetooth is off · Turn on"; permission denied or withdrawn → "Allow nearby devices · Open settings". Home and Library show a line only when something is wrong (states 9–12). Your settings stay in every case.
End state: connected, or a line with its fix.
```

### 4.14 The connection drops mid-use

```text
FLOW: Drop mid-use
Starting state: R-3, a scene running, connected.
Steps:
  1. The link drops → the Remote's line shows "Reconnecting…" at once (grey, no action); Home and Library say nothing; no toast.
  2. The controls keep working and keep their values; the latest values are sent when it's back.
  3. Back within ~5 s → "Connected". Not back → "Partly connected" (one part) or "Can't connect · Try again" (both).
Never a silent 12-second rescan.
End state: connected, or 4.13's branches.
```

### 4.15 App restart

```text
FLOW: Restart
Starting state: the app closed (the scene keeps running on the devices).
Steps:
  1. Open → always Home; reconnects by itself (4.13 step 2). Nothing is re-sent automatically: if the lamp lost power (it restarts lavender and can't report it in v1), the person sets a scene or toggles All.
  2. Restored: saved scenes, check-ins, the last scene + its Remote values (including unsaved edits, so Save still shows), the held colour, an unfinished check-in (Continue, until the next app open after the evening reset), the saved devices.
  3. Reset: the Remote's Undo / Redo history (it lasts one visit to the Remote).
End state: Home as it was (H-2 / H-5 / H-6 …).
```

### 4.16 Time of day on Home (written states)

```text
FLOW: Time of day
Starting state: Home.
Steps:
  1. 17:00 (evening reset) with no check-in since 07:00 → H-1 "How are you tonight?".
  2. A check-in before 17:00 → label "Today · [mood]"; after → "Tonight · [mood]".
  3. 07:00 → 17:00 → H-8: last night's mood, faded; the orb says "Check in for today". A check-in after 07:00 counts for the coming night (Home doesn't ask again at 17:00).
  4. From 22:00 with All off → H-7 "Sleep well".
  5. Tonight's scene changed on the Remote without setting a new one → H-9 "Adjusted at [time]".
  6. All off never reopens the check-in: Home keeps tonight's mood with Check in again; the bottom row says "Off".
End state: as above.
```

### 4.17 Sound previews (Library)

```text
FLOW: Previews
Starting state: L-12 (sound line) or L-13 (▶ on a row).
Steps:
  1. Tap → the track plays on the speaker (never on the phone, never automatically); L-13's row says "Playing on the lamp".
  2. Tap again / another track → stops / switches.
Branches: speaker unavailable → doesn't play; the line under the row (L-13).
End state: as before; nothing about the scene changes.
```

---

## 5. Not in v1 (do not build)

The later versions in START_HERE:
- Settings behind Me: editable bedtime and wake time, the evening reminder, "Play sound with scenes", Delete my data;
- onboarding and Finish your profile, and with them the name in greetings;
- in-app setup and the System sheet;
- trusted phones and multiple devices;
- the device storing the last scene, the on/off state report, the sleep timer;
- Recently set;
- a multi-lamp (group) UI;
- the "ESP connected by touch" pairing idea;
- the Spotify version;
- scent hardware.

---

## 6. Developer tasks (do not guess)

1. **Reconnect timeout (for the developer to decide):** designed as ~5 s before "Reconnecting…" falls through to "Partly connected" / "Can't connect". Set it to what BLE allows and note the value.
2. **The track list (for the developer):** unknown; it exists only on the speaker's SD card. Every track name on L-13 and R-5 is a placeholder; read the card and name each track (DATA_AND_RULES §6, CONTENT §9).

Settled: the greeting is "How are you tonight?" (no name); the Me button is a plain person icon; Undo after Set the scene re-sends the previous state (4.3); nothing is re-sent after a lamp power cut (4.15); check-in history is kept indefinitely.
