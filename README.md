# okoshiteYO

React Native (Expo) UI prototype for the 「おこしてYO！」 alarm app. The focus is on layout/composition only—no native alarm APIs are wired yet, so it is safe to iterate on visuals before hooking into Android/iOS services.

## What’s included
- **Home / Alarm board**: shows the next alarm hero card and a list of mock alarms with action badges.
- **Editor**: lightweight form mock for time, repeat days, and action selection. Action cards jump into a dedicated preview screen.
- **Settings**: lets you pick the default wake-up action and shows placeholder toggles for sound/stat tracking.
- **Action preview**: full-screen mock of each “絶対起こすマン” challenge (計算 / シェイク / 証拠ショット).

All screens share the same brand palette (sunrise orange + midnight ink) so they can be dropped into presentation slides or screen flows.

## Getting started
1. Install dependencies (needs Node 18+):
   ```bash
   npm install
   ```
2. Launch the Expo dev server:
   ```bash
   npm start
   ```
3. From the Expo menu, run on Android emulator/device first (iOS can follow once native alarm handling is added).

The mock data lives in `src/data/alarms.ts`. Update it to try different personas, repeat patterns, or action copy while keeping the UI stable.

## Next implementation steps
1. Bridge Android’s `AlarmManager` + `ForegroundService` to trigger the RN screens when alarms fire.
2. Mirror the behavior on iOS with `UNUserNotificationCenter` (action UI opens after the notification is tapped).
3. Replace the static editor state with a proper store (e.g., Zustand, Jotai, or Redux Toolkit) and persist to SQLite/WatermelonDB.
