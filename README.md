# Wellness Lamp

Wellness Lamp is a React Native app for choosing ambient colors, mapping a short mood questionnaire to a palette, and sending light and sound controls to BLE hardware. The Android app is in `app/WellnessLamp`; the firmware and supporting palette files are kept alongside it.

## App features

- **Glow:** view the selected palette, adjust animation mode, speed, and brightness, and send a synchronized color command to a WellnessLamp device.
- **Feel:** answer mood questions and get an offline palette match.
- **Themes and Hue:** choose a preset palette or make a custom color selection.
- **Sound:** connect to an MP3Controller and control playback, track selection, and volume.

The app can be built without the lamp hardware. BLE controls require compatible powered hardware; use a physical Android device to validate Bluetooth behavior.

## Project layout

- `app/WellnessLamp/` — React Native app, Android project, and iOS project.
  - `App.tsx` — screen selection and shared app state.
  - `src/screens/` — Glow, Feel, Themes, Hue, and Sound screens.
  - `src/components/` — reusable UI, palette display, and carousel components.
  - `src/data/`, `src/theme/`, `src/services/` — questions, mood matching, palettes, and BLE services.
- `firmware/latest_multi_node/` — latest multi-node ESP32 firmware (`WellnessLamp.cpp` and Arduino entry point `firmware.ino`).
- `firmware/old_firmware/` — previous firmware version.
- `misc/` — palette images, palette source data, generator script, and a questions CSV for reference.
- `Music/` — local audio/video library; it is not bundled into the React Native app.

The Android project is configured to bundle the JavaScript into debug APKs, so the installable debug APK does not need Metro running.

## Requirements

- Node.js **22.11 or newer** (`package.json` sets the engine requirement).
- pnpm.
- Java JDK 17 or newer.
- Android Studio and Android SDK Platform 36, Android build tools 36.0.0, and NDK 27.1.12297006. Android Studio's SDK Manager can install these components.
- An Android emulator or USB-debuggable Android device to install and run the app.

## Install JavaScript dependencies

Run commands from the app directory:

```sh
cd app/WellnessLamp
pnpm install
```

Use pnpm for Node package installation. The first `pnpm install` may create `pnpm-lock.yaml`; keep that lockfile with the project so future installs can use `pnpm install --frozen-lockfile`.

## Run the app during development

In terminal 1, start Metro:

```sh
cd app/WellnessLamp
pnpm start
```

In terminal 2, build and launch on a connected Android device or running emulator:

```sh
cd app/WellnessLamp
pnpm android
```

Confirm a device is visible before launch with `adb devices`. If `adb` is not on `PATH`, run it from your Android SDK's `platform-tools` directory.

## Build and install a test APK

Build a debug-signed APK from the app directory:

```sh
cd app/WellnessLamp/android
./gradlew assembleDebug
```

The APK is written to:

```text
app/WellnessLamp/android/app/build/outputs/apk/debug/app-debug.apk
```

Install or update it on a connected Android device:

```sh
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

This is a debug build for development and testing, not a Play Store release. With `debuggableVariants = []` in `android/app/build.gradle`, Gradle bundles the JavaScript in the APK; Metro is not required to launch this APK.

## Tests and lint

From `app/WellnessLamp`:

```sh
pnpm test -- --watchAll=false
pnpm lint
```

## Firmware notes

The app's BLE services expect the device names and command protocol implemented by the firmware. The current multi-node firmware source is in `firmware/latest_multi_node/`. Review the pin, LED count, radio channel, and network ID settings in that firmware for the target hardware before flashing it. The app does not flash firmware.

## Git and local files

This repository is rooted at this folder. The workspace `.gitignore` excludes `Music/`, temporary files, build output, dependencies, local credentials, and nested Git metadata. The app's own `.gitignore` also excludes Android/iOS build output, installed dependencies, and local caches.
