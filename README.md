# Stellar Drift

A space-themed habit tracker with a roguelike skeleton and a captain progression system.

The point: voyages have a beginning and an end. There is no infinite streak to protect.
Each voyage runs from your current location to a chosen destination — duration is determined
by the destination's distance and your ship's velocity. When the voyage ends — completed or abandoned —
your captain earns XP, possibly unlocking new ship hulls and farther destinations.

## Captain progression

XP is awarded **at voyage end only**, never per-day. This keeps the run as the unit of progression
and avoids streak-shame.
- Completion grants `100 + round(avgCompletionRate × durationDays × 2)` XP
- Abandonment grants `round(avgCompletionRate × daysCompleted × 1)` XP — thoughtful pulls still teach the captain something

Eight ranks, 1 (Cadet) → 8 (Admiral). Each rank unlocks new ship hulls with longer max ranges
and higher cruise velocities, opening up farther destinations.

## Stack

- Vue 3 (Composition API, `<script setup>`)
- Vite
- Pinia (state)
- Vue Router
- Plain CSS with design tokens (no Tailwind, no UI library — full control over the aesthetic)
- localStorage for persistence (abstracted via `usePersistence.js` so a real backend can drop in later)

## Run it

```bash
npm install
npm run dev
```

## Architecture

```
src/
├── main.js                     ← entrypoint
├── App.vue                     ← shell + masthead nav + LevelUpModal
├── router/index.js             ← routes
├── data/
│   ├── ships.js                ← ship catalog (rank gates, range, velocity, bonuses)
│   └── destinations.js         ← destination catalog (distance, prose, rank gates)
├── stores/
│   ├── expedition.js           ← run lifecycle + meta-progression
│   ├── habits.js               ← habit definitions + daily logs + avg-completion helper
│   └── captain.js              ← XP, ranks, level-up queue
├── composables/
│   ├── usePersistence.js       ← localStorage wrapper (swap for backend later)
│   ├── useViewport.js          ← reactive matchMedia mobile detection
│   ├── useClock.js             ← shared 1Hz tick for live displays
│   └── useFlavorText.js        ← deterministic per-day brief + telemetry banks
├── styles/tokens.css           ← design system (colors / type / spacing)
├── components/
│   ├── HabitCard.vue           ← tappable habit with completion state
│   ├── StatusReadout.vue       ← captain's instrument panel + captain badge
│   ├── StarMap.vue             ← desktop SVG voyage progress
│   ├── VoyageMapMobile.vue     ← mobile vertical sector stack
│   ├── VoyageMap.vue           ← responsive wrapper picking desktop/mobile
│   ├── PreflightChecklist.vue  ← prompts user to fill empty system categories
│   ├── DailyBrief.vue          ← sector-aware mission brief from First Officer
│   ├── TelemetryFeed.vue       ← ambient sci-fi readout (live-feel)
│   ├── AllSystemsNominal.vue   ← celebratory state at 100% today
│   ├── Chronometer.vue         ← live T+ mission elapsed time (1Hz)
│   ├── DestinationPicker.vue   ← reachable + locked + hidden destination list
│   ├── LevelUpModal.vue        ← rank-up celebration moment
│   └── EmptyState.vue          ← reusable empty / first-run state
└── views/
    ├── BridgeView.vue          ← daily check-in (the one you open every day)
    ├── ExpeditionView.vue      ← voyage detail + star map + end-voyage actions (grants XP)
    ├── HabitsView.vue          ← configure ship systems (habits)
    ├── CaptainView.vue         ← rank ladder, fleet roster, XP grants history
    ├── LogView.vue             ← captain's log of past voyages + meta stats
    └── LaunchView.vue          ← destination-first launch flow
```

## Data model

- **Expedition** — a single run. Has `durationDays` (30/60/90), `startedAt`, `status` ('active' | 'completed' | 'abandoned'), `shipClass`, `destination`. Only one is active at a time.
- **Habit** — scoped to an expedition. Belongs to one of four ship-system categories: Engineering (fitness), Navigation (focus), Research (learning), Life Support (wellbeing).
- **Log** — `{ [date]: { [habitId]: { completed, note } } }`. Indexed by ISO date for fast lookup.
- **Meta** — survives across expeditions. Tracks `totalRuns`, `completedRuns`, `unlocks`. This is the roguelike permanent progression.

## What's in v1 (this baseline)

- Launch a voyage with name, destination, duration, ship class
- Configure habits (ship systems) under four categories
- Daily check-in on the Bridge
- Voyage progress via star map (SVG, animated)
- Sector-based reflection moments (4 per voyage)
- Complete or abandon a voyage cleanly
- Log of all past voyages with completion stats
- Cross-run meta stats

## What to build next (in roughly this order)

1. **Carry-forward on launch** — when you start a new voyage, optionally clone habits from a previous one. Hook is already in `habits.js` (`carryHabitsForward`).
2. **Notes per day** — captain's log entry per day. Store hooks are stubbed (`setNote`).
3. **Sector check-in moments** — when you cross into a new sector (every 25%), prompt a short reflection. Currently the sector advances silently.
4. **Daily brief** — a one-line "today's mission" generated based on completion state.
5. **Streak-free recovery framing** — language for missed days that explicitly de-shames them. (Important: keep "missed days" out of the metric foreground.)
6. **Cadence options** — Mon/Wed/Fri habits, weekly habits, not just daily.
7. **Wearable / HealthKit integration** — auto-complete fitness habits from Apple Health / Google Fit.
8. **AI captain** — small LLM-backed companion that knows your history and can ask "why did sector 2 wobble?". This is the differentiator vs. existing apps; ship it once core flows are solid.
9. **PWA + Capacitor wrap** — install on iOS / Android home screens; eventually bundle for App Store.
10. **Cloud sync + accounts** — when you're ready to charge for it. Supabase or Firebase keeps fixed costs near zero.

## Deliberate non-goals

- No infinite streak counter, anywhere. This is the philosophical position. Don't add one.
- No leaderboards, public sharing, or social comparison in v1.
- No XP/levels in the user-facing surface — meta-progression is "ships unlocked" and "voyages completed", not numerical XP.
- No procedural encounters, ship variants, or branching tech trees in v1. The roguelike *structure* (runs with endings + meta-progression) is the differentiator; deeper game mechanics are scope creep until the core flow is loved.

## Design tokens

All visual decisions live in `src/styles/tokens.css`. To re-skin (try a hard-sci-fi white-on-black, or a warmer "Pixar in space" palette), edit the variables at the top — no component changes needed.
