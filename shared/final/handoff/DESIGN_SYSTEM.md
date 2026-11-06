---
name: Wellness Lamp
description: The phone glows like the room.
tokens: design-system/tokens.json
---

# Design System: Wellness Lamp

**What this is:** the visual system for v1, for the coding agent building it in React Native. Every value lives once, in [`design-system/tokens.json`](design-system/tokens.json); this file explains when and how to use each one, and specifies every component. The look is the one in `prototype/FINAL_screens.html` (the tokens are applied to it, so the two agree).
**Status:** the component decisions are folded in, and FINAL draws them (with the fixes, the polish and the spacing snaps). Made from FINAL's computed styles in all its screens, then normalised to the tokens.
**Build it responsive.** FINAL is drawn on a 360 × 800 dp phone with fixed positions; those positions are a reference, not a spec. Build every screen with flex layout from the rules in **Layout**, never with absolute coordinates copied from the HTML.

## Overview

**Creative North Star: "The phone glows like the room."** Tonight's mood is a lit globe of its own colours; once the scene is set, those colours spill onto Home, so the screen and the walls change together.

The world is **long exposure**: light photographed at night, on a light-cream ground with a fine static grain. **All saturation lives in light**: the Globe orb (the palette blended through saturated midpoints, an iridescent rim, a halo whose colour turns around its sides), the colour dots, and Home's wash. Everything you read or operate is ink on cream: Source Serif 4 for the human lines (names, titles, "Set at"), Hanken Grotesk for everything you operate. Standard Android controls (pills, switches, sliders, the navigation bar), drawn in ink, with no cards around the moments.

It should feel calm, settled and understood: **soft, grounded, honest**. It must never look like an AI wellness template (a peach-lavender glass gradient everywhere, a stock mesh orb), a clinical mental-health app, or a meditation cliché.

**Key characteristics:**
- one dominant element per screen (usually the orb), the rest quiet;
- colour only in the light (orb, dots, wash, the switches' scene shade); text and controls always ink;
- one primary action per screen, at the bottom, within thumb reach;
- flat surfaces; depth comes from the light, not from shadows;
- light mode only, soft and low-glare for the evening.

## Colors

The palette is a warm cream ground, near-black warm ink, and a few warm greys. The scene supplies every other colour.

### Primary
- **Charcoal** (`charcoal`): the filled button (one per screen), selected chips, the slider knob, the outline button's border.

### Neutral
- **Cream ground** (`ground`): every screen's background; also the text on charcoal.
- **Ink** (`ink`): main text, icons, the slider's filled part. 15.3:1 on cream.
- **Muted ink** (`text-muted`): secondary text everywhere, Undo / Redo and the pencil, the off switch's ring and thumb. 6.2:1.
- **Strong muted ink** (`text-muted-strong`): only Home's "Tonight" label and the scene's line, which sit over the moving wash. 8.7:1.
- **Disabled** (`text-disabled`): the label or icon of anything disabled (buttons, Undo / Redo, the month arrows, the scent rename ✓). 2.5:1 (disabled text is exempt from contrast rules).
- **Surface** (`surface`): the Cycle key, the search field, round buttons, a disabled filled button, and the **selected or playing row** (a warm tint, not a grey one).
- **Strong surface** (`surface-strong`): the Me button's circle (every tab), the Cycle key while cycling.
- **Outline** (`outline`): the slider's unfilled track, the naming sheet's field border, the Cycle key's edge line while cycling. Deliberately faint (1.9:1); the dark fill and knob carry the slider.
- **Faint outline** (`outline-faint`): the brightness ring's ticks, chip borders (decorative: the chip's text carries it), a disabled outline button's border.
- **Pressed** (`pressed`): ink at 6%, laid over any control while it's pressed.
- **Scrim** (`scrim`): ink at 34%, behind the naming sheet.
- **Busy** (`busy`): ink at 8%, the fill of a button that has started something and is waiting ("Setting the scene…"); its label stays `ink`.
- **Dimmed** (`opacity.dimmed`, 0.45): for things you can't act on right now (the category tabs while searching, future months) and for a part's controls while that part is switched off. Never dim a control that works on its own terms: **Choose** stays full `ink`.

### Status
- **Problem** (`problem`): a connection problem and its fix ("Can't connect · Try again"). 6.3:1. The only non-ink text colour.

### Scene colours (rules, not tokens)
- Each scene has **8 colours** (DATA_AND_RULES §3.6). They drive the orb, the dots, the wash and the switches.
- **A switch that's on** takes the scene's first colour, darkened (hue and saturation kept, lightness lowered) until it clears 3:1 on cream: the **switch colour**. It changes when the scene changes, on Home and the Remote alike. Before any scene: the pearl colours, darkened the same way.
- **The pearl palette** (8 soft colours) stands for "nothing set yet".
- **Component-local values** (one component each, not tokens; they are functional, not palette): the check-in's answer line #857d73; the On-now ring #9a9186, 2 px; a date on a calendar orb, white; the colour wheel knob's white ring; the colour dots' hairline (ink at 16%); text selection (ink at 16%).

**The Light Is the Hero Rule.** Saturated colour appears only in light: the orb, its halo, the dots, the wash and the switches' scene shade. Never in text, icons, buttons or backgrounds.

**The One Problem Colour Rule.** `problem` is used only for something that's wrong and its fix. Nothing decorative is ever red.

## Typography

**Display / title font:** Source Serif 4, 400 (fallback serif)
**Interface font:** Hanken Grotesk, 400 / 500 / 600 (fallback sans-serif)

**Character:** a quiet book serif for the human lines (a mood's name reads like a title, not a label) and a plain, friendly grotesk for everything you touch. Both are bundled with the app (Open Font License); the app never falls back to Roboto.

### Hierarchy

14 roles; sizes in **sp** (they follow Android's font size setting); line height = size × ratio (in React Native: `lineHeight: Math.round(size * ratio)`).

| Role | Font | Size / line | Where |
|---|---|---|---|
| `display` | Serif 400 | 34 / 36 | Home's title and the result's mood name |
| `headline` | Serif 400 | 28 / 32 | page and screen titles (Library, Remote, Sound, Light, Scent); the scene view's current name |
| `title` | Serif 400 | 24 / 30 | the Remote's scene name, the current heading tab, the naming sheet's title |
| `title-small` | Serif 400 | 20 / 26 | year headings, empty-state lines |
| `tab` | Serif 400 | 16 / 20 | the other heading tabs, "Set at 22:10", month names |
| `body` | Sans 400 | 16 / 24 | Home's line under the title, name fields |
| `body-strong` | Sans 500 | 16 / 20 | names in rows, **every button label**, switch labels, All, values |
| `heading` | Sans 600 | 16 / 20 | card headings (Light › Sound › Scent ›), the now-playing name |
| `small` | Sans 400 | 14 / 20 | second lines in rows, sound and scent lines |
| `small-strong` | Sans 500 | 14 / 20 | category labels (Ambient), Cycle, Undo |
| `caption` | Sans 400 or 500 | 13 / 18 | dates, hints, small labels |
| `caption-strong` | Sans 600 | 13 / 18 | group headings (Made by you …), field headings |
| `status` | Sans 600 | 12 / 16 | the connection line and its fix |
| `micro` | Sans 500 | 12 / 16 | calendar dates and weekday letters, year-view days |

**The Long Name Rule.** A headline never clips. A name in `display` wraps to 2 lines, then steps down to `headline`, then `title`; at 200% text it may take a 3rd line and the screen scrolls. Measure with `onTextLayout` before showing it, so it never jumps. The one exception is the Remote's scene name: one line ending in "…" (`RemoteSceneLine`). Rows and tiles truncate with "…" after one line. *(SCREENS_AND_FLOWS §3.7)*

**The One Button Voice Rule.** Every button label, filled, outlined or text, is `body-strong`. Weight and size never vary by button.

## Layout

FINAL is a 360 × 800 dp reference. The app runs on any Android phone in **portrait** (320–480 dp wide is the main range) and must stay correct at **200% text**. The rules below say how each screen is built; the components say how each part sizes itself. FINAL fixes positions, so the numbers are taken from it at 360 dp; the rules are what to build.

### The frame
- **Edge to edge** with Android's insets (`react-native-safe-area-context`): content clears the status bar at the top and the gesture bar / navigation at the bottom. FINAL draws a fake 28 dp status bar; on a device, every top bar (page header, check-in, scene view, Sounds screen, sub-screens) sits **8 below the real top inset**.
- **Side margin:** `space.screen-margin` (24 dp); 16 dp on screens narrower than 360 dp. Content fills the width between the margins.
- **Widest content column:** `size.content-max` (480 dp), centred, on wide phones, foldables and tablets; the ground and the wash still fill the whole screen.
- **Tab bar:** fixed at the bottom, above the gesture inset; hidden on focused steps (the check-in, the scene view, the Library's Sounds screen).

### Zones (every screen)
Each screen is a vertical stack of zones; nothing is positioned by absolute coordinates except the layers behind or over everything (the wash, the orb's glow, the message bar, the naming sheet).

1. **Header** (48 dp row): the page title on the left, the connection line and Me on the right; or ×/‹ and a title on focused screens.
2. **Hero**: the orb (Home, the result, the scene view) or the brightness ring (the Remote). It takes the free height; it's the first thing to shrink on short screens.
3. **Content**: the lines, cards, rows or lists, in reading order, with gaps from the spacing scale.
4. **Action**: the one primary button or Home's bottom row, anchored to the bottom of the screen (above the tab bar), never floating mid-screen.

### Sizes that scale
- **The orb** is 176 dp at 360 dp wide: **49% of the screen width**, kept between 152 and 216 dp. Its glow (drawn in Skia) is about 2.4 × the orb and may run off the screen's edges. The Remote's ring box (176 dp) scales the same way.
- **The orb's place** (Home, the result and the scene view alike): centred in the hero zone. The hero zone is the same box in every Home state and in the scene view (work it out once per screen size, never per state), so the orb never moves between states. At 360 × 800 its centre lands 352 dp from the top (44% of the height): use that only to check the build against FINAL.
- **On short screens** (under about 720 dp tall after the insets) the hero shrinks first, down to its minimum; then the content zone scrolls. The action zone stays visible.
- **Lists scroll** (the Library, the Sounds screen, the track list); group headings stay pinned while their group scrolls.
- **The preset grid** has 2 columns on phones, 1 column when the font scale is 1.5 or more (200% text), and 3 when the content width is 600 dp or more.

### Spacing
- The scale: `space` 2 · 4 · 8 · 12 · 16 · 24 · 32. Use the **gap** between siblings rather than margins on children.
- **Rhythm:** tight inside a group (4–8: a name and its second line, a label and its switch), generous between groups (24–32: the orb and its line, one card and the next).

### At 200% text
- Every screen can scroll; the action zone stays at the bottom of the scroll, never over content.
- Buttons and rows grow in height to fit; nothing clips. Rows let the second line wrap to 2 lines.
- The tab bar keeps its icons (no labels to grow).

## Elevation & Depth

**Flat by default.** Surfaces don't cast shadows; depth comes from the light (the orb's glow and halo, the wash) and from tonal steps (`surface`, `surface-strong`).

- **The scrim** (`scrim`) dims the screen behind the naming sheet.
- **One floating button:** the Library Sounds screen's "Choose [track]" floats over the list with a soft shadow (FINAL: 0 8 20 −10, ink at 45%; in React Native, `boxShadow` on the New Architecture, or Android `elevation` 4 with the ink shadow colour).
- **Rings are not shadows:** the held dot's ring (a 2 dp cream gap, then a 1.5 dp ink ring) and the dots' faint outline (1 dp, ink at 16%) are borders on a wrapper view.
- **The grain:** a fine, static noise over the ground (multiply, 40%) that softens gradients and stops banding. Build it as a static tiled image: `design-system/grain.png` is FINAL's tile (160 x 160 dp, at 2x, transparent), repeated; never animate it.

**The No Grey Shadow Rule.** Nothing gets a grey drop shadow, the orb least of all: its depth is its own light.

## Shapes

Soft and round: pills, circles and gently rounded rows; never sharp corners, never one-off radii.

| Token | Value | Used for |
|---|---|---|
| `radius.full` | half the height | dots, orbs, round buttons, switches, pills, chips, the Cycle key, the search field |
| `radius.bar` | 2 | slider tracks and fills, progress |
| `radius.row` | 12 | rows (tracks, sounds), name fields, the naming sheet's field, the message bar, the year view's month tiles |
| `radius.sheet` | 28, top corners | the naming sheet |

**The Half-Height Rule.** Anything pill-shaped or round uses `radius.full` (half its own height), so it stays round at any size and at 200% text. Never hard-code 18, 20 or 22.

Borders are 1 dp (outline button: `charcoal`; chip: `outline-faint`; field: `outline`). Icons: one line-icon set, 1.4–1.6 dp strokes in `ink` or `text-muted`, 16–24 dp. Every icon the app draws is in `design-system/icons/` (one SVG each, taken from the prototype, colours as `currentColor`); `icons.json` there and the gallery's *Icons* section give each one's size and where it is used. Draw them with `react-native-svg` (already installed: `SvgXml` with the file's markup and `color` set, or its paths as `Path`s) or a Skia `Path`.

## Components

Each component is one block: where it is used, its parts, sizes, type and colour (tokens only), states, what FINAL does *not* have (do not invent it), how it adapts, how to build it in React Native, and its behaviour (with the SCREENS_AND_FLOWS flow).

**Where a spec comes from.** The sizes were measured from FINAL (a computed-style capture of its 58 phones at the time) and read from FINAL's code. A few states were then drawn in no phone and were specified from the code: L-15, L-10, C-3 to C-5, H-4 to H-6, the message bar on Home, and the Remote's bottom-group Save, Cycling, the speed slider, scent rename and the ring's drag value. They are now drawn as well, from the same code (FINAL_screens now has 72 phones: C-3, C-4, C-5, H-4, H-5, H-6, X-1c, L-10, L-15, R-2, R-3b, R-3c, R-3d, R-6b). Only H-7, H-8 and H-9 remain written (SCREENS_AND_FLOWS §1.6).

**Rules every component follows** (not repeated in each block):
- **Pressed:** one shared `Pressable` wrapper lays `pressed` (ink at 6%) over every tappable while it's held, following its corner. Nothing per component. A few controls also have their own pressed look on top (named in their blocks: the play / pause fill, the Set the scene shrink).
- **Disabled (buttons):** the label or icon turns `text-disabled`; a filled pill's fill becomes `surface` (its border too); an outline pill's border becomes `outline-faint`; a text or icon button changes only its colour. No opacity. Not pressable. This covers Next before an answer, "Pick light, sound, scent", every disabled Save / Done / ✓, Undo / Redo with nothing to undo, and the month arrows at either end. Switches are not buttons: they follow `ToggleSwitch`.
- **Busy (buttons):** a button that has started something and is waiting is busy, not disabled (the disabled grey washed out on the wash). "Setting the scene…" on every tab: fill `busy`, no border, label `ink`. Not pressable; `accessibilityState={{ busy: true }}` (FINAL marks it `aria-busy="true"`).
- **Dimmed:** `opacity.dimmed` (0.45), see Colors.

### Shared, Home and check-in

Scope: every component shared by the three tabs (page header, Me, connection line, tab bar, buttons, switches, message bar, part-unavailable line, name field) and every component drawn on Home, the check-in and its result (H-1 to H-10, C-1 to C-5, X-1, X-2, X-3, X-4a to X-4c), measured from FINAL and read from its Home, Remote and Library code, in approved tokens only, for bare React Native 0.85 (TypeScript; Skia only for the orb and the wash).

| Component | RN name | Screens |
|---|---|---|
| Page header | `PageHeader` | every tab screen: H-1 to H-10, C-4, C-5, L-1 to L-11, R-1 to R-3, R-7, X-1, X-2, X-3, X-4a to X-4c |
| Me button | `MeButton` | as `PageHeader` (H-10 shows it alone) |
| Connection line | `ConnectionLine` | X-2a to X-2l, X-1a, X-1b, X-3a, X-3b, X-4e; Remote always |
| Tab bar | `TabBar` | every tab screen (not C-1 to C-3, L-12, L-13) |
| Pill button | `PillButton` | H-1 to H-3, H-4, H-5, C-1, C-3, C-5, X-4a to X-4c; L-4, L-5, L-8, L-9, L-12, L-15; R-2, R-3, X-4e |
| Text link button | `TextLinkButton` | C-1, C-3 (Skip, Keep going for a sharper read); R-1, R-2 (Choose) |
| Round icon button | `RoundIconButton` | R-1, R-3, R-5, R-5b, R-5c (play / pause) |
| Bare icon button | `IconButton` | C-1 (×, ‹); L-12 (×, ⋯); R-1 to R-6 (◀◀ ▶▶, ‹ Back, Undo, Redo) |
| Switch | `ToggleSwitch` | H-2, H-2b, H-3, H-6 (Home's All); R-1 to R-3, R-7*, X-2*, X-3*, X-4e (Remote's All and part switches) |
| Message bar | `MessageBar` | X-1 (X-1a, X-1b, X-1c; drawn on L-11) |
| Part-unavailable line | `PartUnavailableLine` | X-3a, X-3b (card size); R-5c, L-13g (list size) |
| Playing bars | `PlayingBars` | R-5, R-5b, L-6, L-11, L-12 |
| Name field | `SceneNameField` | R-7a, R-7b, R-7c (L-4, L-4b, L-15 use the Library's fields) |
| Home layout and orb slot | `HomeStage` | H-1 to H-9, C-4, C-5, X-1, X-2f, X-2i to X-2k, X-4a to X-4c |
| Home headline | `HomeHeadline` | H-1 to H-5, C-4, C-5, X-1, X-2, X-4 |
| Sound and scent lines | `HomeSceneDetails` | C-5, X-4a to X-4c |
| Home main button | `HomeMainButton` | H-1, H-2, H-2b, H-3, H-4, H-5, X-2f, X-2i to X-2k |
| Home bottom row | `HomeBottomRow` | H-2, H-2b, H-3, H-6, H-9 (written), X-2f, X-2i to X-2k |
| Check-in screen | `CheckInScreen` | C-1, C-2, C-3 |
| Check-in top bar | `CheckInTopBar` | C-1, C-2, C-3 |
| Progress circles | `CheckInProgress` | C-1, C-2, C-3 (first round only) |
| Question | `CheckInQuestion` | C-1, C-2, C-3 |
| Answer scale | `AnswerScale` | C-1, C-2, C-3 |
| Check-in actions | `CheckInActions` | C-1, C-2, C-3 |
| Result actions | `ResultActions` | C-5, X-1a, X-1b, X-4a to X-4c |

Not covered here (documented in their own sections): the Library's heading tabs, tiles, rows, chips, Sounds screen, calendar, year view, scene view and naming sheet; the Library empty states L-5, L-8, L-9 (`LibraryEmptyState`, already specified, built with this section's outline `PillButton`); the Remote's cards, colour dots, Cycle, sliders, player, Light / Sound / Scent screens and its sub-screen header (‹ Back · title · scene name); the orb, the Light bloom, the crochet wash and the check-in's colour development (MOTION.md). Android draws the status bar, the gesture bar and its Nearby devices and Bluetooth dialogs (X-5a, X-5b, the dialog in X-4a): not components.

**Reading the values.** FINAL's one-off paddings and gaps are snapped to the spacing scale, and FINAL draws the snapped values. A plain number in brackets is the value before the snap, kept so the change can be traced: build the number outside the brackets. Widths are flex rules; the 360 x 800 dp phone is the reference only. Type is given as a role, colours as tokens. "Component-local" marks a value that is not a token and belongs to that component only. Vertical places are given from the top safe-area inset: FINAL draws a 28 dp status bar, so FINAL's y 34 is "6 below the inset", which snaps to 8.

**Focus (keyboard / D-pad)**, on every button: a 2 dp `ink` ring 2 dp outside the control's edge, following its corner (FINAL `:focus-visible`). RN: track `onFocus` / `onBlur` on the `Pressable` and draw the ring as an absolutely positioned `View` (borderWidth 2, the control's corner plus 4, inset -4), or use RN's `outline*` style props (New Architecture). Pressed and disabled: see the rules at the top of Components.

---

#### Page header (`PageHeader`)  {#c-page-header}
- **Used in:** every tab screen: Home (H-1 to H-10, C-4, C-5, X-1, X-2f, X-2i to X-2k, X-4a to X-4c), Library (L-1 to L-11, X-2l), Remote (R-1 to R-3, R-7, X-2a to X-2h, X-3a, X-3b, X-4e). Not on the check-in cards (C-1 to C-3), the scene view (L-12), the Sounds screen (L-13: it has its own header) or the Remote's Light, Sound and Scent screens (their own ‹ Back header, Remote section).
- **Anatomy:** one row: (1) the start slot: the page title "Library" / "Remote", or on Home the date in two lines ("Thursday," / "22 October"); (2) a flexible gap; (3) `ConnectionLine` (only when it has something to say); (4) `MeButton`.
- **Size and spacing:** row stretches to the screen width, min-height 48, 8 below the top inset (FINAL y 34), padding left 24, right 12 (so Me's circle ends 20 from the edge), alignItems 'center'. The connection line ends 4 before Me (gap 4). What comes under the header: Home's label 12 below the row (`HomeHeadline`), the Library's heading tabs 12 below (10), the Remote's scene line (Remote section).
- **Type and colour:** page title `headline` `ink` (FINAL 30, now 28); Home's date `tab` `ink`, two lines (FINAL 15 / 18.75); background: none (the screen's `ground` or the wash shows through).
- **Variants and states:** *page title* (Library, Remote); *date* (Home, every Home state including the result); *with connection line* (Remote always; Home and Library only when something is wrong); *without*.
- **Not in FINAL:** a pressed or tappable title, a scroll-under state (FINAL's header does not scroll; there is no divider or elevation).
- **Responsive:** the start slot is `flex: 1` with `minWidth: 0`; the page title stays on one line (it is a short word); Home's date wraps as given. The connection line hugs up to 184 and wraps to two lines before it pushes the title. At 200% text the row grows taller (48 is a minimum); if the title and a long connection line cannot share the row, the connection line wraps under itself (two lines, end-aligned) and the title keeps its line.
- **Build (React Native):** `View` (flexDirection 'row', alignItems 'center'), title `Text` `numberOfLines={1}`; Home's date `Text` (two `Text` lines or one with `\n`). Respect `useSafeAreaInsets().top` (edge-to-edge: the app draws under the status bar).
- **Behaviour:** static; its parts carry their own behaviour (§2 Navigation map; flows 4.13, 4.14).

#### Me button (`MeButton`)  {#c-me-button}
- **Used in:** H-10 (alone), and in `PageHeader` on every tab screen; hidden during the check-in cards (C-1 to C-3).
- **Anatomy:** a 48 x 48 touch area with a 32 dp circle; inside it a plain person icon (head circle and shoulders, stroke 1.6), no name, no initial.
- **Size and spacing:** fixed 48 x 48; circle 32, corner `full`, centred; icon 18. Sits 12 from the screen's right edge.
- **Type and colour:** circle `surface-strong` on every tab; icon `ink` (stroke).
- **Variants and states:** *default* only. v1 opens nothing.
- **Not in FINAL:** disabled, a photo or initial, a badge.
- **Responsive:** fixed at every screen width and text size.
- **Build (React Native):** a plain `View` 48 x 48 containing a `View` (32, borderRadius 16) and the icon as an SVG path (react-native-svg). Not pressable in v1 (no `onPress`, no pressed look).
- **Behaviour:** none in v1 (SCREENS §1.1 H-10; §5 Settings behind Me are v2).

#### Connection line (`ConnectionLine`)  {#c-connection-line}
- **Used in:** Remote: always (X-2a Connecting…, X-2b Connected, X-2c, X-2d, X-2e, X-2g Reconnecting…, X-2h, X-3a / X-3b Partly connected, X-4e). Home and Library: only when something is wrong (X-2f, X-2j, X-2k, X-2l, X-1a, X-1b). Home shows nothing in X-2i. Not on the Library's Sounds screen: there the line under the tapped row says it (L-13g).
- **Anatomy:** one line beside Me: the message; for a problem, then a separating dot and the fix ("Can't connect · Try again"). On two lines the dot goes and the fix moves under the message.
- **Size and spacing:** hugs its text up to 184 wide, min-height 48, padding 0 4, items aligned to the end, text right-aligned, gap 4 either side of the dot (5). Two lines (X-2c, "Allow nearby devices" / "Open settings"): column, end-aligned, centred in the 48 height, no gap between the lines. A problem line is tappable as a whole.
- **Type and colour:** `status` throughout. *Info:* `text-muted`. *Problem:* message, dot and fix all `problem`; the dot at 70% opacity (component-local).
- **Variants and states:**
  - *Info, not a button* (Remote only): "Connecting…", "Connected", "Partly connected", "Reconnecting…".
  - *Problem, the whole line is the button:* "Can't connect · Try again" (also a lamp in use by another phone), "Bluetooth is off · Turn on", "Allow nearby devices · Open settings" (every tab); "Sound unavailable · Try again", "Light unavailable · Try again" (Home and Library; the Remote says "Partly connected" and shows `PartUnavailableLine` in the card instead).
  - *One line* (default) and *two lines* (when the fix would wrap: the dot is hidden and the line stacks).
  - *Hidden:* Home and Library when all is fine; during the check-in and in the Library's full-screen scene view (it keeps its place, invisible); while a Set the scene problem line shows above the button (X-4b, X-4c, X-4d: the line above the button says it instead).
- **Not in FINAL:** a loading look while Try again reconnects (the line simply changes to "Connecting…" on the Remote; on Home and Library it stays until the outcome), an icon.
- **Responsive:** hugs; max-width 184 at the reference (about half the width left of Me: use `maxWidth: '51%'` of the header, or 184, whichever is smaller); wraps to two lines, never truncates. At 200% text it may take three lines; the header row grows.
- **Build (React Native):** info: `View` + `Text`, not pressable. Problem: `Pressable` containing `Text`s; decide one or two lines with `onTextLayout` (if the fix's line index > the message's, render the stacked form without the dot). The fixes: Try again → reconnect; Turn on → Android's Bluetooth enable request (`BluetoothAdapter.ACTION_REQUEST_ENABLE` via the BLE library); Open settings → `Linking.openSettings()`.
- **Behaviour:** shows the app-wide connection state and its fix, stays until fixed, never a toast (SCREENS §3.2; flows 4.0, 4.13, 4.14).

#### Tab bar (`TabBar`)  {#c-tab-bar}
- **Used in:** every tab screen. Not on the check-in cards (C-1 to C-3), the scene view (L-12) or the Library's Sounds screen (L-13); it stays on the Remote's Light, Sound and Scent screens.
- **Anatomy:** three icon-only items in a row: Library · Home · Remote (Home in the middle). Each item: the icon in a 56 x 40 box, then an empty 5 dp spacer. No text labels.
- **Size and spacing:** bar 80 tall, anchored directly above the bottom inset (FINAL: 704 to 784, the gesture area below it); content inset 72 from each side, three equal columns (`flex: 1`; 72 each at the reference). Item: min-height 64, content centred; icon box 56 x 40 (icon 24, padding 8 16 (6 16)); then 4 below (5) the 5 x 5 spacer. The whole item is tappable (72 x 64 at the reference).
- **Type and colour:** icons stroke 1.5; current tab `ink`, the other two `text-muted`. No fills.
- **Variants and states:** *current* (`ink`) and *not current* (`text-muted`). The colour change is the only current-tab indicator (no pill behind the icon).
- **Not in FINAL:** an indicator pill, a current-tab dot, text labels, a badge or status on the tabs (SCREENS §2: none by design).
- **Responsive:** the bar stretches; the three columns share the width inside the 72 insets; icons stay 24. At 200% text nothing changes (no text). Wider screens give wider items, the icons stay centred.
- **Build (React Native):** a custom `tabBar` for `@react-navigation/bottom-tabs` (or a plain `View` row): each item a `Pressable`. Icons: `tab-library`, `tab-home` and `tab-remote` in `design-system/icons/`. Keep the spacer as an empty 5 dp `View` so the icon sits where FINAL puts it, or offset the icon box up by 4.
- **Behaviour:** tap switches tab; the app opens on Home; Android Back on Library or Remote goes to Home (§2 Navigation map).

#### Pill button (`PillButton`)  {#c-pill-button}
- **Used in:** *filled:* Next (C-1), See my mood (C-3), Set the scene (C-5, X-4a to X-4c), Save (L-4, L-15), Set the scene (L-12), Save / Set the scene (R-2, R-3, X-4e). *Outline:* Check in / Check in again / Continue (H-1, H-2, H-2b, H-3, H-5), Set the scene on H-4, Next on later check-in cards, Go to Remote / Check in (L-5, L-8, L-9). *Text:* Not now (C-5), Cancel (L-4, L-15).
- **Anatomy:** a pill with one text label (FINAL has no icon pills on Home or the check-in).
- **Size and spacing:** three heights. *Main* 52 (a screen's main action): hugs with padding 0 24 (Check in, Next: padding 0 32), or stretches between the 24 screen margins (Set the scene, See my mood). *Row* 44 (buttons inside a row and the Remote's bottom group): padding 0 16 (Library 18) or 0 24 (Remote 20). *Text* 48: hugs, padding 0 24, no fill (Not now). Corner `full`; outline border 1 dp.
- **Type and colour:** every label `body-strong`. Filled: `ground` on `charcoal`. Outline: `ink` text, `charcoal` border, no fill. Text: `ink`, no fill.
- **Variants and states:**
  - *Filled, outline, text* (above).
  - *Disabled:* the one disabled rule (top of Components): label `text-disabled`; filled → `surface` fill and border; outline → `outline-faint` border; text → label colour only. Used by Next before an answer (C-1), "Pick light, sound, scent" (R-2) and an empty-name Save (L-4, L-15).
  - *Busy:* "Setting the scene…" (X-4a, L-12, the Remote's bottom group): the busy rule (top of Components): fill `busy`, label `ink`.
  - *Pressed:* the shared `pressed` overlay; Set the scene also shrinks to 0.97 while held ("set press", MOTION.md).
  - *Label changes in place* (Set the scene → Setting the scene… → Try again / Turn on Bluetooth / Open settings): see `ResultActions`.
- **Not in FINAL:** a loading spinner, an icon, an error colour.
- **Responsive:** hugging pills stay one line and centred; stretching pills follow the margins. Labels never wrap; a long one ("Keep going…" is a text link, not a pill) ends in "…" inside a stretching pill (`numberOfLines={1}`). At 200% text the height grows (52 / 44 are minimums).
- **Build (React Native):** `Pressable` + `Text`; `disabled` prop with the disabled colours (no opacity). Pressed scale: Reanimated `withTiming` on `transform: [{ scale }]` from `onPressIn` / `onPressOut` (MOTION.md). Border 1 dp: `borderWidth: 1` (FINAL's 0.5556 px is device snapping).
- **Behaviour:** each use is in its own block and flow (4.2, 4.3, 4.4, 4.8, 4.9, 4.10).

#### Text link button (`TextLinkButton`)  {#c-text-link-button}
- **Used in:** C-1, C-2, C-3 (Skip; Keep going for a sharper read); R-1, R-2 (Choose, after "No sound yet" / "No scent yet").
- **Anatomy:** text only, no fill, no border; Choose is underlined.
- **Size and spacing:** *Skip:* min-height 48, padding 0 16, hugs. *Keep going for a sharper read:* 48 tall, stretches between 24 margins, label centred. *Choose:* min-height 32, no padding, hugs, underline 3 below the text.
- **Type and colour:** all `body-strong` `ink` (the one button voice).
- **Variants and states:** *default*. Choose is never dimmed, even while its part is off (R-1): it's how you start.
- **Not in FINAL:** disabled, focus beyond the shared ring.
- **Responsive:** Skip and Choose hug; Keep going stretches and wraps onto two lines at 200% text (never truncates).
- **Build (React Native):** `Pressable` + `Text`; Choose `textDecorationLine: 'underline'` (Android draws its own offset and thickness).
- **Behaviour:** Skip → another question from the same category, the circle does not fill (4.2 step 3); Keep going → more cards (4.2 step 6); Choose → R-5 / R-6 (4.4 step 2).

#### Round icon button (`RoundIconButton`)  {#c-round-icon-button}
- **Used in:** R-1, R-2, R-3 (the player's play / pause, 48), R-5, R-5b, R-5c (52). The Library's track-row play button is its own (Library section).
- **Anatomy:** a filled circle with one icon (▶ or ⏸).
- **Size and spacing:** 48 x 48 (Remote card) or 52 x 52 (Sound screen player), corner `full`, icon 20 to 22, centred.
- **Type and colour:** fill `surface`; icon `ink`.
- **Variants and states:** *play* / *pause* (icon swaps); *pressed:* fill `surface-strong` (FINAL `.ck:active`; its 0.2 s fill change is a transition: MOTION.md).
- **Not in FINAL:** disabled (in a preview the player shows ▶ and a tap only toggles it), loading.
- **Responsive:** fixed size.
- **Build (React Native):** `Pressable` with `style={({ pressed }) => …}`; icon SVG.
- **Behaviour:** plays / pauses the speaker; in a preview it only toggles the icon (flows 4.4 step 4, 4.6).

#### Bare icon button (`IconButton`)  {#c-icon-button}
- **Used in:** C-1 to C-3 (× close, ‹ previous question); L-12 (× close, ⋯; Library section); R-1 to R-3 (◀◀ ▶▶; Undo, Redo in the bottom group); R-4 to R-6 (‹ Back to the Remote).
- **Anatomy:** one icon, no fill, no border.
- **Size and spacing:** 48 x 48, icon centred (× and ‹ 22, stroke 1.8; ◀◀ ▶▶ 22; Undo / Redo 20). Undo and Redo are 44 x 44. Corner `full` for the pressed fill. Screen-edge buttons sit 4 from the edge (×, ‹).
- **Type and colour:** icon `ink`; Undo / Redo `text-muted`, disabled `text-disabled`.
- **Variants and states:** *pressed:* the shared `pressed` overlay, corner `full`. *Disabled* (Undo / Redo with nothing to undo or redo): icon `text-disabled`, not pressable. *Hidden but holding its place* (‹ on the first check-in card: invisible).
- **Responsive:** fixed size.
- **Build (React Native):** `Pressable` 48 x 48. Hidden ‹: render it with `opacity: 0` and `disabled` so the progress stays centred.
- **Behaviour:** see each screen (flows 4.2 steps 4 and 5, 4.5 step 5, 4.6 step 1).

#### Switch (`ToggleSwitch`)  {#c-toggle-switch}
- **Used in:** Home's All (H-2, H-2b, H-3, H-6 written, X-2f, X-2i to X-2k); the Remote's All (R-1 to R-3, R-7, X-2, X-3); the Remote's Light, Sound and Scent switches (same screens).
- **Anatomy:** a track with a round thumb (no icon, no On / Off words: FINAL has both in the markup but hides them). **One look everywhere** (Home's look), at two sizes. Both Alls include their label "All" inside the tappable area; the part switches have no visible label (the card heading beside them names them).
- **Size and spacing:**
  - *Large* (Home's All and the Remote's All): track 56 x 34, corner `full`; thumb 24, 5 from the track's edge (functional: (34 − 24) / 2), travel 22. The All button: label, then 12 (10), then the track; min-height 48, padding 0 4, about 92 wide.
  - *Small* (the Remote's Light, Sound and Scent): button 56 x 48, padding 0 4; track 48 x 28, corner `full`; thumb 20, 4 from the edge, travel 20.
- **Type and colour** (both sizes, Home and the Remote):
  - Labels `body-strong` `ink`.
  - *On:* track = the scene's **switch colour** (scene colour rule: the first colour darkened to 3:1 on cream; Golden Hour: `#c77a19`); thumb `ground`. It follows the current scene.
  - *Off:* track no fill with a `text-muted` ring inside (2 dp large, 1.5 dp small); thumb `text-muted`, shrunk to 0.667 (16 large, about 13 small), at the start. An off switch may carry a little of the scene's colour: that is intended.
- **Variants and states:** *on* / *off* (above). The thumb slides and the colours change ("switch toggle", MOTION.md).
- **Not in FINAL:** disabled, a loading state while a command is in flight, focus beyond the shared ring, a check or cross in the thumb, a "mixed" state for All when parts differ (All turns on when any part is on, off when all are off: Remote behaviour).
- **Responsive:** fixed sizes; the All label grows with text size inside the 48 height (the button grows taller at 200%).
- **Build (React Native):** a custom `Pressable` (RN's `Switch` cannot draw these looks); track and thumb `Animated.View`s (Reanimated `translateX`, `scale`, colour interpolation; Remove animations → jump). The switch colour from JS: per scene (FINAL `__swc`: keep hue and saturation in HSL, lower lightness in 0.02 steps until contrast with `ground` ≥ 3:1); cache it on the scene. Rings inside the edge: `borderWidth` 2 / 1.5 on the track (no layout jump: keep a transparent border when on).
- **Behaviour:** All and the parts switch the lamp, the speaker and the scent; Home's and the Remote's All are one switch (flow 4.7; Home's bottom row "Off" and the wash recedes, H-6).
- **Behaviour (part switches):** send at once while live (Light off = the lamp's off command, Sound off = pause, Scent = UI only); All off remembers which parts were on and All on restores them (all three if none were); fast repeated taps: the last one wins; never an edit (flow 4.7).

#### Message bar (`MessageBar`)  {#c-message-bar}
- **Used in:** X-1: "Sent to your room · Undo" (C-5 → H-2, drawn as X-1c; L-12; never on the Remote), "Light sent · Sound unavailable" (X-1b), "Sound sent · Light unavailable" (X-1a), "Scene deleted · Undo", "Changes saved", "Renamed", "Saved".
- **Anatomy:** a dark bar: message · Undo at the end (only for "Sent to your room" and "Scene deleted"; never on a half-sent message like "Light sent · Sound unavailable").
- **Size and spacing:** stretches between 16 margins, height 52, padding left 16, right 8, space-between, corner `row`. It sits in an empty slot and never covers anything: its bottom 12 above the tab bar (FINAL: 640 to 692, tab bar from 704); on Home, directly above Home's bottom row ("Set at" + All) and 4 below the main button (FINAL: 588 to 640). Undo: min-height 48, padding 0 12.
- **Type and colour:** fill `charcoal`; message `small` `ground`; Undo `small-strong` `ground`.
- **Variants and states:** *with Undo*; *message only*; *shown* / *hidden* (it slides up 8 and fades in, and out again: "message bar in / out", MOTION.md). One at a time; shows for 5 s.
- **Not in FINAL:** a close ×, swipe to dismiss, a two-line layout.
- **Responsive:** the message is `flex: 1` and wraps (two lines at 200% text; the bar grows); Undo fixed at the end.
- **Build (React Native):** an absolutely positioned `View` above the tab bar (above Home's bottom row on Home), or a portal host per screen; Undo `Pressable`. Never use it for a problem (SCREENS §3.2, §3.3).
- **Behaviour:** feedback on the person's own action; Undo after Set the scene re-sends what was on before (flow 4.3 step 2; 4.8 step 4; 4.10 steps 4 and 5; 4.0 branches).

#### Part-unavailable line (`PartUnavailableLine`)  {#c-part-unavailable-line}
- **Used in:** *card size:* X-3a (the Sound card: "Sound unavailable · Try again"), X-3b (the Light card: "Light unavailable · Try again"). *List size:* R-5c (right above the player), L-13g (under the tapped row; specified in the Library section as `SoundUnavailableLine`: the same component at list size).
- **Anatomy:** one row in place of the part's controls: the message · **Try again** at the end.
- **Size and spacing:** *Card size:* stretches across the card's content (the card's 24 inset), min-height 52 (functional: the height of the controls it replaces is not kept; the card shrinks), space-between; Try again min-height 48, padding 0 4 0 12. *List size:* stretches to the screen width, min-height 48, padding left 24, right 8; Try again 48 tall, padding 0 16.
- **Type and colour:** card size: message `body-strong` `text-muted`, Try again `body-strong` `problem`. List size: message and Try again `small-strong` (`text-muted` / `problem`).
- **Variants and states:** *shown* (the part's controls are hidden, its heading and switch stay; the card gets shorter and the cards below move up); *gone* when Try again or a reconnect brings the part back (the controls return).
- **Not in FINAL:** a loading look while retrying.
- **Responsive:** message `flex: 1` and wraps; Try again fixed at the end.
- **Build (React Native):** `View` row with `Text` and a `Pressable`. Render it instead of the part's control rows, after the card heading.
- **Behaviour:** Try again → reconnect (Connecting… → an outcome); the other part keeps working (flows 4.0, 4.6 branch, 4.13 step 3).

#### Playing bars (`PlayingBars`)  {#c-playing-bars}
- **Used in:** R-5, R-5b (before the current track's name, On-now size at 16 sp), L-11 (before a preset's name), L-6 (before tonight's row name), L-12 (before "On now" in the subheading; and in the sound line while its preview plays)
- **Anatomy:** three thin vertical bars, bottom-aligned, side by side.
- **Size and spacing:** *On-now size* (names, subheading): bars 2.5 wide, gap 2, height 0.72 of the text size (about 11.5 at 16 sp; 0.8 of 14 sp in the subheading), corners `bar`, 8 dp before the text (0.45 em). Resting heights 55% · 100% · 75%. *Sound-line size* (L-12 sound line only): bars 2 wide, gap 2, heights 6 · 11 · 8 within a 12 tall box, corners `bar`.
- **Type and colour:** the colour of the text they precede (`ink` in all Library uses).
- **Variants and states:** *moving* (default whenever the scene or preview is playing): animation "eqb" (On-now size) / "snd5b" (sound-line size), MOTION.md. *Still* with Android's Remove animations: the resting heights above.
- **Not in FINAL:** bars on Home or on the Remote's main screen (cut); bars when the speaker is unavailable (R-5c: none by design); a pause or stop control on the bars (WCAG 2.2.2 is accepted: the bars move without a stop control, still only with Remove animations).
- **Responsive:** scale with the font size of the line they sit in (heights are text-relative); widths stay fixed.
- **Build (React Native):** a `View` row of three `View`s, `transform: [{ scaleY }]` driven by Reanimated, origin bottom; honour Remove animations (`AccessibilityInfo.isReduceMotionEnabled`).
- **Behaviour:** shows wherever "On now" applies (flow 4.8 step 4 and 5; 4.17 for the sound line).

#### Name field (`SceneNameField`)  {#c-scene-name-field}
- **Used in:** R-7a, R-7b, R-7c (the Remote's Save and rename, in place of the scene name). The Library's in-row field (L-4, L-4b) and the naming sheet's field (L-15) are specified in the Library section; the hint line under all of them is the Library's `NameRuleHint`.
- **Anatomy:** in the scene line, in place of the name and the All switch: an underlined text field · **Done**; under it `NameRuleHint` when it has something to say.
- **Size and spacing:** row min-height 48, gap 4; the field `flex: 1` (FINAL fixed 236), 36 tall, no fill, a 1.5 dp `ink` underline only (component-local width, as the Library's in-row field), no padding; Done hugs, 48 tall, padding 0 8. The hint starts at the field's left edge, 4 below the underline (FINAL 131 vs field end 127), across the row's width. The hint takes its own space: it pushes the cards below it down and never overlays anything, at any text size.
- **Type and colour:** field `title` `ink`; text selection ink at 16% (component-local); Done `body-strong` `ink`; Done disabled `text-disabled`; hint `micro` `text-muted` (`NameRuleHint`, L-15 style).
- **Variants and states:** *empty* (R-7a): Done disabled. *Count* (R-7b): "27 of 30" from 25 characters. *Taken* (R-7c): "“Golden Hour” is taken · saves as “Golden Hour 2”" *(provisional)*; Done stays on and saves the numbered name. *Starts with* "My scene" (from scratch, selected to type over), "[name] 2" (an edited preset or check-in), or the current name (your own scene). While naming, the All switch and the bottom group are hidden.
- **Not in FINAL:** a focus look on the field (no change on focus), an error colour, a Cancel control (Android Back cancels).
- **Responsive:** the field shrinks (`minWidth: 0`), text scrolls inside it; Done fixed. At 200% text the row grows; the hint wraps and pushes the cards down.
- **Build (React Native):** `TextInput` (maxLength 30, `autoFocus`, `selectTextOnFocus` for "My scene", `returnKeyType="done"`, `onSubmitEditing` = Done, `selectionColor` ink at 16%); Done `Pressable` (`disabled` when empty). Android Back cancels.
- **Behaviour:** Done saves under the right group; Home's name updates, the history clears and Save goes (flow 4.9 steps 1 to 4; name rule SCREENS §3.6).

#### Home layout and orb slot (`HomeStage`)  {#c-home-stage}
- **Used in:** H-1 to H-9, C-4, C-5, X-1, X-2f, X-2i to X-2k, X-4a to X-4c. The Library's scene view uses the same orb place (Library section).
- **Anatomy:** full screen on `ground`, layered: the wash (Skia, MOTION.md) · the orb (Skia, MOTION.md) · the grain · the UI column: `PageHeader` · `HomeHeadline` (label, title) · the orb slot · the line · `HomeSceneDetails` · the bottom block (`HomeMainButton` / `ResultActions`, `HomeBottomRow`) · `TabBar`.
- **Size and spacing:**
  - Orb slot: square, sized by the Layout rule (49% of the width, 152–216; 176 at 360), centred horizontally and centred in the hero zone (Layout, "The orb's place"), so it sits in the same place in every Home state. At 360 × 800 its centre is at 352 (44%): the check against FINAL. This one rule places Home's and the scene view's orb (share the function). The canvas around it is larger than the slot (FINAL draws 384 wide for the glow) and is not a layout box: draw it `pointerEvents="none"` behind the UI. At rest after a scene is set the orb shows at 1.10x inside the same slot (MOTION.md).
  - The line hangs 36 below the slot in every state (the same as the scene view; FINAL's H-1 has 28).
  - `HomeSceneDetails` 12 below the line, whatever its length (FINAL code).
  - The main button 32 below the line (28) on H-1 and H-2.
  - The bottom block is anchored to the tab bar (see `ResultActions`, `HomeBottomRow`); a flexible spacer between the details and the bottom block absorbs extra height.
- **Type and colour:** the grain overlay at 40% (`design-system/grain.png`, tiled, multiply blend; component-local); with the wash on (`washed`), every `text-muted` text on Home becomes `text-muted-strong` (FINAL: 3.4:1 → 4.8:1 over the halo), the tab bar excepted.
- **Variants and states:** *pearl* (H-1, H-5, the check-in's start); *set* (H-2: the scene's orb and the wash); *all off* (H-6: the wash recedes, MOTION.md); *daytime* (H-8, written: last night's mood, faded); *Sleep well* (H-7, written). Pressing the orb ("sink", MOTION.md) never starts anything.
- **Not in FINAL:** a loading state while the orb and wash prepare; landscape (portrait only).
- **Responsive:** the orb slot follows the Layout rule (size by width, place in the hero zone); text above it is top-anchored, text below hangs from it. On short screens the hero shrinks first; at 200% text the UI column scrolls (SCREENS §3.8) with the orb fixed behind it and the main button pinned.
- **Build (React Native):** a root `View`; Skia `Canvas` layers absolutely filling the screen (`pointerEvents="none"`); the UI column a `ScrollView` (`contentContainerStyle` flexGrow 1) with the hero zone as a fixed-height spacer worked out once from `useWindowDimensions()` (not per state), the orb canvas centred on it. Orb press: a `Pressable` circle over the slot (the effect is decorative).
- **Behaviour:** the Home tab (flows 4.1, 4.2, 4.3, 4.7, 4.15, 4.16).

#### Home headline (`HomeHeadline`)  {#c-home-headline}
- **Used in:** H-1 to H-5, C-4, C-5, X-1, X-2, X-4.
- **Anatomy:** in a centred column: label ("Tonight"; result and set states only) · title (H-1 "How are you tonight?", or the scene / mood name) · the line (below the orb slot: "A few questions, then an atmosphere for your room.", the mood's line, "Made on the Remote" *(provisional)*, "Not set yet. You can set it any time.", or C-4's status "Reading your answers…").
- **Size and spacing:** label 12 below the header row; title 8 below the label (6), or at the label's place when there is no label (H-1: the title starts at the same top in every state); both 24 from each side. The line 32 from each side, its place set by `HomeStage`.
- **Type and colour:** label `small` `text-muted` (`text-muted-strong` on the wash); title `display` `ink`, centred, FINAL letter-spacing -0.005 em (−0.17 at 34: keep as component-local `letterSpacing: -0.17`); line `body` `text-muted` (`text-muted-strong` on the wash), centred.
- **Variants and states:** *title fits:* up to 2 lines at `display`; if longer, `headline`, then `title` (FINAL `fitTitle`: 34 → 28 → 24); the line wraps freely. *Label text:* "Tonight"; written: "Today ·" / "Last night" (H-8, 4.16).
- **Not in FINAL:** truncation (titles never end in "…"), a pressed state.
- **Responsive:** column stretches between the margins; the title steps down to keep 2 lines; at 200% text the steps still apply, then the column scrolls.
- **Build (React Native):** `Text`s; the title steps down with `onTextLayout` (count `lines.length` at each role, pick the first that gives ≤ 2).
- **Behaviour:** static (flows 4.2 step 7, 4.3, 4.16).

#### Sound and scent lines (`HomeSceneDetails`)  {#c-home-scene-details}
- **Used in:** C-5, X-4a to X-4c. Not on a set Home (H-2, H-2b, H-3): there's no room above Check in again.
- **Anatomy:** a centred column of two lines: note icon + "[Ambient / Music] · [track]"; scent drop icon + scent name.
- **Size and spacing:** 12 below the line; gap 2 between the lines; each line hugs, icon 16, 8 before its text (6). Not interactive.
- **Type and colour:** `small` `text-muted` (`text-muted-strong` on the wash); icons the same colour (stroke 1.4).
- **Variants and states:** *shown* (the result); *gone* once the scene is set (FINAL fades them with the result's buttons).
- **Not in FINAL:** a play control (the scene view's sound line is a button; this one is not), truncation.
- **Responsive:** one line each at the reference (FINAL `nowrap`); in RN let them wrap inside the 24 margins rather than overflow (long track names).
- **Build (React Native):** `View` column (alignItems 'center') with two `View` rows (`Svg` + `Text`).
- **Behaviour:** static (flow 4.3).

#### Home main button (`HomeMainButton`)  {#c-home-main-button}
- **Used in:** H-1, H-5 (Check in / Continue), H-2, H-3, X-2f, X-2i to X-2k (Check in), H-2b (Check in again), H-4 (Set the scene).
- **Anatomy:** an outline `PillButton`, main size, centred under the line.
- **Size and spacing:** 52 tall, hugs, padding 0 24; 32 below the line (28).
- **Type and colour:** `body-strong` `ink`, `charcoal` 1 dp border, no fill.
- **Variants and states:** label by state: "Check in" (no check-in tonight), "Continue" (an unfinished check-in, H-5), "Check in again" (tonight has a check-in, H-2b), "Set the scene" (after Not now, H-4). It fades in at 1.5 s after a scene is set (MOTION.md).
- **Not in FINAL:** disabled.
- **Responsive:** hugs and stays centred; at 200% text it grows taller.
- **Build (React Native):** `PillButton variant="outline" size="main"`.
- **Behaviour:** Check in → C-1; Continue → the saved card; Check in again → Home returns to the pearl orb (the wash fades, the lamp keeps the scene), then C-1; Set the scene (H-4) → back to the result (flows 4.2 steps 1 and 5, 4.3 step 3).

#### Home bottom row (`HomeBottomRow`)  {#c-home-bottom-row}
- **Used in:** H-2, H-2b, H-3, X-2f, X-2i to X-2k; H-6; H-9 (written).
- **Anatomy:** a row: "Set at [time]" at the start · Home's All `ToggleSwitch` (with its label) at the end.
- **Size and spacing:** stretches, 64 tall, directly above the tab bar, padding left 24, right 16 (the switch's own 4 padding brings its track to 20 from the edge), space-between, centred vertically.
- **Type and colour:** "Set at 22:10" `tab` `ink` (FINAL 15 serif: now 16); All as `ToggleSwitch`.
- **Variants and states:** *Set at [time]* (the time the scene was set; the phone's 12 / 24-hour setting); *Off* (All off, H-6: the text reads "Off"; All on again restores the time); *Adjusted at [time]* (H-9, written). It fades in 1.5 s after Set the scene (MOTION.md).
- **Not in FINAL:** a pressed "Set at" (it is text, not a button).
- **Responsive:** text `flex: 1`, one line; switch fixed. At 200% text the row grows taller.
- **Build (React Native):** `View` row; `Text`; `ToggleSwitch size="large" labelInside`.
- **Behaviour:** All switches the whole scene (flow 4.7 step 4; 4.16 steps 5 and 6).

#### Check-in screen (`CheckInScreen`)  {#c-check-in-screen}
- **Used in:** C-1, C-2, C-3 (C-4 returns to Home's layout: `HomeHeadline` status line over the developing orb).
- **Anatomy:** full screen over Home, no tab bar, no Me, no connection line, on `ground` with the grain: `CheckInTopBar` · the check-in's orb slot · `CheckInQuestion` · `AnswerScale` (ends labels, scale, hint) · `CheckInActions`.
- **Size and spacing:**
  - Top bar: 48 tall, 8 below the top inset, the same height as the page header and level with it (FINAL y 34).
  - Orb slot: 136 x 136, centred horizontally, its top 82 below the top bar (FINAL centre at 226; the orb is MOTION.md's, pearl).
  - Question: 64 below the orb slot (66), 24 from each side.
  - The answer block (ends labels, scale, hint) is anchored 80 above the action row (FINAL: hint 582–603, actions from 684); the question area between them is flexible, so a longer question does not move the scale.
  - Actions: anchored to the bottom, their bottom 48 above the bottom inset (FINAL 736 of 800, with a 16 gesture area).
- **Type and colour:** see the parts.
- **Variants and states:** *first round* (C-1, C-2: progress circles); *after the 5th answer* (C-3); *later rounds* (no circles; see `CheckInActions`).
- **Not in FINAL:** a transition between cards (none in FINAL: the text swaps), a loading state.
- **Responsive:** column stretches; at 200% text the middle (question and answer block) scrolls and the actions stay pinned (SCREENS §3.8).
- **Build (React Native):** a full-screen modal stack route over Home (`presentation: 'fullScreenModal'` or `transparentModal`); Android Back → the previous card, on the first card it leaves (same as ×).
- **Behaviour:** flow 4.2.

#### Check-in top bar (`CheckInTopBar`)  {#c-check-in-top-bar}
- **Used in:** C-1, C-2, C-3.
- **Anatomy:** ‹ (previous question) at the start · `CheckInProgress` centred · × (close) at the end.
- **Size and spacing:** row stretches, 48 tall, padding 0 4; ‹ and × `IconButton`s 48 x 48 (icons 22); progress centred on the screen, not between the buttons.
- **Type and colour:** icons `ink`.
- **Variants and states:** ‹ *hidden* on the first card (keeps its place), shown once there is a previous answer.
- **Responsive:** fixed height; progress stays centred.
- **Build (React Native):** `View` row (justifyContent 'space-between'), progress absolutely centred.
- **Behaviour:** ‹ → the previous card with its answer; × → Home with Continue (H-5), the scene keeps playing (flow 4.2 steps 4 and 5).

#### Progress circles (`CheckInProgress`)  {#c-check-in-progress}
- **Used in:** C-1, C-2, C-3 (first round only).
- **Anatomy:** five small circles in a row.
- **Size and spacing:** each 8 x 8, corner `full`, gap 8; centred on the top bar.
- **Type and colour:** empty: a 1.5 dp `charcoal` ring inside; filled: `charcoal` fill.
- **Variants and states:** one circle fills per answered question (Skip does not fill one); *gone* from the second round on (no total ever shown).
- **Not in FINAL:** a current-question marker, animation of the fill.
- **Responsive:** fixed.
- **Build (React Native):** `View` row of five `View`s (borderWidth 1.5 / backgroundColor).
- **Behaviour:** flow 4.2 step 2.

#### Question (`CheckInQuestion`)  {#c-check-in-question}
- **Used in:** C-1, C-2, C-3.
- **Anatomy:** one centred question ("How much energy do you have right now?").
- **Size and spacing:** stretches between 24 margins; top-aligned in the question area.
- **Type and colour:** `headline` `ink`, centred.
- **Variants and states:** the text changes per card (5 categories, 2 questions each; Skip swaps to the other).
- **Not in FINAL:** a step-down for long questions (they wrap; the longest in FINAL takes 2 lines at the reference).
- **Responsive:** wraps; never truncates; at 200% text the area scrolls.
- **Build (React Native):** `Text`.
- **Behaviour:** flow 4.2 steps 2 and 3.

#### Answer scale (`AnswerScale`)  {#c-answer-scale}
- **Used in:** C-1, C-2, C-3.
- **Anatomy:** ends labels row ("Not at all" · "Completely") · the scale (a thin line with 10 dots; the round knob once answered) · the hint "Tap where you'd place yourself".
- **Size and spacing:**
  - Ends labels: row 24 from each side (4 inside the scale's edges), space-between, directly above the scale.
  - Scale: 48 tall, 20 from each side; the line inset 12 at each end (296 wide at the reference), 2 tall, corner `bar`, vertically centred; 10 dots, 3 x 3, centred on the line at 16 + (n − 1) x (scale width − 32) / 9 from the scale's left edge (FINAL `whisper` style).
  - Knob: 24 across, centred on the chosen dot, corner `full`.
  - Hint: 8 below the scale, 24 from each side, centred.
  - The whole 48-tall scale takes taps and drags.
- **Type and colour:** ends labels and hint `small` `text-muted`; line and dots component-local `#857d73` (3.3:1 on surface, 3.7:1 on the ground); knob `charcoal`.
- **Variants and states:**
  - *Unanswered* (nothing pre-selected): no knob; Next disabled.
  - *Answered:* the knob on the chosen dot; it lands with "knob land" (MOTION.md).
  - *Pressed / dragging:* the knob grows to 1.18 with a 10 dp ring of ink at 8% around it (component-local) and follows the finger; it snaps to the nearest of the 10 on release; a light haptic per step (MOTION.md).
  - *Hint:* only on the first card of a check-in before any answer (C-2); empty otherwise.
- **Not in FINAL:** numbers on the scale, a value read-out, a disabled state.
- **Responsive:** the scale stretches between its margins; dot positions follow its width; labels hug (they wrap under each other only at 200% text if they cannot share the row).
- **Build (React Native):** a `View` with a `Gesture.Pan()` + `Gesture.Tap()` (react-native-gesture-handler) mapped to 1–10 with Reanimated for the knob. Haptics via `react-native-haptic-feedback` or `Vibration` (MOTION.md).
- **Behaviour:** tap or drag to answer (flow 4.2 step 2).

#### Check-in actions (`CheckInActions`)  {#c-check-in-actions}
- **Used in:** C-1, C-2, C-3.
- **Anatomy:** depends on the card: (a) first round, cards 1–5: Skip · **Next**; (b) after the 5th answer (C-3): Keep going for a sharper read, then **See my mood**; (c) later cards: Skip · Next (outline), then **See my mood**.
- **Size and spacing:** row 52 tall, padding left 8, right 16 (Skip's own 16 brings its text to 24), space-between. Skip `TextLinkButton`; Next `PillButton` filled, main size, hugs, padding 0 32. (b): See my mood `PillButton` filled, 52, stretches between the 24 margins (16), in the row's place; Keep going `TextLinkButton`, 48, stretches between the 24 margins, 8 above See my mood. (c): the Skip · Next row 24 above See my mood (20).
- **Type and colour:** all labels `body-strong`; see `PillButton` and `TextLinkButton`.
- **Variants and states:** Next *disabled* (the disabled rule) until the scale has an answer; Next *outline* on later cards so See my mood stays the one filled button.
- **Not in FINAL:** a ‹ text button (FINAL's back is the top bar's ‹).
- **Responsive:** pinned to the bottom; Skip and Next stay on one row; See my mood and Keep going stretch. At 200% text the buttons grow taller, Keep going may wrap.
- **Build (React Native):** `View` anchored with `marginTop: 'auto'`.
- **Behaviour:** Next → the next card; Skip → another question; Keep going → more cards; See my mood → C-4 → C-5 (flow 4.2 steps 2, 3, 6, 7).

#### Result actions (`ResultActions`)  {#c-result-actions}
- **Used in:** C-5, X-1a, X-1b, X-4a, X-4b, X-4c.
- **Anatomy:** the bottom block of the result, top to bottom: the problem line (X-4b, X-4c only) · **Set the scene** · Not now.
- **Size and spacing:** Set the scene `PillButton` filled, 52, stretches between 24 margins, padding 0 24. Not now `PillButton` text, 48, hugs, centred, directly under Set the scene (no gap); its bottom 8 above the tab bar. The problem line: 12 above Set the scene (11), as wide as the button, centred.
- **Type and colour:** Set the scene `body-strong` `ground` on `charcoal`; Not now `body-strong` `ink`; problem line `small-strong` `problem`, centred.
- **Variants and states:**
  - *Set the scene* (default); *pressed:* shrinks to 0.97 ("set press", MOTION.md).
  - *Setting the scene…* (X-4a, the first time, under Android's Nearby devices prompt; or while connecting): label changes, busy (the busy rule), waits.
  - *Can't reach the lamp* (X-4b): problem line "Can't connect. Move closer and try again." and the button reads **Try again**. *Bluetooth off* (X-4c): "Bluetooth is off." + **Turn on Bluetooth**. *Permission denied* (code): "Allow nearby devices to connect." + **Open settings**. Meanwhile the connection line beside Me is hidden.
  - *Sent:* the Light bloom plays; the result's buttons and details fade, Home's main button and bottom row fade in at 1.5 s; the message bar at 3.0 s (MOTION.md) → H-2.
  - *Only part arrived* (X-1a, X-1b): as Sent, the message bar reads "Sound sent · Light unavailable" / "Light sent · Sound unavailable", and the connection line beside Me shows the part.
- **Responsive:** Set the scene stretches, label one line; the problem line wraps. At 200% text the block grows upward and stays pinned.
- **Build (React Native):** `View` anchored with `marginTop: 'auto'`; Set the scene `disabled` while waiting; haptic on send (MOTION.md).
- **Behaviour:** Set the scene sends light and sound → H-2; Not now → H-4; the fixes retry, ask for Bluetooth or open settings (flows 4.3, 4.0, 4.13).

### Remote

Scope: every component drawn on the Remote tab and its Light, Sound and Scent screens (R-1 to R-7c, the Remote's connection states X-2a to X-2h, X-3a, X-3b, X-4e), measured from FINAL and read from its Remote code, in approved tokens only, for bare React Native 0.85 (TypeScript; Skia for the globe, the brightness ring and the colour wheel).

| Component | RN name | Screens |
|---|---|---|
| Remote screen (layout) | `RemoteScreen` | R-1, R-2, R-3, R-7a to R-7c, X-2a to X-2h, X-3a, X-3b, X-4e |
| Scene line | `RemoteSceneLine` | R-1, R-2, R-3, X-2*, X-3*, X-4e |
| Card header | `RemoteCardHeader` | R-1, R-2, R-3, R-7*, X-2*, X-3*, X-4e |
| Brightness ring | `BrightnessRing` | R-1, R-2, R-3, R-3d (dragging), R-7*, X-2*, X-3a, X-4e |
| Colour dots | `ColourDot`, `RemoteDotRow`, `LightDotRow` | R-1 to R-4, R-7*, X-2*, X-3a, X-4e |
| Cycle key | `CycleKey` | R-1 to R-3, R-3c (Cycling), R-7*, X-2*, X-3a, X-4e |
| Cycle speed | `CycleSpeedSlider` | R-3c (Cycle on) |
| Slider | `LineSlider` | R-1 to R-5c, R-7*, X-2*, X-3b, X-4e |
| Player | `SoundPlayer` | R-1 to R-3, R-5 to R-5c, R-7*, X-2*, X-3b, X-4e |
| Sound line and scent line | `RemoteSoundLine`, `RemoteScentLine` | R-1 to R-3, R-7*, X-2*, X-3*, X-4e |
| Bottom group | `RemoteBottomGroup` | R-2, R-3b (R-3 with Save), X-4e |
| Sub-screen header | `SubScreenHeader` | R-4, R-5, R-5b, R-5c, R-6 |
| Light screen (layout) | `LightScreen` | R-4 |
| Colour wheel | `ColourWheel` | R-4 |
| Sound screen (layout) | `RemoteSoundScreen` | R-5, R-5b, R-5c |
| Track row (Remote) | `RemoteTrackRow` | R-5, R-5b, R-5c |
| Scent row | `ScentRow` | R-6, R-6b (rename) |

Not covered here (shared, documented in their own sections): the page title "Remote" and the Me button, the tab bar, the connection line beside Me (every X-2 state, X-3's "Partly connected", X-4e's "Can't connect · Try again"), the orb / globe renderer itself (MOTION.md), Android's permission and Bluetooth dialogs (X-5a, X-5b). From the Shared section, reused and not re-specified: `ToggleSwitch` (All and the part switches), `PartUnavailableLine` (X-3a, X-3b), `SceneNameField` (R-7a to R-7c), `PlayingBars`. From the Library section: `CategoryTabs` (the Sound screen's Ambient · Music), `NameRuleHint`, `SoundUnavailableLine` (R-5c).

**What the X-2 states change.** Compared element by element with R-1 / R-3, the Remote's X-2a, X-2b, X-2c, X-2d, X-2e, X-2g and X-2h differ only in the connection line's text. None of the components below changes in those states ("your settings stay"). X-3a / X-3b change one card (see `PartUnavailableLine`); X-4e changes the bottom button (see `RemoteBottomGroup`).

**Reading the values.** FINAL's one-off paddings and gaps are snapped to the spacing scale, and FINAL draws the snapped values. A plain number in brackets is the value before the snap, kept so the change can be traced: build the number outside the brackets. Widths are flex rules; the 360 x 800 dp phone is the reference only. Type is given as a role, colours as tokens. "Component-local" marks a value that is not a token and belongs to that component only.

**Shared states** (referred to below rather than repeated):
- *Focus, pressed, disabled:* as in the Shared section and the rules at the top of Components.
- *Dimmed when its part is off:* a part that is switched off keeps its controls visible and usable but at `opacity.dimmed` (Choose excepted: it stays full `ink`). Moving a dimmed control switches its part on (FINAL: colours, Cycle and the ring wake Light; the player and volume wake Sound).

---

#### Remote screen (`RemoteScreen`)  {#c-remote-screen}
- **Used in:** R-1, R-2, R-3, R-7a to R-7c, X-2a to X-2h, X-3a, X-3b, X-4e
- **Anatomy:** under the page-title row (shared): `RemoteSceneLine` · the card stack (Light card: `RemoteCardHeader`, `BrightnessRing`, the dot row with `CycleKey`; Sound card: header, `SoundPlayer` with `RemoteSoundLine`, volume `LineSlider`; Scent card: header with `RemoteScentLine`) · `RemoteBottomGroup` · the tab bar (shared).
- **Size and spacing:** content between the 24 screen margins. Scene line 12 below the page-title row (the Me row), 30 tall. Card stack 12 below the scene line. Inside the Light card: header 48; ring slot 176 tall directly under the header (FINAL overlaps it by 2: ignore); dot row 16 below the ring slot (6 + 8), 48 tall. Light to Sound: 32 (30). Sound card: header 48, player row 52, volume row 44, no gaps. Sound to Scent: 24 (21). Scent card: header 48. Bottom group directly under the stack at the reference size, pinned above the tab bar (FINAL: after the spacing snaps the stack ends at 668 and the group starts at 664, so the stack's last 4 run under the group; build it as described in Responsive, where the stack scrolls under the pinned group).
- **Type and colour:** background `ground` with the paper grain (a 40% multiply noise texture across the phone: `design-system/grain.png`, tiled).
- **Variants and states:** *Nothing on yet* (R-1, the start: pearl globe, pearl dots, all switches off, no bottom group); *preview* (R-2: "New scene", nothing sent, bottom button Pick light, sound, scent / Set the scene); *live* (R-3: every change is sent); *naming* (R-7: `SceneNameField`); *a part unavailable* (X-3a, X-3b).
- **Not in FINAL:** a loading state while the Remote first reads the lamp (no readback in v1), a scroll position memory.
- **Responsive:** the scene line and the card stack go in one vertical `ScrollView` (`flex: 1`); the bottom group stays outside it, pinned above the tab bar. On taller screens the extra height opens between the Scent card and the bottom group (the stack is top-anchored, as in FINAL). On shorter screens and at 200% text the stack scrolls under a pinned bottom group (SCREENS §3.8).
- **Build (React Native):** `View` (flex 1) → `ScrollView` (contentContainerStyle paddingHorizontal 24) → `RemoteBottomGroup` → tab bar. The tab bar stays on R-4 to R-6 (SCREENS §2).
- **Behaviour:** starting is explicit, adjusting is live (SCREENS §3.1; flows 4.4, 4.5, 4.7).

#### Scene line (`RemoteSceneLine`)  {#c-remote-scene-line}
- **Used in:** R-1, R-2, R-3, X-2*, X-3*, X-4e; replaced by `SceneNameField` in R-7a to R-7c
- **Anatomy:** one row: scene name (with the pencil after it on your own saved scene) · All `ToggleSwitch` (large, its label "All" inside the button, as on Home) at the end.
- **Size and spacing:** row stretches between the 24 margins, 30 tall; name `flex: 1`, `minWidth: 0`, one line; FINAL caps the name at 214 dp, which is the room left beside All at 360 (give the name a 16 gap before All instead of a fixed cap). All: the shared large `ToggleSwitch` with its label inside (label 12 before the track), vertically centred on the name line; its 48 tall button overhangs the 30 tall row above and below. The All switch's track lines up with the card switches' tracks below it: both buttons end flush with the content edge and carry the same 4 padding. Pencil: 14 x 14, 6 after the name's last character.
- **Type and colour:** name `title` `ink`; "Nothing on yet" `title` `text-muted`; All `body-strong` `ink`; pencil stroke `text-muted`.
- **Variants and states:**
  - *Nothing on yet* (R-1): name "Nothing on yet" in `text-muted`; All off.
  - *New scene* (R-2): after the first change in a preview the name becomes "New scene" in `ink`; it goes back to "Nothing on yet" if Undo returns everything to the start.
  - *A scene* (R-3): the scene's name in `ink`.
  - *Your own saved scene*: the pencil shows after the name and the name is pressable (rename); presets and check-ins have no pencil.
  - *All off*: the name turns `text-muted`.
  - *Naming* (R-7): the name and All are hidden; `SceneNameField` takes the row.
  - No chevron: FINAL hides the name's ›; the name does not open anything except rename.
- **Not in FINAL:** a disabled All, a "Preview" tag (FINAL has the element but forces it hidden: do not build).
- **Responsive:** name one line ending in "…" (the Remote is the exception to the long-name rule). All never shrinks. At 200% text the row grows taller; All stays on the same row, the name truncates sooner.
- **Build (React Native):** `View` row (alignItems 'center'); name `Text numberOfLines={1}`; on your own scene wrap it in a `Pressable`. Optional: draw the pencil as a separate SVG icon after the `Text` (not inside it) so truncation never cuts it off (as FINAL draws it: the pencil after the "…").
- **Behaviour:** tapping your own scene's name starts naming in place (flow 4.9 step 4); All switches Light, Sound and Scent together (flow 4.7 step 4; 4.4 step 3 in a preview).

#### Card header (`RemoteCardHeader`)  {#c-remote-card-header}
- **Used in:** R-1 to R-3, R-7*, X-2*, X-3*, X-4e
- **Anatomy:** one row: heading button ("Light ›", "Sound ›", "Scent ›") · [Scent only: `RemoteScentLine`] · `ToggleSwitch` (small) at the end.
- **Size and spacing:** row stretches, min-height 48, space-between, gap 8. Heading button hugs: min-height 48, padding right 12, label then a 16 chevron, gap 4. Switch at the end, its target flush with the content edge.
- **Type and colour:** heading `heading` `ink`; chevron `text-muted`.
- **Variants and states:** *default*; *pressed* (heading button only): `pressed` fill, corner `row` (FINAL 10: snapped to the nearest corner token). The header stays when its part is off or unavailable (X-3): only the controls under it change.
- **Not in FINAL:** disabled, a value shown in the header.
- **Responsive:** heading and switch fixed; the Scent line between them takes the remaining width and truncates. At 200% text the row grows; the heading never wraps.
- **Build (React Native):** `View` row; heading `Pressable`, chevron as SVG.
- **Behaviour:** opens R-4 / R-5 / R-6 (SCREENS §2; flows 4.5, 4.6, 4.11).

#### Brightness ring (`BrightnessRing`)  {#c-brightness-ring}
- **Used in:** R-1, R-2, R-3, R-3d (dragging), R-7*, X-2*, X-3a, X-4e (gone in X-3b)
- **Anatomy:** in a 176 x 176 square, centred: the tick ring (41 ticks on a 270 degree arc, open at the bottom) · the value marker · the globe slot in the middle (not touchable) · the sun icon in the bottom opening, replaced by the value while dragging.
- **Size and spacing:** square 176 (FINAL: a 196 box scaled 0.9 = 176.4), centred in the card's width. Arc from the 7:30 position clockwise over the top to 4:30 (SVG angles -225 to +45 degrees). Ticks: radii 76.6 to 81.6 dp (5 long), stroke 1.3, round caps. Marker: at the value's angle, radii 72.8 to 84.9 dp, stroke 2.9, round caps. Sun icon 16, centred, its bottom 4 above the square's bottom. Globe slot: centred on the ring; FINAL's globe is 90 dp nominal in a 195 dp canvas that overflows the ring and is drawn above the ticks (renderer, glow and motion: MOTION.md). Touch: the ring band only, from 62% of the radius outwards (about 55 dp from the centre).
- **Type and colour:** ticks up to the value `ink`, after it `outline-faint`; marker `ink`; sun icon `text-muted`; value while dragging `body-strong` `ink` (FINAL's 0.9 is the box's scale, not a type size).
- **Variants and states:**
  - *Resting:* ticks and marker show the value; the sun icon in the opening.
  - *Dragging:* the sun icon is replaced by the value ("70%"); it stays a moment after release, then the icon returns ("ring value" in MOTION.md).
  - *Range:* 5 to 100% (the lamp's floor is 5%).
  - *Light off / Nothing on yet* (R-1): every tick and the marker `outline-faint`, the ring at `opacity.dimmed`; the globe shows the pearl globe. Dragging still works and switches Light on.
  - *Light unavailable* (X-3b): the ring is replaced by `PartUnavailableLine`.
- **Not in FINAL:** pressed, a disabled look.
- **Responsive:** fixed size at every width and text size; stays centred. The value text scales with text size inside the opening.
- **Build (React Native):** Skia `Canvas` (176 square) drawing the 41 `Line`s and the marker from a Reanimated shared value (or react-native-svg `Line`s if the team prefers SVG; the geometry is the same); the globe as its own Skia layer from MOTION.md, `pointerEvents="none"`. Gesture: react-native-gesture-handler `Pan` (minDistance 0) that starts only when the touch is at least 0.62 x radius from the centre; angle → value along the arc; in the bottom opening snap to the nearer end; clamp to 5..100. Haptics: none in FINAL.
- **Behaviour:** sends live while dragging (one write in flight, about every 150 to 250 ms, latest wins, a final value on release); never an edit (flow 4.5 step 1).

#### Colour dots (`ColourDot`, `RemoteDotRow`, `LightDotRow`)  {#c-colour-dots}
- **Used in:** R-1, R-2, R-3, R-7*, X-2*, X-3a, X-4e (the Remote's 4); R-4 (the Light screen's 8)
- **Anatomy:** a row of colour circles, each a touch target with a 22 dp dot in its centre. The Remote's 4 are the first 4 of the Light screen's 8 (the scene's palette).
- **Size and spacing:**
  - *Remote (4):* each target 48 x 48, no gaps, the row `flex: 1` before `CycleKey` (gap 8); the row starts 8 before the content edge (-9), so the first dot sits just inside the margin while its target overhangs it.
  - *Light screen (8):* each target 36 wide x 48 tall, spread `space-between` across the content width (about 3 dp apart at 360).
  - Dot 22, corner `full`.
- **Type and colour:** dots in the palette's colours (scene colour rule). Remote, not selected: a 1 dp hairline inside the edge, `ink` at 16% (component-local). Selected / held: a 2 dp `ground` gap then a 1.5 dp `ink` ring outside the dot (outer size 29). Light screen dots have no hairline.
- **Variants and states:**
  - *Default*, *held* (ringed; at most one).
  - *A held colour from 5 to 8* (picked on the Light screen): the Remote's 4th dot takes that colour and is ringed; picking dot 1 to 3 on the Remote puts the 4th dot back to palette colour 4.
  - *Nothing on yet* (R-1): pearl dots, the first 4 of the pearl palette (#E9D6BE, #D3E2D1, #D9D8EE, #CDE5E4: scene colour rule), at 90% opacity (component-local), none held.
  - *Light off* (a scene loaded): the row at `opacity.dimmed`; still tappable (wakes Light).
  - *Cycle on:* the Remote's 4 dots give way to `CycleSpeedSlider`; they return with Cycle off.
  - *Colour range moving* (R-4): all 8 and the Remote's 4 follow as the palette changes (a held 5 to 8 in the 4th slot is kept).
- **Not in FINAL:** disabled, a check mark, focus beyond the shared ring.
- **Responsive:** Remote: targets fixed, the row hugs its 4 targets; Light: targets fixed, the gaps stretch. Dots never scale with text size.
- **Build (React Native):** `View` row of `Pressable`s; each dot a `View` (22, borderRadius 11); the hairline `borderWidth` 1 ink at 16%; the held ring an absolutely positioned 29 dp `View` (borderWidth 1.5 `ink`) around a 26 dp `ground` circle, so the dot never moves.
- **Behaviour:** tap holds that colour on the lamp (static, Cycle off) while live, or picks the preview's light; choosing a dot never counts as an edit (flow 4.5 step 2; 4.4 steps 1, 2).

#### Cycle key (`CycleKey`)  {#c-cycle-key}
- **Used in:** R-1 to R-3, R-3c (Cycling), R-7*, X-2*, X-3a, X-4e
- **Anatomy:** a filled pill: cycle icon · label.
- **Size and spacing:** 40 tall, hugs, padding left 12, right 16 (14), gap 8 between icon and label (6), icon 18, corner `full`. At the end of the dot row.
- **Type and colour:** label `small-strong` `ink`; icon `ink`; fill `surface`.
- **Variants and states:** *off*: "Cycle"; *on* ("Cycling"): label "Cycling", fill `surface-strong` with a 1 dp `outline` line inside its edge, the icon turns slowly (animation "spin", MOTION.md; still with Remove animations). *Nothing on yet* / Light off: `opacity.dimmed`; still tappable (wakes Light).
- **Not in FINAL:** disabled.
- **Responsive:** hugs its label; at 200% text the pill grows taller and wider, the dots (or the speed slider) give way (`flexShrink`).
- **Build (React Native):** `Pressable`; icon SVG rotated with Reanimated.
- **Behaviour:** Cycle on moves the light and globe through the scene's 8 colours and swaps the dots for the speed slider; never an edit (flow 4.5 step 3).

#### Cycle speed (`CycleSpeedSlider`)  {#c-cycle-speed-slider}
- **Used in:** R-3c (R-3 with Cycle on)
- **Anatomy:** "Slow" · `LineSlider` · "Fast", in the dots' place, before `CycleKey`.
- **Size and spacing:** `flex: 1`, gap 8, 12 before the Cycle key (10 + the row's 8 gap: FINAL margin 10 → 12, then the row gap). Slider `flex: 1`, 48 tall.
- **Type and colour:** "Slow" / "Fast" `small-strong` `text-muted`; slider as `LineSlider`.
- **Variants and states:** shown only while Cycle is on; default value 0.4 (FINAL).
- **Not in FINAL:** a value read-out while dragging (volume has one; speed does not), disabled.
- **Responsive:** stretches between its labels; labels never truncate.
- **Build (React Native):** `View` row with two `Text`s and `LineSlider`.
- **Behaviour:** sends live (throttled as the ring); never an edit (flow 4.5 step 1).

#### Slider (`LineSlider`)  {#c-line-slider}
- **Used in:** volume (R-1 to R-3, R-5 to R-5c, X-3b, X-4e), Cycle speed, Colour range (R-4)
- **Anatomy:** a 48 tall touch strip with: track · fill (start to the knob) · knob. Leading / trailing / under labels per variant.
- **Size and spacing:** strip 48 tall, stretches. Track 3 tall, vertically centred, inset 12 from each end of the strip, corner `bar`. Fill: same height and corner, from the track's start to the knob. Knob 16, corner `full`, centred on the value point (so it never overhangs the strip).
- **Type and colour:** track `outline`; fill `ink`; knob `charcoal`.
- **Variants and states:**
  - *Volume:* a 36 wide slot before the strip holding the speaker icon (22, `text-muted`); while dragging the icon is replaced by the value ("50%", `small-strong` `ink`), back a moment after release (MOTION.md). Row 44 tall, no gap. Sound off: the row at `opacity.dimmed` (FINAL 35%), still usable (wakes Sound).
  - *Cycle speed:* see `CycleSpeedSlider`.
  - *Colour range* (R-4): label "Colour range" above (`body-strong` `ink`), the strip directly under it, then "Varied" (start) and "Close" (end) under the track's ends (`caption` 500, `text-muted`), pulled 8 up into the strip's lower half (-6). Default 0.28 (the old app's default).
- **Not in FINAL:** pressed or grabbed knob look, disabled, tick marks or steps.
- **Responsive:** strip stretches; knob, track height and label slots fixed. Labels never truncate. At 200% text the end labels grow; the strip keeps 48.
- **Build (React Native):** `View` with three `View`s positioned from a Reanimated shared value; gesture-handler `Pan` (minDistance 0: a tap jumps to the point). Value = (x - 12) / (width - 24), clamped 0..1.
- **Behaviour:** volume and speed send live (throttled; flow 4.5 step 1); Colour range recolours the palette while dragging and counts as an edit (a new palette) on release (flow 4.5 step 4).

#### Player (`SoundPlayer`)  {#c-sound-player}
- **Used in:** the Remote's Sound card (R-1 to R-3, R-7*, X-2*, X-3b, X-4e); pinned on the Sound screen (R-5, R-5b, R-5c)
- **Anatomy:** one row: name column (track name over its category) · transport: ◀◀ previous · play / pause · ▶▶ next. On the Sound screen, the volume `LineSlider` row follows.
- **Size and spacing:** row min-height 52, gap 8; name column `flex: 1`, `minWidth: 0`, its two lines stacked tight. Transport hugs, no gaps, end-aligned: ◀◀ and ▶▶ 48 x 48 with no fill; play / pause 48 x 48 on the Remote, 52 x 52 on the Sound screen, filled; icons 22; corners `full`. Sound screen: volume row 8 below (6).
- **Type and colour:** Remote: track `body-strong` `ink`, category `small-strong` `text-muted`. Sound screen: track `heading` `ink` (the now-playing name), category `small-strong` `text-muted`. Icons `ink`; play / pause fill `surface`.
- **Variants and states:**
  - *Play* (▶): in a preview (nothing plays until Set the scene), and after a pause.
  - *Pause* (⏸): while live and playing.
  - *Pressed:* play / pause fill `surface-strong`; ◀◀ ▶▶ fill `pressed`, corner `full`.
  - *Sound off:* transport and name column at `opacity.dimmed` (FINAL 35% and 45%); still usable (wakes Sound).
  - *No sound yet* (R-1): the name column shows `RemoteSoundLine`'s empty state; ◀◀ ▶▶ do nothing.
  - *Speaker unavailable* (R-5c): play / pause shows ▶ and does not play; `SoundUnavailableLine` sits directly above the player.
  - *Sound unavailable* (X-3a): the player and the volume row are replaced by `PartUnavailableLine`.
- **Not in FINAL:** disabled look for ◀◀ ▶▶ without a sound, a progress bar, a loading state while a track starts.
- **Responsive:** name column shrinks; track and category one line each ending in "…"; transport fixed. At 200% text the row grows taller; the transport never wraps.
- **Build (React Native):** `View` row; `Text numberOfLines={1}` x 2; three `Pressable`s; icons `previous-track`, `play` / `pause`, `next-track` from `design-system/icons/`.
- **Behaviour:** ◀◀ / ▶▶ play the previous / next track on the speaker at once and count as an edit; play / pause toggles (flows 4.6 step 1, 4.4 step 4).

#### Sound line and scent line (`RemoteSoundLine`, `RemoteScentLine`)  {#c-remote-sound-line}
- **Used in:** R-1 to R-3, R-7*, X-2*, X-3*, X-4e
- **Anatomy:** *Sound line:* the player's name column: track over category, or "No sound yet" over **Choose**. *Scent line:* inside the Scent header row, between the heading and the switch: the scent's name, or "No scent yet" · **Choose**.
- **Size and spacing:** Sound: the column as in `SoundPlayer`; Choose directly under "No sound yet", start-aligned, min-height 32. Scent: name `flex: 1`, 8 after the heading button; Choose pushed to the end (`marginLeft: 'auto'`), 8 before the switch. Choose: text only, no padding, min-height 32, underline 3 below the text in FINAL.
- **Type and colour:** names `body-strong` `ink`; "No sound yet" / "No scent yet" `body-strong` `text-muted`; Choose `body-strong` `ink`, underlined; category `small-strong` `text-muted`.
- **Variants and states:** *empty* (no sound / no scent chosen yet: "No … yet" + Choose); *chosen* (the name; Choose goes); *Scent off:* the name turns `text-muted` and goes to `opacity.dimmed`; *Sound off:* the column at `opacity.dimmed`. **Choose is never dimmed:** it stays full `ink` because it works (in R-1 the lines are dimmed, Choose is not; FINAL dims it too).
- **Not in FINAL:** the scent line as a button (the scent name opens nothing: use the heading).
- **Responsive:** names one line ending in "…"; Choose never truncates. At 200% text the Scent row may run out of room: the name truncates first, Choose and the switch stay.
- **Build (React Native):** `Text` (`numberOfLines={1}`); Choose `Pressable` + `Text` (`textDecorationLine: 'underline'`), kept outside the dimmed `View`.
- **Behaviour:** Choose opens R-5 / R-6 (FINAL's stills pick a sample instead); a chosen sound or scent switches its part on (flow 4.4 step 2).

#### Bottom group (`RemoteBottomGroup`)  {#c-remote-bottom-group}
- **Used in:** R-2, R-3b (R-3 once there is something to save or undo), X-4e
- **Anatomy:** Undo (icon) · the action button · Redo (icon), centred.
- **Size and spacing:** row 48 tall between 16 margins, centred, gap 8 (6). Undo and Redo 44 x 44, icon 20, corner `full`. Action button 44 tall, hugs, padding 0 24 (20), corner `full`, 1 dp border. Pinned above the tab bar.
- **Type and colour:** Undo / Redo icons `text-muted`, disabled `text-disabled`. Action label `body-strong`. *Set the scene* / *Try again*: `ground` on `charcoal`. *Save*: `ink` on no fill, border `charcoal`. *Disabled* (Pick light, sound, scent): the disabled rule (fill and border `surface`, text `text-disabled`). *Busy* (Setting the scene…): the busy rule (fill `busy`, text `ink`).
- **Variants and states:**
  - *Hidden:* nothing to show (R-1; R-3 with no edit and no history).
  - *Preview* (R-2): "Pick light, sound, scent" (disabled) until a light, a sound and a scent are chosen, then "Set the scene".
  - *Setting the scene…:* label changes, busy (the busy rule).
  - *Can't reach the lamp* (X-4e): the button becomes **Try again** (or **Turn on Bluetooth** / **Open settings**); there is no room above it for a line, so the connection line at the top says what happened.
  - *Live with something to save:* "Save" (outline). It stays, also after leaving and coming back, until saved or changed back.
  - *Undo / Redo:* shown once there is a history step, each disabled when it has nothing; with no history at all both are invisible but keep their space (the action button stays centred).
  - *Naming* (R-7): the whole group is hidden.
- **Not in FINAL:** a loading spinner, message bars on the Remote (none by decision).
- **Responsive:** the action label stays one line; the group stays centred. At 200% text it grows taller and stays pinned.
- **Build (React Native):** `View` row (justifyContent 'center'); `Pressable`s; the invisible Undo / Redo: `opacity: 0` and `disabled`.
- **Behaviour:** Set the scene sends the whole preview → live (R-3), the player shows ⏸, Home shows it (flow 4.4 step 5; failures §4.0, state 18); Save starts `SceneNameField` (flow 4.9); Undo / Redo step one-tap changes back and forward, re-sent live, history for this visit only (flow 4.5 step 5).

#### Sub-screen header (`SubScreenHeader`)  {#c-sub-screen-header}
- **Used in:** R-4, R-5, R-5b, R-5c, R-6
- **Anatomy:** top row: ‹ Back · title ("Light", "Sound", "Scent"); under the title, the scene's name.
- **Size and spacing:** top row 48 tall, in the page-title row's place (8 below the top inset), 4 from the left edge, 16 from the right; ‹ 48 x 48 (icon 22), title 2 after it. Scene name directly under the row, aligned with the title's start (4 + 48 + 2 = 54 from the edge at reference; 2 is on the scale). Content starts 24 below the scene name (22).
- **Type and colour:** ‹ `ink`; title `headline` `ink`; scene name `small` `text-muted`.
- **Variants and states:** one state; the scene name follows the Remote ("Nothing on yet", "New scene" or the scene's name).
- **Not in FINAL:** a ⋯ menu.
- **Responsive:** title one line; scene name one line ending in "…" (`flex: 1`). At 200% text both grow; the content below moves down.
- **Build (React Native):** a stack screen inside the Remote tab (the tab bar stays); ‹ `Pressable`; title `Text`. Android Back = ‹.
- **Behaviour:** ‹ / Back returns to the Remote with every change kept (SCREENS §2).

#### Light screen (`LightScreen`)  {#c-light-screen}
- **Used in:** R-4
- **Anatomy:** `SubScreenHeader` ("Light") · `ColourWheel` · hint line · `LightDotRow` (8) · Colour range (`LineSlider`, Colour range variant).
- **Size and spacing:** content between the 24 margins. Wheel canvas 290 square, centred, pulled up 20 and the hint pulled up 26 into its transparent margin (functional overlaps of the wheel's halo, not spacing); hint 8 below the canvas's (pulled-up) end (6). Dot row 16 below the hint (18), 48 tall. Colour range 24 below the dots (22): label, strip, end labels.
- **Type and colour:** hint `small-strong` `text-muted`, centred ("Round for the colour, toward the centre for whiter.").
- **Variants and states:** one layout; the dots and the Remote's 4 follow the wheel and Colour range live.
- **Not in FINAL:** a reset, a "held" label.
- **Responsive:** wheel fixed (290; never wider than the content: at narrower screens scale it to the content width); hint wraps; dots spread; at 200% text the screen scrolls (`ScrollView`).
- **Build (React Native):** `ScrollView` with the children above.
- **Behaviour:** see `ColourWheel`, `ColourDots`, `LineSlider` (flow 4.5 steps 2, 4).

#### Colour wheel (`ColourWheel`)  {#c-colour-wheel}
- **Used in:** R-4
- **Anatomy:** a soft colour disc (round = hue, toward the centre = whiter) with a faint halo · the knob at the picked point.
- **Size and spacing:** canvas 290 x 290; disc diameter 0.62 of the canvas (about 180), centred, with a soft edge and an outer halo; knob 26, its centre on the touch point, clamped to the disc's edge. Touch anywhere on the canvas.
- **Type and colour:** disc colours from FINAL's OKLab wheel (lightness 0.975 at the centre to 0.74 at the edge, chroma up to 0.155, a slight hue drift); knob fill = the picked colour, then a 3 dp white ring (component-local `#ffffff`) and a 1.5 dp `ink` ring outside it.
- **Variants and states:** *resting* (knob on the scene's first colour); *dragging* (the knob and all 8 dots follow).
- **Not in FINAL:** pressed, disabled.
- **Responsive:** fixed size; centred.
- **Build (React Native):** Skia `Canvas` with a `RuntimeEffect` (SkSL port of FINAL's fragment shader `wheelLab` + soft edge + halo) drawn once and cached; knob as a Skia `Circle` group or an absolutely positioned `View` (rings via nested borders) moved by Reanimated; gesture-handler `Pan` (minDistance 0).
- **Behaviour:** dragging sends a new palette live (throttled); letting go counts as an edit (Save) (flow 4.5 step 4).

#### Sound screen (`RemoteSoundScreen`)  {#c-remote-sound-screen}
- **Used in:** R-5, R-5b, R-5c
- **Anatomy:** `SubScreenHeader` ("Sound") · `CategoryTabs` (Ambient · Music; Library component, no search so no dimmed state) · the track list (`RemoteTrackRow`s) · `SoundPlayer` pinned at the bottom (with volume).
- **Size and spacing:** tabs 4 below the content start, row 44 tall. List 12 below the tabs (10), widened 8 past each margin (rows 16 from the screen edges, text at 24), `flex: 1`, scrolls, its last 32 dp fading to `ground` (R-5b). Player between the 24 margins, 16 above the tab bar (14), the list ending 16 above it (14).
- **Type and colour:** background `ground`.
- **Variants and states:** *default* (R-5); *a long list* (R-5b: the list scrolls under the fade, the player stays); *speaker unavailable* (R-5c): the tapped track is chosen (tinted) but does not play; `SoundUnavailableLine` (Library component, full width) sits directly above the player and the list ends 4 above it; no playing bars; the player shows ▶.
- **Opening:** the list opens scrolled so the current track sits in the middle (as the Library's Sounds screen; FINAL's Remote opens at the top).
- **Not in FINAL:** an empty category, loading the list.
- **Responsive:** the list fills the height between the tabs and the player; at 200% text rows grow and the list keeps scrolling; the player stays pinned.
- **Build (React Native):** `FlatList` (`getItemLayout` with 56 dp rows, `initialScrollIndex` on the current track, offset to centre it) in a `View` (flex 1) above the player; the fade: an absolutely positioned 32 dp `View` at the list's bottom with a vertical gradient from transparent to `ground` (RN `experimental_backgroundImage` linear-gradient on the New Architecture, or a Skia `LinearGradient`), `pointerEvents="none"`; the CSS mask is web-only.
- **Behaviour:** tabs switch the list; a track tap plays it at once and makes it the scene's track (flow 4.6 step 2; branch: speaker unavailable).

#### Track row, Remote (`RemoteTrackRow`)  {#c-remote-track-row}
- **Used in:** R-5, R-5b, R-5c
- **Anatomy:** one rounded row, one touch area: [`PlayingBars` before the name, current track only] name · length at the end.
- **Size and spacing:** min-height 56, stretches, padding 0 8, corner `row`, gap 12 between name and length (10); name `flex: 1`.
- **Type and colour:** name `body-strong` `ink`; length `small` `text-muted`; bars `ink`.
- **Variants and states:** *current / playing* (the scene's track): fill `surface`, `PlayingBars` (On-now size) moving before the name. *Plain:* no fill. *Speaker unavailable* (R-5c): the chosen row keeps its fill but has no bars.
- **Not in FINAL:** disabled rows, a separate ▶ (unlike the Library's `TrackRow`, the whole row plays).
- **Responsive:** name one line with "…"; length fixed. At 200% text rows grow (56 is a minimum).
- **Build (React Native):** `Pressable` row.
- **Behaviour:** tap → it plays on the speaker at once, becomes the scene's track (an edit), the bars move to it (flow 4.6 step 2).

#### Scent row (`ScentRow`)  {#c-scent-row}
- **Used in:** R-6, R-6b (rename)
- **Anatomy:** two touch areas: the pick area (name; the original name under it when renamed; a tick at its end on the current scent) and ⋯ at the end. ⋯ opens the row's actions: pen (Rename) and, for a renamed scent, the return arrow (Use original name). Rename turns the row into: field · ✓ · ✕, with `NameRuleHint` under it.
- **Size and spacing:** the list starts 24 below the scene name, widened 8 past each margin. Row min-height 60, padding 0 8, bottom padding 8, corner `row`, no gaps between rows. Pick area `flex: 1`; tick 20, 4 from the pick area's end. ⋯ 44 x 44, icon 18. Action buttons 44 x 44, icon 20, corner `full`. Rename: field `flex: 1`, 40 tall, no fill, a 1.5 dp `ink` underline only (component-local width), gap 4 to ✓ and ✕ (44 each); hint full width under it, 8 below (6).
- **Type and colour:** name `body-strong` `ink`; original name `small` `text-muted`; tick `ink`; ⋯ `text-muted`; action and ✓ ✕ icons `ink`; field text `body-strong` `ink`, selection ink at 16% (component-local).
- **Variants and states:**
  - *Current* (the scene's scent): fill `surface` + tick.
  - *Renamed:* the new name, the original as a second line.
  - *Actions open:* ⋯ is replaced by the pen and (if renamed) the return arrow; one row at a time; tap anywhere else or ⋯'s place again closes them.
  - *Renaming:* the field starts with the current name, all selected, keyboard up; ✓ disabled when empty (the disabled rule); count from 25 and the taken message via `NameRuleHint` (taken = another scent's name).
- **Not in FINAL:** a swipe gesture, deleting a scent.
- **Responsive:** names and original names one line with "…"; ✓ ✕ and ⋯ fixed; the hint wraps. At 200% text rows grow.
- **Build (React Native):** `View` row; pick area, ⋯, pen, arrow, ✓ and ✕ are `Pressable`s; `TextInput` (maxLength 30, `selectTextOnFocus`, `returnKeyType="done"` → ✓). Android Back while renaming = ✕.
- **Behaviour:** tap a scent → ticked, the scene's scent (an edit if it differs; UI only); Rename → the new name shows here and on the Remote; Use original name → back, second line goes; renaming never counts as an edit (flow 4.11).

### Library

Scope: every component drawn on the Library tab and its full-screen steps (L-1 to L-15, X-2l, X-4d), measured from FINAL and read from its Library code, in approved tokens only, for bare React Native 0.85 (TypeScript; Skia only for Globe stills, the orb and the wash).

| Component | RN name | Screens |
|---|---|---|
| Heading tabs | `LibraryHeadingTabs` | L-1 to L-9, L-11, X-2l |
| Globe still | `GlobeStill` | L-1 to L-4b, L-6, L-11, X-2l |
| Preset tile | `PresetTile` | L-1, L-11, X-2l |
| Saved row | `SavedSceneRow` | L-2, L-3, L-4, L-4b |
| Group heading | `ListGroupHeading` | L-2, L-3, L-4, L-6 |
| Edit in the row | `SavedRowEditor` | L-4, L-4b |
| Name-rule line | `NameRuleHint` | L-4b, L-15 |
| Chip | `ChoiceChip` | L-4, L-4b |
| Sounds screen | `SoundPickerScreen` | L-13 to L-13g |
| Search field | `SoundSearchField` | L-13 to L-13g |
| Category tabs | `CategoryTabs` | L-13 to L-13g |
| Track row | `TrackRow` | L-13, L-13b, L-13c, L-13e, L-13g |
| Speaker-unavailable line | `SoundUnavailableLine` | L-13g |
| Calendar | `CheckInCalendar` | L-6, L-9, L-10 |
| Calendar day | `CalendarDay` | L-6, L-9 |
| Check-in row | `CheckInRow` | L-6 |
| Year view | `YearView` | L-7 |
| Month tile | `YearMonthTile` | L-7 |
| Library empty state | `LibraryEmptyState` | L-5, L-8, L-9, L-10 |
| Scene view | `SceneView` | L-12, X-4d |
| Name strip | `SceneNameStrip` | L-12, X-4d |
| Sound line and scent line | `SceneSoundLine`, `SceneScentLine` | L-12, X-4d |
| Scene view actions | `SceneViewActions` | L-12, X-4d |
| Naming sheet | `NamingSheet` | L-15 |

Not covered here (shared, documented in their own sections): the page title "Library" and the Me button, the tab bar, the connection line beside Me (X-2l; on the Sounds screen L-13g has only the line under the row, `SoundUnavailableLine`), the playing bars (`PlayingBars`), the message bar ("Sent to your room · Undo", "Scene deleted · Undo", "Changes saved", "Renamed", "Saved"), the orb itself and the crochet wash (MOTION.md).

**Reading the values.** FINAL's one-off paddings and gaps are snapped to the spacing scale, and FINAL draws the snapped values. A plain number in brackets is the value before the snap, kept so the change can be traced: build the number outside the brackets. Widths are flex rules; the 360 x 800 dp phone is the reference only. Type is given as a role; colours as tokens. "Component-local" marks a value that is not a token and belongs to that component only.

**Focus, pressed, disabled:** as in the Shared section and the rules at the top of Components (the Library's focus ring takes the control's own text colour).

---

#### Heading tabs (`LibraryHeadingTabs`)  {#c-library-heading-tabs}
- **Used in:** L-1, L-2, L-3, L-4, L-4b, L-5, L-6, L-7, L-8, L-9, L-11, X-2l
- **Anatomy:** a row of three text tabs: Presets · Saved · Check-ins. No underline, no indicator, no counts: the current tab is shown only by its larger size and darker colour.
- **Size and spacing:** row stretches to the screen width, horizontal padding 24, gap 24 between tabs (20), min-height 48. It sits 12 below the page-title row (10). Each tab hugs its label; padding top 8, bottom 16 (7.5 / 17.5), no side padding. The tabs share one text baseline, so the larger current tab lines up with the smaller ones. Each tab is at least 48 tall; widths hug the label.
- **Type and colour:** current tab `title`, `ink`; the other two `tab`, `text-muted`.
- **Variants and states:** *current* (`title`, `ink`) and *not current* (`tab`, `text-muted`). Switching tabs swaps the two sizes at once: FINAL has no transition between 16 and 24.
- **Not in FINAL:** disabled.
- **Responsive:** the row never scrolls or wraps at the reference width; at 200% text the three labels may not fit on one line: let the row scroll horizontally (`ScrollView horizontal`) rather than wrap, current tab kept in view. Lines never truncate.
- **Build (React Native):** `View` (flexDirection 'row', alignItems 'baseline') with three `Pressable` + `Text`. Line heights from the roles (`title` 30, `tab` 20); with these the row may grow from 48 to about 54: keep minHeight 48, let it grow.
- **Behaviour:** tap shows that tab's pane in place (Presets grid, Saved list, Check-ins calendar); Android Back on the Library tab goes to Home (§2 Navigation map; flows 4.8, 4.12).

#### Globe still (`GlobeStill`)  {#c-globe-still}
- **Used in:** L-1, L-11, X-2l (tile size); L-2, L-3, L-4, L-4b, L-6 (row size); L-6 (calendar size)
- **Anatomy:** a still frame of the scene's Globe orb (the same renderer as the live orb, frozen), faded out radially at its edge so no hard rim shows; optionally the On-now ring around it.
- **Size and spacing:** fixed, three sizes. *Tile:* a 132 x 126 slot; the visible Globe is about 120 across; the render is drawn at 2x the slot (264) and centred, with a radial fade: fully opaque to 46% of the half-size, 40% at 51%, clear at 58%. *Row:* 36 x 36 circle; render 1.5x (54), fade opaque to 66%, 40% at 74%, clear at 84%. *Calendar:* 34 x 34 circle, render 1.5x (51), same fade as the row, drawn 16% darker (FINAL: brightness 0.84) so the white date on it reads.
- **Type and colour:** no text. Colours come from the scene's palette (scene colour rules). On-now ring: component-local `#9a9186`, 2 dp stroke.
- **Variants and states:** *plain*; *On now* (the scene that is running): a 2 dp `#9a9186` ring. Tile: the ring is a 130 dp circle centred on the slot. Row and calendar: the ring sits 3 dp outside the still (row: 42 inner / 46 outer; calendar: 40 inner / 44 outer).
- **Not in FINAL:** loading (no placeholder is drawn while a still renders; FINAL has a flat fallback disc only if WebGL fails), error.
- **Responsive:** fixed size at every screen width and text size; never scales with the layout.
- **Build (React Native):** Skia `Canvas` sized to the slot; draw a cached `SkImage` of the Globe frame (render once per scene with an offscreen surface / `makeImageSnapshot`, then reuse), masked with a `RadialGradient` (alpha stops as above) via `Mask` or `BlendMode.DstIn`. Calendar size: add a `ColorMatrix` brightness 0.84. The ring is a plain `View` (borderRadius full, borderWidth 2) or a Skia `Circle` stroke. The Globe renderer itself belongs to MOTION.md.
- **Behaviour:** static; part of the tile, row or day it sits in (flows 4.8, 4.12).

#### Preset tile (`PresetTile`)  {#c-preset-tile}
- **Used in:** L-1, L-11, X-2l
- **Anatomy:** in a column, centred: Globe still (tile size) · name · sound line (note icon + track name) · scent line (scent icon + scent name).
- **Size and spacing:** the grid has 2 equal columns on phones (each `flex: 1`; see Responsive), no gap between tiles; grid padding top 8, left and right 16, bottom 24. Tile: padding top 12 (10), bottom 8, gap 16 between the still and the text (14). Text block: name, then 4 below it the sound line, then 2 below that the scent line (2 + 2 / 2). Icons 13 x 13, 4 from their text (5). Text lines are capped at 148 dp wide. At the reference size a tile is about 219 tall. The whole tile is one button.
- **Type and colour:** name `body-strong` `ink`; sound and scent lines `caption` (400) `text-muted`, icons `text-muted`.
- **Variants and states:** *default*; *On now* (L-11): the Globe still gets the On-now ring and the name gets `PlayingBars` (On-now size) before it.
- **Not in FINAL:** focus beyond the shared ring, disabled, loading.
- **Responsive:** columns stretch with the screen; the still stays fixed and centred in its column; name, sound and scent each stay on one line and end in "…" at 148 dp. Columns (the Layout rule): 2 on phones; 1 when the font scale is 1.5 or more (200% text); 3 when the content width is 600 dp or more.
- **Build (React Native):** `FlatList` with `numColumns` from the rule above (give the list a `key` that changes with it) and `columnWrapperStyle` for the side padding; each tile a `Pressable`, `GlobeStill`, `Text numberOfLines={1}` ×3 with `ellipsizeMode="tail"`, icons as SVG (react-native-svg) or Skia paths.
- **Behaviour:** tap opens the scene view on that preset, growing from the tapped still (animation in MOTION.md; flow 4.8 step 1).

#### Saved row (`SavedSceneRow`)  {#c-saved-scene-row}
- **Used in:** L-2, L-3, L-4 and L-4b (the rows that are not being edited)
- **Anatomy:** a row with two touch areas: the main area (Globe still, row size · name over second line) and, at the end, ⋯ (More).
- **Size and spacing:** min-height 64, stretches to the screen width. Main area: `flex: 1`, padding left 24, right 4, gap 16 between still and text; text column `flex: 1`, gap 2 between its lines. ⋯: 48 x 48, icon 20, 8 from the screen's right edge. Corner: none.
- **Type and colour:** name `body-strong` `ink`; second line `small` `text-muted`; ⋯ icon `text-muted`. Pen and trash icons `ink`.
- **Variants and states:**
  - *Second line per group:* Made by you: "[sound] · [scent]"; From check-ins: the check-in date ("Thu 22 Oct"); Based on presets: the preset it came from ("Ocean Drift").
  - *Open* (L-3): ⋯ is replaced by two icon buttons, pen (edit) and trash (delete), each 48 x 48 with a 20 icon and corner `full`, 4 from the right edge; the text column narrows and truncates sooner. Only one row is open at a time.
  - *On now:* the still gets the On-now ring and the name gets `PlayingBars` (same rule as tiles; drawn in FINAL on tiles and Check-ins rows).
  - *Editing:* the row is replaced by `SavedRowEditor` (L-4).
- **Not in FINAL:** disabled, a swipe-to-delete gesture (no hidden gestures).
- **Responsive:** row stretches; still and ⋯ fixed; name and second line one line each with "…". At 200% text the row grows taller (min-height 64 stays a minimum).
- **Build (React Native):** `View` row; main area and ⋯ are `Pressable`s; the open state renders two `Pressable`s side by side for pen and trash, each 36 wide so the icons sit 36 apart (FINAL overlaps two 48 targets by 12 to get the same spacing).
- **Behaviour:** main area opens the scene view (4.8); ⋯ opens the row; tapping anywhere else, or Android Back, closes it; pen → `SavedRowEditor`; trash → the row goes, message bar "Scene deleted · Undo" (flow 4.10 steps 1, 2, 5).

#### Group heading (`ListGroupHeading`)  {#c-list-group-heading}
- **Used in:** L-2, L-3, L-4 (Saved groups, sticky); L-6 (a night with two or more check-ins, not sticky)
- **Anatomy:** one line of text on the screen's ground.
- **Size and spacing:** stretches to the screen width; padding top 16 (14), left and right 24, bottom 8 (6); about 42 tall (38). No divider line.
- **Type and colour:** `caption-strong`, `text-muted`; background `ground` (so rows scroll under it unseen).
- **Variants and states:** *Saved group* (Made by you · From check-ins · Based on presets): sticky at the top of the Saved pane while its rows scroll; a group with no scenes has no heading. *Night heading* (Check-ins list): the night's date ("Wed 21 Oct"); scrolls with the list.
- **Not in FINAL:** pressed (not interactive), collapse.
- **Responsive:** one line; long text wraps (it never truncates: these are short labels). Grows with text size.
- **Build (React Native):** Saved: `SectionList` with `stickySectionHeadersEnabled` (it defaults to off on Android) and the heading as `renderSectionHeader`; Check-ins: a plain `Text` item.
- **Behaviour:** none; the group a scene goes in is fixed when it is first saved (flow 4.9); order inside a group is most recently set first.

#### Edit in the row (`SavedRowEditor`)  {#c-saved-row-editor}
- **Used in:** L-4, L-4b
- **Anatomy:** replaces the Saved row in place, top to bottom: (1) top line: Globe still (row size) + name field; (2) the name-rule line (L-4b, only when it has something to say); (3) heading "Sound"; (4) the sound row "[track] [category] ›"; (5) heading "Scent"; (6) the four scents as `ChoiceChip`s; (7) the action row Cancel · Save at the end.
- **Size and spacing:** stretches to the screen width; padding top 8 (6), left and right 24, bottom 16 (14). Top line: min-height 56, gap 16; the field `flex: 1`, 40 tall, no fill, a 1.5 dp `ink` underline only (component-local width). Headings: 12 above (10), 8 below (6). Sound row: stretches, min-height 48, gap 8, padding right 4, a 1 dp `outline-faint` line along its bottom; track name `flex: 1`, then the category, then a 16 chevron. Chips: wrap, gap 8 (6). Action row: 16 above (14), items at the end, gap 8; both buttons 44 tall, padding 0 16 (18), corner `full`.
- **Type and colour:** field text `body` `ink`; text selection ink at 16% (component-local); headings `caption-strong` `text-muted`; sound row track `body-strong` `ink`, category `caption` (400) `text-muted`, chevron `text-muted`; Cancel `body-strong` `ink` on no fill; Save `body-strong` `ground` on `charcoal`.
- **Variants and states:** *default* (L-4): the keyboard stays down until the field is tapped. *Taken name* (L-4b): `NameRuleHint` under the field, aligned with the field's start (52 + 24 in FINAL = the field's left edge), "“Golden Hour” is taken · saves as “Golden Hour 2”"; Save stays on and saves the numbered name. *Count* from 25 characters: "27 of 30" (same line). *Empty name:* Save is disabled (the disabled rule). *New sound chosen:* the sound row shows the new track and category after L-13's Choose.
- **Not in FINAL:** a focus look for the underlined field (no change on focus), an error state.
- **Responsive:** stretches; still and buttons fixed; field shrinks with `minWidth: 0`; the track name ends in "…"; chips wrap onto more lines; the name-rule line wraps (two messages stack). At 200% text everything grows and wraps; Cancel / Save stay end-aligned and may wrap under each other only if they cannot fit side by side.
- **Build (React Native):** `View`; field `TextInput` (maxLength 30, `autoFocus={false}`, `returnKeyType="done"`, `onSubmitEditing` = Save, `selectionColor` ink at 16%); sound row `Pressable`; action buttons `Pressable` (Save `disabled` when the name is empty). Scroll the editor into view when it opens (`scrollToItem`, view position nearest). Android Back cancels.
- **Behaviour:** Sound › opens L-13; Cancel / Back: nothing changes; Save: message bar "Changes saved" (sound or scent changed) or "Renamed" (only the name) (flow 4.10 steps 2 to 4; name rule §3.6).

#### Name-rule line (`NameRuleHint`)  {#c-name-rule-hint}
- **Used in:** L-4b (under the in-row field), L-15 (under the sheet's field), R-7b and R-7c (under the Remote's field), R-6b (scent rename)
- **Anatomy:** one or two stacked messages: the taken-name message, then the count.
- **Size and spacing:** stretches to the field's width. L-15: 8 below the field. L-4b: starts at the field's left edge; FINAL renders it with padding top 16 (14), bottom 8 (6) inside the editor.
- **Type and colour:** `micro` `text-muted` everywhere (FINAL's L-4b picks up the list heading's `caption-strong` by accident). Each message on its own line.
- **Variants and states:** *hidden* (fewer than 25 characters and the name is free); *count* "27 of 30" (from 25 characters); *taken* "“[name]” is taken · saves as “[name] 2”" *(provisional copy)*; *both* (stacked).
- **Not in FINAL:** an error colour (the line is never red: a taken name is not an error).
- **Responsive:** wraps; never truncates.
- **Build (React Native):** `Text` per message inside a `View`.
- **Behaviour:** updates as you type (name rule, SCREENS §3.6).

#### Chip (`ChoiceChip`)  {#c-choice-chip}
- **Used in:** L-4, L-4b (the four scents)
- **Anatomy:** a pill with a text label.
- **Size and spacing:** height 36, hugs its label, padding left and right 12, corner `full`, 1 dp border. Gap 8 between chips (6).
- **Type and colour:** `caption` (500). Unselected: text `ink`, border `outline-faint`, no fill. Selected: text `ground`, fill and border `charcoal`.
- **Variants and states:** *selected* (the scene's current scent; exactly one in the group) and *unselected*.
- **Not in FINAL:** disabled, focus beyond the shared ring.
- **Responsive:** chips hug and wrap to the next line; labels never truncate (the longest, "Warm Apple Crumble", is about 152 wide). At 200% text more lines.
- **Build (React Native):** `Pressable` + `Text`; the group is a single choice.
- **Behaviour:** tap selects that scent (UI only; nothing is sent; flow 4.10 step 2).

#### Sounds screen (`SoundPickerScreen`)  {#c-sound-picker-screen}
- **Used in:** L-13, L-13b, L-13c, L-13d, L-13e, L-13f, L-13g
- **Anatomy:** full screen over the Library, no tab bar, top to bottom: header (× · "Sound" · "For [scene] · now [sound]") · `SoundSearchField` · `CategoryTabs` (Ambient · Music) · the track list (`TrackRow`s) or an empty line · **Choose [track]** pinned at the bottom (only after a change).
- **Size and spacing:**
  - Header: × is 48 x 48 (icon 20), 4 from the left edge; "Sound" and the "For …" line form a column starting 4 after the × (56 from the edge), with the title vertically centred on the × and the "For …" line directly under the title. Right margin 24.
  - Search field: 16 below the header (14), 16 from each side.
  - Category tabs: 12 below the search field, 24 from each side.
  - List: 12 below the tabs, `flex: 1`, scrolls; padding top 8, bottom 16; bottom 92 while Choose shows (functional: clears the button).
  - Choose [track]: 16 from each side, 16 above the screen's bottom edge, height 52 (a main action), corner `full`, padding 0 24 (20).
  - The screen ends 16 above the bottom edge (the gesture area shows the ground colour).
- **Type and colour:** background `ground`; × `ink`; "Sound" `headline` `ink`; "For [scene] · now [sound]" `small` `text-muted`; Choose label `body-strong` `ground` on `charcoal`, with a soft shadow below (FINAL: 0 8 20 -10, ink at 45%).
- **Variants and states:**
  - *Opened* (L-13): on the current sound, its row tinted and marked "In this scene"; the list is scrolled so that row is centred.
  - *A different track chosen* (L-13b): the tint moves to the chosen row ("Chosen"); the original keeps "In this scene" (untinted); **Choose [track]** appears.
  - *Searching* (L-13c): results from both categories, each row adds its category; `CategoryTabs` dimmed; the field shows its ×.
  - *Nothing matches* (L-13d): one line in the list area, "Nothing matches “[query]”." (no button).
  - *No tracks here yet* (L-13f): one line in the list area, "No tracks here yet.".
  - Empty lines: padding 8 24, `body` `ink`.
  - *Preview playing* (L-13e) and *speaker unavailable* (L-13g): see `TrackRow` and `SoundUnavailableLine`. L-13g shows only the line under the row: no connection line at the top.
- **Not in FINAL:** loading the track list, a disabled Choose (it is hidden until there is a change instead). FINAL's "Previews play on the lamp." line exists in code but is hidden: do not build.
- **Responsive:** header column `flex: 1` with the "For …" line on one line ending in "…"; search and Choose stretch; the list fills the remaining height. At 200% text the header and tabs grow, the list keeps scrolling and Choose stays pinned (SCREENS §3.8); the Choose label ends in "…" if the track name is long.
- **Build (React Native):** a full-screen stack route (no tab bar; FINAL's 36 dp top corners belong to the prototype's phone frame and are not drawn on a device); `FlatList` for tracks with `initialScrollIndex` / `scrollToIndex` centred on the current row (`getItemLayout` with 56 dp rows); × and Choose `Pressable`s, Choose's shadow via RN `boxShadow` (New Architecture) or `elevation`. Keyboard opens only when the search field is tapped.
- **Behaviour:** tap a row to choose it; ▶ previews on the speaker; Choose → back to the editor with the new sound; × / Back → back, old sound kept, no prompt (flow 4.10 step 3; previews 4.17).

#### Search field (`SoundSearchField`)  {#c-sound-search-field}
- **Used in:** L-13 to L-13g
- **Anatomy:** filled pill: search icon · text input with placeholder "Search sounds" · clear × (only while there is a query).
- **Size and spacing:** stretches between 16 margins, 40 tall, corner `full`, no border. Icon 18, 16 from the start (14), 8 before the text (7). Clear ×: 44 x 38 at the end, icon size 22 (an icon, not text).
- **Type and colour:** fill `surface`; icon `text-muted`; input `body` `ink`; placeholder `text-muted`; × `ink`.
- **Variants and states:** *empty*; *with a query* (× shows); *focused*: a 1.5 dp `charcoal` ring inside the edge (FINAL: inset box-shadow).
- **Not in FINAL:** disabled, error.
- **Responsive:** stretches; icon and × fixed; text scrolls inside the field. At 200% text the field grows to fit the line.
- **Build (React Native):** `Pressable` wrapper (tap anywhere focuses the input) containing icon, `TextInput` (`returnKeyType="search"`, `autoCorrect={false}`), and × `Pressable`. Focus ring: `borderWidth` 1.5 `charcoal` on focus (inside the 40 height, no layout jump: keep a transparent 1.5 border when unfocused).
- **Behaviour:** filters as you type across both categories (every word must match a word start; accents ignored); × clears and returns to the current category scrolled to the current sound (flow 4.10 step 3).

#### Category tabs (`CategoryTabs`)  {#c-category-tabs}
- **Used in:** L-13 to L-13g
- **Anatomy:** two text tabs, Ambient · Music, same pattern as `LibraryHeadingTabs`.
- **Size and spacing:** row 36 tall, gap 24 (20), baseline-aligned; each tab padding top 12, bottom 2, hugs its label.
- **Type and colour:** current `title` `ink`; other `tab` `text-muted`.
- **Variants and states:** *current / not current*; *dimmed while searching* (L-13c, L-13d): no tab is current, both at `tab` size, `text-muted`, `opacity.dimmed`.
- **Not in FINAL:** disabled.
- **Responsive:** one row, never wraps at reference width; at 200% text it grows taller.
- **Build (React Native):** as `LibraryHeadingTabs`.
- **Behaviour:** tap switches the list; tapping a tab while searching clears the search (flow 4.10 step 3).

#### Track row (`TrackRow`)  {#c-track-row}
- **Used in:** L-13, L-13b, L-13c, L-13e, L-13g
- **Anatomy:** a rounded row with two touch areas: the choose area (track name; under it the category while searching, then the status line when there is one) and the round play button ▶ at the end.
- **Size and spacing:** min-height 56; inset 16 from each side; padding left 8 (so text starts at 24); corner `row`. Choose area `flex: 1`, text column centred vertically. Play button 48 x 48, corner `full`, icon 14.
- **Type and colour:** name `body-strong` `ink`; category (search results only) `caption` (400) `text-muted`, directly under the name; status line `small` `text-muted`; play icon `text-muted`, or `ink` when the row is chosen or playing.
- **Variants and states:**
  - *In this scene*: the scene's current sound. Tinted `surface` while it is the selection; status "In this scene" stays on it even after another row is chosen.
  - *Chosen* (L-13b): row fill `surface`, status "Chosen", play icon `ink`.
  - *Playing on the lamp* (L-13e): status "Playing on the lamp", ▶ becomes ⏸, the play button gets a `surface` fill; only one row plays at a time.
  - *Plain*: no fill, no status line.
  - *Speaker unavailable* (L-13g): ▶ does nothing; the row stays as it was and `SoundUnavailableLine` appears under it.
- **Not in FINAL:** disabled rows, loading while a preview starts.
- **Responsive:** row stretches; play button fixed; name one line with "…"; status and category one line each. At 200% text rows grow taller (56 is a minimum).
- **Build (React Native):** `View` row; choose area and play button are `Pressable`s. Icons: SVG paths.
- **Behaviour:** tap the row to choose it (Choose appears); ▶ plays a preview on the speaker, again or another ▶ stops or switches (flows 4.10 step 3, 4.17).

#### Speaker-unavailable line (`SoundUnavailableLine`)  {#c-sound-unavailable-line}
- **Used in:** L-13g
- **Anatomy:** one line under the row whose ▶ was tapped: "Sound unavailable" · **Try again** at the end.
- **Size and spacing:** stretches to the screen width, min-height 48, padding left 24, right 8, space-between; Try again 48 tall, padding 0 16.
- **Type and colour:** message `small-strong` `text-muted`; Try again `small-strong` `problem`.
- **Variants and states:** *shown* under the tapped row; *gone* once Try again succeeds or another action replaces it.
- **Not in FINAL:** a loading look while retrying.
- **Responsive:** message `flex: 1` and wraps; Try again fixed and end-aligned.
- **Build (React Native):** `View` row with `Text` and a `Pressable`; insert it as an extra list item after the row.
- **Behaviour:** choosing a track still works (it is data); Try again retries the preview (flow 4.10 branch; 4.17 branch).

#### Calendar (`CheckInCalendar`)  {#c-check-in-calendar}
- **Used in:** L-6, L-9, L-10
- **Anatomy:** month bar ("[Month]" ▾ as one button · ‹ · ›) · weekday letters M T W T F S S · the month's days in a 7-column grid (`CalendarDay`).
- **Size and spacing:** block padding top 4, bottom 12 (10). Month bar: min-height 48; the month button hugs its label with padding 0 8 and gap 8 between label and ▾ (18 icon), its text starting at the 24 screen margin (FINAL: 14 + 10); ‹ and › are 48 x 48 (icons 18), pushed to the end, 8 from the right edge. Grid: 7 equal columns (`flex: 1` each; about 46 at the reference size), side padding 16 (18); weekday row 18 tall; day rows 48 tall, no gaps.
- **Type and colour:** month `title-small` `ink`; ▾ `text-muted`; ‹ › `ink`; weekday letters `micro` `text-muted`.
- **Variants and states:**
  - *Month with check-ins* (L-6): days with a check-in carry a Globe still.
  - *This month before its first check-in* (L-9): plain days only, today's number marked (see `CalendarDay`); under the grid `LibraryEmptyState` "No check-ins yet this month." + Check in.
  - *A month with none* (L-10, from ‹): plain days; under the grid "No check-ins in [month]." in `small` `text-muted`, margins 8 24 24.
  - *› disabled* on the current month and *‹ disabled* on the oldest month: the disabled rule (icon `text-disabled`), not pressable.
- **Not in FINAL:** swipe between months.
- **Responsive:** columns stretch evenly; day cells keep 48 height; month label one line (never truncated: month names are short). At 200% text the grid keeps 7 columns; dates and letters grow inside fixed cells.
- **Build (React Native):** the calendar is the `ListHeaderComponent` of the month's check-ins list (they scroll together). Month button and arrows are `Pressable`s (arrows `disabled` at either end).
- **Behaviour:** "[Month] ▾" → year view (L-7); ‹ / › → previous / next month (flow 4.12 steps 1, 2).

#### Calendar day (`CalendarDay`)  {#c-calendar-day}
- **Used in:** L-6, L-9
- **Anatomy:** a cell: either a plain date number, or a Globe still (calendar size) with the date centred on it.
- **Size and spacing:** fills its column, 48 tall, content centred. Still 34. Empty cells before the 1st are blank spacers of the same size.
- **Type and colour:** plain date `micro` `text-muted`; today without a check-in `status` `ink` (FINAL: 12 / 600); date on a still `status` component-local `#ffffff` with a soft shadow (ink at 32%, radius 3).
- **Variants and states:** *plain* (not pressable); *today, no check-in* (darker, bolder number); *with a check-in* (the night's latest check-in's still, pressable); *tonight On now* (the still keeps its On-now ring). Two or more check-ins in one night still show one still.
- **Not in FINAL:** a marker for days with several check-ins.
- **Responsive:** fixed still in a stretching cell.
- **Build (React Native):** plain day: `Text`; check-in day: `Pressable` with `GlobeStill` and an overlaid `Text` (`textShadowColor` ink at 32%, `textShadowRadius` 3).
- **Behaviour:** tap → scene view on that night's latest check-in, with this month's check-ins as the swipe list (flow 4.12 step 3).

#### Check-in row (`CheckInRow`)  {#c-check-in-row}
- **Used in:** L-6
- **Anatomy:** Globe still (row size) · name over second line. One touch area, no ⋯.
- **Size and spacing:** min-height 64, stretches; padding left and right 24, gap 16; text column `flex: 1`, gap 2.
- **Type and colour:** name `body-strong` `ink`; second line `small` `text-muted`.
- **Variants and states:** *single check-in in a night*: second line "[day date] · [time]" ("Thu 22 Oct · 21:42"), tonight's "Tonight · 21:42"; *under a night heading* (several in one night): second line is the time only ("22:05"); *On now* (tonight's set scene): `PlayingBars` before the name and the On-now ring on the still.
- **Not in FINAL:** ⋯ / delete (check-ins are kept indefinitely).
- **Responsive:** as `SavedSceneRow`: one line each with "…", grows at 200% text.
- **Build (React Native):** `Pressable` row, `GlobeStill`, two `Text numberOfLines={1}`; list items of the same `FlatList` as the calendar header.
- **Behaviour:** tap → scene view with that month's check-ins as the swipe list (flow 4.12 step 3).

#### Year view (`YearView`)  {#c-year-view}
- **Used in:** L-7
- **Anatomy:** replaces the calendar and list inside the Check-ins pane: for each year (oldest first), a sticky year heading, then its months as `YearMonthTile`s in two columns. Tabs stay above.
- **Size and spacing:** padding top 4, left and right 16, bottom 24. Year heading: padding 8 (8 8 6), on `ground`, sticky. Month grid: 2 equal columns, row gap 12 (10), column gap 16 (14).
- **Type and colour:** year `title-small` `ink`.
- **Variants and states:** opens scrolled to the month you were on; the year headings stay at the top while you scroll.
- **Not in FINAL:** a title (none by decision), a close control: Android Back returns to the month you were on.
- **Responsive:** columns stretch; at 200% text tiles grow taller; two columns kept.
- **Build (React Native):** `SectionList` (sticky headers on) with each section's months chunked into rows of two (SectionList has no `numColumns`); `initialScrollIndex` / `scrollToLocation` to the current month. The zoom between calendar and year view is an animation in MOTION.md.
- **Behaviour:** tap a month → its calendar and list; Back → the month you came from (flow 4.12 step 1).

#### Month tile (`YearMonthTile`)  {#c-year-month-tile}
- **Used in:** L-7
- **Anatomy:** month name · a 7-column mini calendar: day numbers, and a small coloured dot instead of the number on nights with a check-in.
- **Size and spacing:** fills its column; padding top 8, sides 8 (6), bottom 12 (10); corner `row` (FINAL 14). Month name 8 above the grid (6), inset 2. Mini grid rows 18 tall, row gap 2; dots 14 across, 2 above and below.
- **Type and colour:** month name `tab` `ink`; day numbers `micro` `text-muted`; today without a check-in `status` `ink` (FINAL 700); dots: the scene's colours as a radial gradient (light spot at 36% / 30%, scene colour rule).
- **Variants and states:** *current month* (the one you came from): fill `surface`; *past month*: pressable (also with no check-ins: it leads to L-10); *future month*: the whole tile at `opacity.dimmed`, not pressable.
- **Responsive:** stretches with its column; grid columns `flex: 1`; month name one line.
- **Build (React Native):** `Pressable` (`disabled` for future months); dots as small Skia `Circle`s with a `RadialGradient`; numbers `Text`.
- **Behaviour:** tap → that month (flow 4.12 step 1).

#### Library empty state (`LibraryEmptyState`)  {#c-library-empty-state}
- **Used in:** L-5 (Saved), L-8 (Check-ins), L-9 (this month, under the calendar); L-10 (line only)
- **Anatomy:** a centred line of text · an outline button.
- **Size and spacing:** L-5 and L-8: block 24 from each side, 150 below the top of the pane (FINAL's placement; it does not centre); L-9: under the calendar, padding top 24 (20), sides 24. Button 16 below the text (L-5, L-8: 18). Outline button: 52 tall, hugs its label, padding 0 24, corner `full`, 1 dp border.
- **Type and colour:** text `title-small` `ink`, centred; button label `body-strong` `ink`, border `charcoal`, no fill.
- **Variants and states:** L-5 "Scenes you save live here." + **Go to Remote**; L-8 "Each evening's check-in shows up here." + **Check in**; L-9 "No check-ins yet this month." *(provisional)* + **Check in**. L-10 is different in FINAL: "No check-ins in [month]." in `small` `text-muted`, start-aligned, no button (see `CheckInCalendar`).
- **Not in FINAL:** disabled.
- **Responsive:** text wraps (L-8 wraps to two lines at the reference size); button hugs and stays centred.
- **Build (React Native):** `View` (alignItems 'center') with `Text` and `Pressable`.
- **Behaviour:** Go to Remote → Remote tab; Check in → Home's check-in (§2 Navigation map; flow 4.2).

#### Scene view (`SceneView`)  {#c-scene-view}
- **Used in:** L-12, X-4d
- **Anatomy:** full screen, no tab bar, over the crochet backdrop: top block (× at the start, ⋯ at the end for a saved scene; `SceneNameStrip`; subheading) · middle (the orb slot; the line; `SceneSoundLine`; `SceneScentLine`) · bottom block (`SceneViewActions`).
- **Size and spacing:**
  - × and ⋯: 48 x 48, icons 20, 4 from the left / right edge, in the top bar, 8 below the top inset (the page header's height; FINAL 6 higher).
  - Name strip: 76 tall, directly under the top bar (6 gap in FINAL → 8).
  - Subheading: directly under the strip (2), 24 from each side, centred.
  - Orb slot: sized and placed by the Layout rule, in exactly the same place as Home's orb (use the same function as `HomeStage` so the two can never drift; at the reference size it is 176 with its centre 352 dp from the top). The orb, its glow and its growth from a tapped still belong to MOTION.md.
  - Line: 36 below the orb slot (the same orb-to-line distance as Home's line), 32 from each side, centred.
  - Sound and scent lines: a centred column 16 below the line (FINAL: line box 476–500, details from 516), gap 4.
  - Bottom block: anchored to the bottom; see `SceneViewActions`.
- **Type and colour:** background `ground` with the backdrop (Skia, MOTION.md); × and ⋯ `ink`; subheading `small` `ink`; line `body` `ink`.
- **Variants and states:**
  - *Subheading text:* preset "Preset"; saved "Saved by you" (or "From a check-in · [date]"); check-in "[Tonight / date] · [time]". *On now:* `PlayingBars` (On-now size, 0.8 em) then "On now · [the same text]".
  - *⋯:* only for a saved scene. *Save as a scene:* only for a check-in (see actions).
  - *"Set at" line:* FINAL's code has it but hides it (the subheading already gives the time). Do not build.
  - *First-time hint "Swipe for the next one":* FINAL has the element (centred, `caption` (400) `ink`, below the Save as a scene slot) but never draws it, because it is first-run only. Build it to that description, shown once ever (flow 4.8 step 1).
- **Not in FINAL:** a loading state while the backdrop and orb prepare.
- **Responsive:** top block fixed height at the top; the orb slot follows Home's stage rule; the line wraps (it never truncates); bottom block pinned. Between the middle and the bottom block a flexible spacer absorbs extra height. At 200% text the middle scrolls (SCREENS §3.8) and Set the scene stays pinned.
- **Build (React Native):** a full-screen modal route (`View`); × and ⋯ are `Pressable`s. Swiping the whole view sideways changes scene: a horizontal pan (react-native-gesture-handler or `PanResponder`) driving Reanimated shared values for the strip, the orb and the backdrop together (MOTION.md). Android Back closes, nothing changed.
- **Behaviour:** × / Back → back to the tab, the set scene marked On now (L-11); ⋯ → closes and opens that row in Saved (L-3); swipe or tap a neighbour's name → the next scene in the same tab (flow 4.8 steps 2, 4c, 5).

#### Name strip (`SceneNameStrip`)  {#c-scene-name-strip}
- **Used in:** L-12, X-4d
- **Anatomy:** a horizontal track of the tab's scene names: the current one centred, the neighbours on either side cut off by the screen edges.
- **Size and spacing:** strip stretches to the screen width, 76 tall, clips its content. Each name slot is 61% of the screen width (220 at 360; FINAL a fixed 220) with padding 0 12 (10), 76 tall, no gap; the current slot is centred, so the neighbours show about 46 dp each at 360 and stay equally cut off at every width.
- **Type and colour:** names `headline` `ink`, centred, up to 2 lines; names longer than 18 characters step down to `title` (FINAL 22). Neighbours: scaled to 0.78 and at 48% opacity (component-local).
- **Variants and states:** *current* (full size, full opacity); *neighbour* (0.78 scale, 48%); *dragging* (both follow the finger: MOTION.md). First and last scene: no neighbour on that side.
- **Responsive:** slot width 61% of the screen; names wrap to 2 lines, then "…".
- **Build (React Native):** `Animated.View` row of `Pressable`s (Reanimated `translateX`, `scale`, `opacity`); names `Text numberOfLines={2}`.
- **Behaviour:** tap a neighbour → that scene (flow 4.8 step 2).

#### Sound line and scent line (`SceneSoundLine`, `SceneScentLine`)  {#c-scene-sound-line}
- **Used in:** L-12, X-4d
- **Anatomy:** sound line: a button with ▶ icon (or `PlayingBars`, sound-line size, while playing) and the underlined text "[Ambient / Music] · [track]"; scent line: scent icon + scent name (not a button).
- **Size and spacing:** sound line hugs its content, min-height 44, padding 0 12, gap 8 (6), corner `full`; it overlaps the line spacing (FINAL margins -6 top, -8 bottom) so the two text lines sit 4 apart. ▶ 14; scent icon 16, gap 8 (6).
- **Type and colour:** both `small` `ink`; the sound text underlined (1 dp, 3 below the text in FINAL).
- **Variants and states:** *not playing* (▶); *playing* (the bars move in ▶'s place). Swiping to another scene switches the preview with it.
- **Not in FINAL:** disabled, an unavailable message here (FINAL shows none in the scene view).
- **Responsive:** both lines centred, one line each; long track or scent names wrap inside the 24 margins.
- **Build (React Native):** `Pressable` with `Text` `textDecorationLine: 'underline'` (Android draws its own thickness and offset); scent line `View` + `Text`.
- **Behaviour:** tap plays this scene's sound on the speaker, again stops (flows 4.8 step 3, 4.17).

#### Scene view actions (`SceneViewActions`)  {#c-scene-view-actions}
- **Used in:** L-12, X-4d
- **Anatomy:** bottom block, top to bottom: the problem line (X-4d only) · **Set the scene** · **Save as a scene** (check-in views only).
- **Size and spacing:** Set the scene stretches between 24 margins, 52 tall, corner `full`, padding 0 24. Save as a scene: 8 below it (6), hugs, centred, min-height 48, padding 0 16. The problem line: 12 above Set the scene (11), 24 from each side, centred. The block keeps the Save as a scene slot even when it is absent, so Set the scene never moves; at the reference size Set the scene's bottom is 144 above the screen's bottom edge.
- **Type and colour:** Set the scene `body-strong` `ground` on `charcoal`; Save as a scene `body-strong` `ink`, underlined (4 below the text in FINAL), no fill; problem line `small-strong` `problem`.
- **Variants and states:**
  - *Set the scene* (default, scene not on).
  - *Setting the scene…* (sending): label changes, busy (the busy rule).
  - *Gone:* 1.5 s after sending, the button goes and the subheading gains "On now"; it is absent whenever the viewed scene is already on.
  - *Can't reach the lamp* (X-4d): the problem line appears and the button becomes the fix: "Can't connect. Move closer and try again." + **Try again**; "Bluetooth is off." + **Turn on Bluetooth**; "Allow nearby devices to connect." + **Open settings**. The connection line at the top is hidden meanwhile.
  - *Save as a scene:* only in a check-in's view; it stays after the scene is set.
- **Responsive:** Set the scene stretches; its label stays one line; the problem line wraps. At 200% text the block grows upward and stays pinned.
- **Build (React Native):** `View` anchored with `marginTop: 'auto'`; `Pressable`s ("Setting the scene…" is `disabled` with `accessibilityState={{ busy: true }}`, drawn with the busy rule). Haptic on send: MOTION.md.
- **Behaviour:** Set the scene sends, the Light bloom plays, "Sent to your room · Undo" at 3.0 s, the view stays open (flow 4.8 step 4; failures §4.0, state 17); Save as a scene opens `NamingSheet` (4.8 step 4b).

#### Naming sheet (`NamingSheet`)  {#c-naming-sheet}
- **Used in:** L-15
- **Anatomy:** scrim over the scene view · a sheet from the bottom: title "Save as a scene" · name field · `NameRuleHint` · action row Cancel · Save.
- **Size and spacing:** scrim covers the screen. Sheet stretches to the screen width, anchored to the bottom, top corners `sheet`, padding top 24 (26), sides 24, bottom 32 (34). Title 16 above the field (14). Field stretches, 52 tall, corner `row`, 1 dp border, padding 0 16 (14). Action row 16 below (18), items at the end, gap 8; buttons 48 tall, padding 0 24, corner `full`.
- **Type and colour:** scrim `scrim`; sheet `ground`; title `title` `ink`; field text `body` `ink`, border `outline`, field fill `ground` (FINAL `#fffdf9`); Cancel `body-strong` `ink`, no fill; Save `body-strong` `ground` on `charcoal`.
- **Variants and states:** *open* (the field starts with the mood's name, numbered if taken, and is focused); *focused field*: a 2 dp `ink` ring 1 outside the field; *count* and *taken* via `NameRuleHint`; *empty*: Save disabled (the disabled rule).
- **Not in FINAL:** a drag handle or drag-to-dismiss.
- **Responsive:** sheet stretches and sits above the keyboard (`KeyboardAvoidingView` / `adjustResize`); the field text scrolls inside; the hint wraps. At 200% text the sheet grows upward.
- **Build (React Native):** `Modal` (transparent, `statusBarTranslucent`) with a `Pressable` scrim (= Cancel) and the sheet `View`; `TextInput` maxLength 30, `autoFocus`, `returnKeyType="done"` → Save; focus ring as in the shared focus note. Android Back cancels.
- **Behaviour:** Save → saved unchanged under "From check-ins" with "From a check-in · [date]", message bar "Saved"; Cancel, scrim or Back → nothing saved (flow 4.8 step 4b; name rule §3.6).

## Do's and Don'ts

### Do:
- **Do** use only token names in components (`color.ink`, `typography.body-strong`, `space.lg`, `radius.full`); a raw hex or number in a component is a bug.
- **Do** keep one filled `charcoal` button per screen, at the bottom.
- **Do** build with flex and the zones in Layout; let the orb and lists adapt to the screen.
- **Do** build every tappable on the one shared `Pressable` wrapper, and every disabled button with the one disabled rule (Components).
- **Do** treat FINAL as the look and SCREENS_AND_FLOWS as the behaviour; when this file and FINAL disagree, this file wins (START_HERE, Document priority).

### Don't:
- **Don't** copy FINAL's absolute positions, `color-mix()` blends, CSS gradients or `clamp()` sizes into React Native; use the tokens and the Skia notes here.
- **Don't** put saturated colour in text, icons or buttons (the Light Is the Hero Rule).
- **Don't** add drop shadows, cards around moments, or a second filled button.
- **Don't** invent states FINAL doesn't have (each component lists what's missing); ask.
- **Don't** use Roboto or the system font for app text; bundle Source Serif 4 and Hanken Grotesk.
