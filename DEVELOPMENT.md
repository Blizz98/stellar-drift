# Stellar Drift — Developer Documentation

> A space-themed habit tracker with a roguelike skeleton and captain progression.
> Vue 3 + Vite + Pinia, deployed as a PWA. Single-codebase, ready to wrap with Capacitor when the time comes.

This document is the canonical reference for the project. It assumes you are returning to the codebase after time away, or onboarding from scratch.

For the install/deploy walkthrough see `DEPLOY.md`. For the user-facing description see `README.md`.

---

## Table of contents

1. [Philosophy & non-goals](#1-philosophy--non-goals)
2. [Quick start](#2-quick-start)
3. [Project layout](#3-project-layout)
4. [The four core concepts](#4-the-four-core-concepts)
5. [Data model](#5-data-model)
6. [Stores (Pinia)](#6-stores-pinia)
7. [Composables](#7-composables)
8. [Views (routes)](#8-views-routes)
9. [Components](#9-components)
10. [Static catalogs](#10-static-catalogs)
11. [Design system](#11-design-system)
12. [Persistence & data lifecycle](#12-persistence--data-lifecycle)
13. [PWA build & deploy](#13-pwa-build--deploy)
14. [How to add things](#14-how-to-add-things)
15. [Roadmap](#15-roadmap)
16. [Anti-patterns to resist](#16-anti-patterns-to-resist)

---

## 1. Philosophy & non-goals

The product is a habit tracker structured around **finite voyages** rather than infinite streaks. Every design decision should reinforce: *runs end, that's normal; ending well is itself a skill.*

**The core philosophical commitments — do not break these without a strong reason:**

- **No infinite streak counter, anywhere.** Not in stats, not in notifications, not in the masthead. The unit of progression is the *run*, not the day.
- **XP is awarded at voyage end only**, never per-day. Per-day XP recreates streak-shame in a new costume.
- **Abandoning grants XP too** (smaller). Knowing when to pull the plug is captain skill; the system reinforces this with its own rewards.
- **Meta-progression is "voyages completed" and "ships unlocked"**, not numerical XP in the foreground. The XP bar lives on the Captain page; rank is shown by name elsewhere.
- **No procedural content / branching encounters / random items in v1.** The roguelike *structure* (runs with endings + meta-progression) is the differentiator. Game-y content is scope creep until the core flow is loved.
- **No leaderboards, public sharing, or social comparison.** Solo practice.
- **Pre-flight balance over heroic intensity.** The Pre-flight Checklist nudges users toward filling all four system categories rather than maxing one. Balance > grind.

**Non-goals.** Things this app deliberately does *not* try to do: 

- Quantified-self dashboard. Not building Apple Health competitor charts.
- Social network. Not building friends / leaderboards / public feeds.
- Lifelong tracker. Stellar Drift is for *practicing*, not for *recording forever*. Old voyages archive cleanly; the Log is a memorial, not a feed.
- Calendar / scheduler. Habits happen on a daily cadence; richer scheduling can come later but is not v1.

---

## 2. Quick start

```bash
git clone <your-repo>
cd space-habit-tracker
npm install
npm run dev          # local dev server at http://localhost:5173
npm run build        # production build → dist/
npm run preview      # preview the prod build locally
```

**Stack at a glance:**

- Vue 3 (Composition API, `<script setup>`)
- Vite 6
- Pinia (state)
- Vue Router 4
- `vite-plugin-pwa` (manifest + service worker, autoUpdate)
- Plain CSS with custom properties — no Tailwind, no UI library

**No backend.** All data lives in `localStorage`, namespaced under `sd:`. The persistence layer is intentionally abstracted (see `composables/usePersistence.js`) so a real backend can be dropped in later without touching components or stores.

**Node version:** any modern LTS (≥18). Vite 6 needs Node 18+.

---

## 3. Project layout

```
space-habit-tracker/
├── public/                       static assets served as-is
│   ├── favicon.svg
│   ├── icon.svg                  source for PWA PNG icons
│   ├── icon-maskable.svg         source for maskable PNG icon
│   ├── icon-192.png              PWA icon (Android home-screen)
│   ├── icon-512.png              PWA icon (large)
│   ├── icon-512-maskable.png     PWA icon (Android adaptive shapes)
│   └── apple-touch-icon.png      iOS home-screen icon
├── src/
│   ├── main.js                   app bootstrap (Pinia, Router, tokens.css)
│   ├── App.vue                   shell: masthead, nav, routed view, global modals
│   ├── router/index.js           routes
│   ├── styles/tokens.css         design system: CSS variables for colors/type/spacing
│   ├── data/                     static catalogs (game balance lives here)
│   │   ├── ships.js
│   │   └── destinations.js
│   ├── stores/                   Pinia stores (reactive state + persistence)
│   │   ├── expedition.js         run lifecycle
│   │   ├── habits.js             habits + daily logs
│   │   └── captain.js            XP, ranks, level-up queue
│   ├── composables/              cross-cutting reactive helpers
│   │   ├── usePersistence.js     localStorage abstraction
│   │   ├── useViewport.js        reactive matchMedia mobile flag
│   │   ├── useClock.js           shared 1Hz tick
│   │   └── useFlavorText.js      deterministic per-day brief + telemetry banks
│   ├── components/               reusable UI pieces
│   │   ├── HabitCard.vue
│   │   ├── StatusReadout.vue
│   │   ├── StarMap.vue           desktop voyage map (SVG arc)
│   │   ├── VoyageMapMobile.vue   mobile voyage map (vertical sectors)
│   │   ├── VoyageMap.vue         responsive wrapper picking desktop/mobile
│   │   ├── PreflightChecklist.vue
│   │   ├── DailyBrief.vue
│   │   ├── TelemetryFeed.vue
│   │   ├── AllSystemsNominal.vue
│   │   ├── Chronometer.vue
│   │   ├── DestinationPicker.vue
│   │   ├── LevelUpModal.vue
│   │   ├── InstallPrompt.vue
│   │   └── EmptyState.vue
│   └── views/                    route-level components
│       ├── BridgeView.vue        daily check-in (the home screen during a voyage)
│       ├── ExpeditionView.vue    voyage detail + map + end-voyage actions
│       ├── HabitsView.vue        configure habits per voyage
│       ├── CaptainView.vue       rank ladder, fleet roster, XP history
│       ├── LogView.vue           archive of past voyages + meta stats
│       └── LaunchView.vue        destination-first new-voyage flow
├── index.html                    entry HTML, meta tags, font preconnects
├── vite.config.js                Vite config + PWA plugin
├── netlify.toml                  build settings + SPA fallback for direct routes
├── package.json
├── README.md                     short user-facing intro
├── DEPLOY.md                     PWA deploy walkthrough
└── DEVELOPMENT.md                (this file)
```

**Mental model:** *data files* set the rules of the game; *stores* hold the live state; *composables* are reactive helpers; *components* render the state; *views* compose components into routes.

---

## 4. The four core concepts

These are the abstractions everything else hangs off. Internalize these and the rest is obvious.

### Expedition
A discrete run with a beginning and an end. Has duration, destination, ship, habits, and status (`active` / `completed` / `abandoned`). Only one expedition can be active at a time. Past expeditions live in history forever.

### Habit ("ship system")
A daily check-off scoped to one expedition. Belongs to one of four categories (Engineering / Navigation / Research / Life Support). Habits don't survive across expeditions automatically — they can be carried forward via `carryHabitsForward`, but each new voyage is a fresh chance to choose what matters.

### Captain
The persistent identity. Has a name (editable), XP (cumulative across all voyages), and a rank (derived from XP via the `RANKS` table). Survives across all voyages forever. This is the only thing that meta-progresses.

### Catalogs
Static data the captain operates within. Two of them: ship hulls (with rank gates, range, velocity) and destinations (with distance and rank gates). Editing the catalog files re-balances the game without touching any logic.

**The relationships:**

```
Captain ──earns──> XP ──unlocks──> Rank ──gates──> Ship ──determines──> Voyage Duration
                                          │                                   │
                                          └──gates──> Destination ────────────┘
                                                          │
                                                          └──in──> Expedition ──contains──> Habits
                                                                                     │
                                                                                     └──tracked──> Daily Logs
```

---

## 5. Data model

Every persisted shape, with the `sd:` localStorage key it lives under.

### `sd:expedition.current` — `Expedition | null`

```ts
{
  id:             string         // 'exp_<timestamp>'
  name:           string         // user-chosen voyage name
  destination:    string         // display name, copied from catalog
  destinationId:  string | null  // catalog id (e.g. 'kepler-186f')
  shipClass:      string         // catalog ship id (e.g. 'frigate')
  durationDays:   number         // computed at launch, immutable for the run
  startedAt:      string         // ISO date 'YYYY-MM-DD' (start of day, local)
  status:         'active'       // for current it's always 'active'
  endedAt:        null
}
```

### `sd:expedition.history` — `Expedition[]`
Same shape, but `status` is `'completed' | 'abandoned'` and `endedAt` is set. Newest first.

### `sd:expedition.meta` — `{ totalRuns, completedRuns, unlocks }`

```ts
{
  totalRuns:     number    // every launch increments this
  completedRuns: number    // only completed runs (not abandoned)
  unlocks:       string[]  // ship ids unlocked across runs (legacy field, mostly superseded by captain rank)
}
```

### `sd:habits.list` — `Habit[]`

```ts
{
  id:           string                            // 'hab_<timestamp>_<random>'
  expeditionId: string                            // foreign key to expedition.id
  name:         string
  description:  string                            // optional, brief
  category:     'engineering' | 'navigation'
              | 'research' | 'life-support'
  cadence:      'daily'                           // only daily implemented in v1
  icon:         string                            // emoji, defaults to category icon
  createdAt:    string                            // ISO date
}
```

Habits are scoped per-expedition. After an expedition ends, the habit records remain in storage (so historical logs can still resolve names/categories), but `activeHabits` filters to the current expedition only.

### `sd:habits.logs` — `{ [date]: { [habitId]: { completed, note? } } }`

```ts
{
  '2026-05-04': {
    'hab_1714829100_a3b2': { completed: true, note: 'felt strong' },
    'hab_1714829110_c9d8': { completed: false }
  },
  '2026-05-05': { ... }
}
```

Date-keyed for fast same-day lookups. Notes are stubbed in storage but no UI exposes them yet — see roadmap.

### `sd:captain.state` — `CaptainState`

```ts
{
  name:          string          // editable on Captain view
  xp:            number          // cumulative across all voyages
  voyageGrants:  Grant[]         // capped at 50, newest first
}

Grant = {
  date:        string            // ISO date of grant
  source:      'completion' | 'abandonment'
  amount:      number             // XP gained
  voyageName:  string
  voyageId:    string             // links back to expedition.id
}
```

### `sd:captain.pendingLevelUp` — `LevelUp | null`

```ts
{
  from:  Rank      // { rank, name, minXP }
  to:    Rank
  at:    number    // unix ms
}
```

When non-null, `<LevelUpModal>` mounts and shows the celebration. Cleared by `clearPendingLevelUp()`. Survives reloads — celebrations don't get lost to a refresh.

---

## 6. Stores (Pinia)

All three stores follow the same pattern: `ref` state hydrated from `loadJSON`, `watch` writes back to `saveJSON`, `computed` getters, plain functions for actions. No options API.

### `stores/expedition.js`

**State:** `current`, `history`, `meta`.

**Computed:**
- `isActive` — `current?.status === 'active'`
- `daysElapsed` — 1-indexed day number of current voyage
- `daysRemaining` — days until completion
- `progressPercent` — 0..100
- `currentSector` — 1..4, computed from elapsed / duration

**Actions:**
- `launchExpedition({ name, destination, destinationId, durationDays, shipClass })` — creates `current`, increments `meta.totalRuns`
- `completeExpedition()` — moves `current` to `history` with `status: 'completed'`, increments `meta.completedRuns`, returns the ended expedition
- `abandonExpedition()` — same but `status: 'abandoned'`, no completion increment

**Important:** the end actions return the expedition object. Callers (`ExpeditionView`) use it to compute XP grants from the now-archived voyage's metadata.

### `stores/habits.js`

**State:** `habits` (all habits, not filtered), `logs`.

**Computed:**
- `activeHabits` — habits whose `expeditionId` matches `expedition.current.id`
- `todayHabits` — alias for `activeHabits` (kept separate in case cadence filtering is added)
- `todayCompletionRate` — 0..1

**Actions:**
- `getLog(date, habitId)` — read-only accessor with default fallback
- `completionRate(date)` — 0..1 share of *currently active* habits completed on a given date
- `averageCompletionForExpedition(expeditionId, startedAt, throughDate)` — average daily rate across the voyage. **Used at voyage end to compute XP rewards.** Counts only habits scoped to that expedition.
- `addHabit({ name, description, category, icon })`
- `removeHabit(id)`
- `toggleCompletion(habitId, date = today)`
- `setNote(habitId, note, date = today)` — stored, not yet shown in UI
- `carryHabitsForward(fromExpId, toExpId)` — clones a previous expedition's habits to a new one with new IDs (utility, not yet wired to a UI flow)

The `CATEGORIES` const exported from this file is the source of truth for category metadata (label, sublabel, icon, description, color CSS variable). Used everywhere the four categories appear.

### `stores/captain.js`

**Constants exported:**
- `RANKS` — array of `{ rank, name, minXP }`, length 8 (Cadet → Admiral)
- `MAX_RANK` — 8
- `xpForCompletion(durationDays, avgRate)` — `100 + round(avgRate × durationDays × 2)`
- `xpForAbandonment(daysCompleted, avgRate)` — `max(10, round(avgRate × daysCompleted × 1))`

**State:** `state` (`{ name, xp, voyageGrants }`), `pendingLevelUp`.

**Computed:**
- `currentRank` — derived from `state.xp`
- `nextRank` — null at max
- `xpIntoRank` — XP earned within current rank
- `xpForNextRank` — XP span between current and next rank
- `progressToNext` — 0..1
- `isMaxRank` — boolean

**Actions:**
- `grantXP({ amount, source, voyageName, voyageId })` — adds XP, records the grant, queues a level-up if a rank boundary was crossed. Returns `{ gained, leveledUp, newRank }`.
- `clearPendingLevelUp()`
- `setName(newName)`

**XP curve:** rank N requires `N² × 200` total XP. `200 / 800 / 1800 / 3200 / 5000 / 7200 / 9800 / 12800`. A 60-day voyage at 70% completion grants ~184 XP. Rank 2 takes one good voyage; Admiral takes a multi-year practice. The curve is intentional — to keep the focus on the practice, not the grind.

---

## 7. Composables

Reactive helpers. Stateless from the consumer's point of view; importable from anywhere.

### `usePersistence.js`
Thin wrapper over `localStorage`. **Every read/write in the app goes through this file.** When swapping to a backend later, this is the only file that changes.

```js
loadJSON(key, fallback)   // safe parse; returns fallback on miss/error
saveJSON(key, value)      // try/catch, logs warn on failure
removeKey(key)
clearAll()                // wipes everything under 'sd:' namespace
```

### `useViewport.js`
Reactive `isMobile` flag, backed by `matchMedia('(max-width: 720px)')`. Used by `<VoyageMap>` to pick desktop vs. mobile rendering.

```js
const { isMobile } = useViewport()
```

### `useClock.js`
Shared 1Hz timer for live displays (the `T+` chronometer). Reference-counted: the `setInterval` only runs while at least one component is mounted. All consumers share the same `now` ref.

```js
const { now } = useClock()  // ref<number>, ms since epoch, ticks every second
```

### `useFlavorText.js`
Deterministic per-day flavor text. Same date → same output (so the user sees a stable message all day, no flicker on reload).

**Exports:**
- `dailyBrief(sector, completionRate, dateISO)` — returns one line from a 12-bucket bank (4 sectors × 3 completion buckets), seeded by date+sector+bucket
- `dailyTelemetry(dateISO, count)` — returns N lines from a 30-line ambient sci-fi bank, deterministically shuffled by date

**To extend:** edit the `BRIEFS` and `TELEMETRY` constants directly. The hash function and stride trick handle distribution.

---

## 8. Views (routes)

### `/` — `BridgeView`
The daily check-in screen. The view a user opens every day. **Composition order matters:**
1. `<StatusReadout>` — captain identity + voyage progress
2. `<PreflightChecklist>` — visible only if any of the 4 categories is empty (self-removes once configured)
3. `<AllSystemsNominal>` — visible only at 100% today
4. `<DailyBrief>` — the First Officer line
5. The day's habits, grouped by category
6. `<TelemetryFeed>` — ambient flavor at the bottom

If no voyage is active, this view just shows an `EmptyState` pointing to `/launch`.

### `/expedition` — `ExpeditionView`
Voyage telemetry and end-voyage actions. Renders `<VoyageMap>` (responsive wrapper). **This view is where XP grants happen** — `handleComplete()` and `handleAbandon()` compute the average completion rate, end the expedition, then call `captain.grantXP()`.

### `/habits` — `HabitsView`
Configure habits for the current voyage. Add / remove / categorize. Soft limit guidance ("aim for 1–2 per category, 8 total max") is in the lede copy.

### `/captain` — `CaptainView`
The dedicated rank/progression page.
- Identity hero with editable name and XP bar
- Three summary stats (total XP, hulls, destinations)
- Rank ladder (all 8 ranks, achieved/current/locked states distinct)
- Fleet roster (all ships with full descriptions, locked or unlocked)
- Recent commissions (last 12 XP grants)

### `/log` — `LogView`
Archive of past voyages + meta stats. Each entry shows status (completed/abandoned with color), departure/conclusion dates, duration delta. The entries use a vertical timeline rail.

### `/launch` — `LaunchView`
The destination-first launch flow. Step 1: pick ship. Step 2: pick destination (ship + destination together compute duration). Step 3: name the voyage. The summary card at the bottom shows the computed duration in real time.

**Routes are lazy-loaded** via dynamic imports in `router/index.js`, so each view ships in its own JS chunk.

---

## 9. Components

Grouped by purpose. All use scoped CSS, all read tokens from `tokens.css`, all use `<script setup>`.

### Layout & shell

**`StatusReadout.vue`** — Bridge instrument panel. Shows voyage name, destination, current sector, days elapsed/remaining, today's completion %, voyage progress bar, plus a small captain badge linking to `/captain`. Renders only if `expedition.current`.

**`Chronometer.vue`** — Live `T+ XXXd HH:MM:SS` ticker for the masthead. Uses `useClock`. Computes from start-of-day-of-voyage-start, so display is local-time-of-day relative to launch.

### Voyage visualization

**`StarMap.vue`** — Desktop SVG voyage map: arcing path with day-points laid along a sine curve, today pulses, sector markers at 25/50/75. Pure SVG, no animation libraries.

**`VoyageMapMobile.vue`** — Mobile voyage map: vertical stack of 4 sector cards, each with a tight grid of 14×14px day-cells. Past cells fill with amber proportional to that day's completion rate.

**`VoyageMap.vue`** — Trivial wrapper using `useViewport` to pick `<StarMap>` (desktop) or `<VoyageMapMobile>` (mobile).

### Bridge components

**`PreflightChecklist.vue`** — Renders the 4 ship system categories as cells, marking which have habits configured. Auto-disappears once all 4 have at least one habit. Pulsing amber warning indicator when incomplete.

**`DailyBrief.vue`** — Sector-aware First Officer line, pulled deterministically from `useFlavorText.dailyBrief`.

**`TelemetryFeed.vue`** — Ambient sci-fi readout. Reveals lines one at a time on a 4.2s interval, keeps the last 4 visible with fading opacity. Pure atmosphere; zero game weight.

**`AllSystemsNominal.vue`** — Celebration banner at 100% today. Slow-rotating ray pattern, subtle scale-in transition.

**`HabitCard.vue`** — Tappable habit row. Category-color stripe on the left edge, large completion checkmark on the right. Tap toggles. Receives `habit` prop and `date` prop (defaults to today, but accepts any date — useful for back-filling).

### Launch flow

**`DestinationPicker.vue`** — The destination list with three tiers of visibility:
1. *Reachable* destinations (rank + ship range OK) — selectable, expandable to show prose
2. *Locked* destinations — first 2 above your rank are visible but disabled, with rank requirement shown
3. *Hidden* — anything beyond shows as a single "N further destinations await" indicator

Reads `useCaptainStore` to compute `visibleDestinations(rank)`.

### Modals

**`LevelUpModal.vue`** — Mounted at App root. Reactively shows when `captain.pendingLevelUp` is non-null. Slow-rotating ray background, pulsing rank glow, optional "newly available hulls" section if the rank-up unlocks ships. One "Acknowledge →" button to dismiss.

**`InstallPrompt.vue`** — PWA install prompt. Two paths:
- **Android / Chromium:** captures `beforeinstallprompt`, fires native install dialog on tap
- **iOS Safari:** no event exists, so we show a "how to install" instruction sheet with the share-button + Add-to-Home-Screen flow

Dismissal is sticky (stored in localStorage key `sd:installPromptDismissed`). Self-hides if `display-mode: standalone` (i.e. already installed).

### Utility

**`EmptyState.vue`** — Reusable empty-state with the orbit-ring mark, title, body, and optional slot for action buttons.

---

## 10. Static catalogs

Game balance data. Edit these to retune; no logic changes needed.

### `data/ships.js`

`SHIPS` — array of 6 hulls.

```ts
{
  id:           string         // unique, used as expedition.shipClass
  name:         string
  tagline:      string         // short flavor
  rankRequired: number         // 1..8
  maxRangeDays: number         // longest voyage this hull can attempt
  velocity:     number         // light-days per voyage-day; duration = ceil(distance / velocity)
  bonus:        string | null  // 'engineering' | 'navigation' | 'research' | 'life-support' | null
  description:  string         // longer prose for the hull card
}
```

**Helpers:** `shipById(id)`, `shipsAvailable(rank)`.

**The duration formula** is `Math.ceil(distanceLightDays / ship.velocity)`. The `maxRangeDays` cap is what gates whether a destination is even attemptable in a given hull.

### `data/destinations.js`

`DESTINATIONS` — array of 17 destinations, sorted by distance.

```ts
{
  id:           string
  name:         string
  subtitle:     string         // one-line classification
  distanceDays: number         // light-days from origin
  minRank:      number         // captain rank required to even see in the picker
  description:  string         // longer prose, shown when expanded
  poetic:       string         // single italic atmospheric line
}
```

**Helpers:** `destinationById(id)`, `visibleDestinations(captainRank)` — returns `{ reachable, locked, hiddenCount }` for the picker UI.

**Visibility logic:** the picker shows all destinations the captain has rank for, plus the next 2 locked-but-foreshadowed entries, plus a count of further hidden destinations. This keeps the list scoped without losing the aspirational pull.

---

## 11. Design system

Everything visual lives in `src/styles/tokens.css`. Editing that one file re-skins the entire app.

**Color palette:**
- *Surfaces* (5 levels): `--void` → `--hull` → `--bulkhead` → `--console` → `--console-hi`
- *Lines:* `--line`, `--line-hi`
- *Text:* `--signal` (primary), `--signal-dim` (secondary), `--signal-low` (tertiary)
- *Accents:* `--amber` (warm/captain), `--cyan` (cool/active), `--plasma` (rare), `--thrust` (warning), `--verdant` (nominal)
- Each accent has `*-soft` and `*-deep` variants

**Typography:**
- `--font-display` — Instrument Serif italic (display headings)
- `--font-body` — DM Sans (UI text)
- `--font-mono` — JetBrains Mono (instrument readouts, labels)

**Spacing:** 8px base scale `--s-1` (4px) through `--s-8` (64px).

**Geometry:** `--radius-sm`, `--radius`, `--radius-lg`.

**Motion:** `--ease`, `--ease-out`, `--t-fast` (140ms), `--t-med` (280ms), `--t-slow` (520ms).

**Utility classes:** `.display`, `.mono`, `.label`, `.input`, `.btn`, `.btn-primary`, `.btn-ghost`.

**Convention:** components import nothing from tokens.css directly; they use `var(--name)` references in scoped styles. Never hard-code colors.

---

## 12. Persistence & data lifecycle

All data is persisted to `localStorage` under the `sd:` namespace. Eleven keys total:

```
sd:expedition.current
sd:expedition.history
sd:expedition.meta
sd:habits.list
sd:habits.logs
sd:captain.state
sd:captain.pendingLevelUp
sd:installPromptDismissed
```

**Lifecycle of a voyage:**

1. **Launch** — `LaunchView` calls `expedition.launchExpedition()`. New expedition becomes `current`. User redirected to `/habits` to configure systems.
2. **Daily** — User opens `BridgeView`. `<HabitCard>` toggles update `logs` keyed by today's ISO date. Each toggle is a `O(1)` write to localStorage.
3. **Sector advance** — Implicit. Computed from `daysElapsed / durationDays`. No explicit "sector advance" event yet (see roadmap).
4. **End** — User on `ExpeditionView` clicks Complete or Abandon:
   - Compute `avgRate = habits.averageCompletionForExpedition(...)`
   - Compute `xp = xpForCompletion/Abandonment(...)`
   - `expedition.completeExpedition()` / `abandonExpedition()` archives the run
   - `captain.grantXP({ amount, source, voyageName, voyageId })`
   - If a rank boundary was crossed, `pendingLevelUp` is set; `<LevelUpModal>` reactively appears

**Storage size.** A heavy user with 2 years of daily logs across 12 habits is roughly 600KB in localStorage — well within all browser limits (typically 5–10MB per origin). Not a concern.

**iOS quirk.** Safari may evict PWA storage if the app is unopened for ~7 weeks. For long-term durability, the eventual fix is backend sync. Not urgent for testing or early users.

---

## 13. PWA build & deploy

The PWA is generated at build time by `vite-plugin-pwa` (configured in `vite.config.js`):

- **Manifest** generated from inline config → `dist/manifest.webmanifest`
- **Service worker** generated by Workbox → `dist/sw.js` + `dist/workbox-*.js`
- **Precache** all build artifacts (~415KB) for offline use
- **`registerType: 'autoUpdate'`** — service worker auto-updates on next reload after a deploy. **First reload still shows old version**; second reload picks up the new one. This is how SWs work; tell users this when they ask why "their fix isn't live."

**Deploy is via Netlify** (settings in `netlify.toml`). Build command `npm run build`, publish directory `dist/`, with an SPA fallback redirect so deep links resolve through Vue Router. See `DEPLOY.md` for the full walkthrough.

**Updating after a deploy:**
- Push to GitHub → Netlify auto-builds → live in ~60s
- iOS users: force-quit and reopen the app to pick up the new SW

---

## 14. How to add things

Concrete recipes for the most common changes.

### Add a new ship
1. Edit `src/data/ships.js`. Add an object to the `SHIPS` array with a unique `id`.
2. That's it. The new ship appears in `LaunchView` ship-selector and `CaptainView` fleet roster automatically. If `rankRequired` is above the captain's rank, it shows as locked.

**Tuning notes:** velocity should grow with rank; range should grow with rank; avoid creating a "strictly better" ship — give each one a personality (bonus category, niche use).

### Add a new destination
1. Edit `src/data/destinations.js`. Add an object to `DESTINATIONS` with a unique `id`.
2. Set `distanceDays` (and confirm at least one ship can reach it via `Math.ceil(distance / velocity) ≤ ship.maxRangeDays`).
3. Set `minRank` to gate UI visibility.

**Tuning notes:** the picker shows reachable + 2 locked + a count. Adding many destinations at high rank doesn't clutter low-rank UI. Write the `poetic` line first; it usually clarifies the destination's character.

### Add a new habit category
This is more involved. Categories are not data-driven — they're hardcoded in `stores/habits.js` (`CATEGORIES` const), referenced by string ID elsewhere.

1. Add a new entry to `CATEGORIES` (id, label, sublabel, icon, description, color CSS var).
2. Add the new color CSS var to `tokens.css` if needed.
3. Update `BridgeView.orderedCategories` to include the new id.
4. Update `PreflightChecklist`'s grid layout (currently 4-cell, would need redesign for 5).
5. Update ship `bonus` field in catalog if new category should be supported.

In practice: don't. Four categories were chosen to fit the four-sector roguelike rhythm and to make the Pre-flight grid clean. Adding a fifth breaks the symmetry. If you want sub-categorization, add it as tags within existing categories.

### Add a new view (route)
1. Create `src/views/MyView.vue`.
2. Add a route in `src/router/index.js` (lazy-loaded import).
3. Add a nav link in `App.vue`'s `navLinks` computed (consider whether it should appear during voyages, off-voyage, or always).

### Add an XP source
1. In `stores/captain.js`, add a new `xpForX(...)` pure function alongside the existing two.
2. Wherever the new event happens, call `captain.grantXP({ amount, source: 'X', ... })`.
3. The grant appears in the Captain page's "Recent commissions" automatically.

**Resist:** adding per-day XP. The whole philosophical position rests on XP-at-end-of-voyage. Any per-day grant is a streak in disguise.

### Change the XP curve
Edit the `RANKS` constant in `stores/captain.js`. The `minXP` field is the threshold. Existing captains keep their XP; their rank just recomputes against the new thresholds on next load.

### Add notes per habit per day
The data layer already supports this — `habits.setNote(habitId, note, date)` exists and `getLog` returns `{ completed, note }`. What's missing is the UI: a long-press or expand interaction on `<HabitCard>`. See roadmap.

### Add wearable / HealthKit auto-completion
- **PWA mode:** not really possible. Web standards expose limited fitness data.
- **Capacitor mode:** add the `@capacitor-community/health` plugin. Inside `toggleCompletion`, before persisting, query HealthKit for relevant data and auto-mark.

---

## 15. Roadmap
 
Reorganized after first-week real-use testing. Tiers reflect *what fixes the biggest hole next*, not feature count. Within each tier, items are ordered by leverage.
 
### Tier 1 — fix day-0 onboarding (highest leverage)
 
The single biggest retention failure is users opening the app to four empty habit categories and bouncing. Fix this before anything else.
 
1. ✓ DONE **Guided first-launch flow.** Three screens before LaunchView for first-time users: philosophy in one line, tap-to-accept starter habits per category, auto-launch a 14-day Luna voyage. Reduces first-run decisions from many to one tap per screen. Should detect "no expeditions ever launched" and route there once.
2. ✓ DONE **Pre-filled starter habits with one-tap acceptance.** Concrete suggestions per category (move 20 min, one focus session, read 20 min, in bed by 11). User taps to accept defaults; "customize" is secondary. Eliminates the four-empty-categories paralysis. Pairs with item 1.
3. ✓ DONE **Edit existing habits.** Currently you can add or remove but not edit. Without this, a typo or miscategorization forces decommission + recreation, which loses the habit's log history. Add an edit modal triggered from `HabitsView` row tap.
4. ✓ DONE **Multiple completions per day.** Some habits are 2× or 3× daily (brushing teeth, water intake). Add a `targetCount` field on Habit (default 1) and a count widget on `HabitCard` that increments toward the target. Completion is `count >= target`. Data layer change in `stores/habits.js`; `Habit` shape gets one new field.

### Tier 2 — build the daily-return loop
 
Once users get past day 0, the next failure is forgetting to return.
 
5. **Daily notification at user-chosen time.** One per day, sci-fi themed, no streak language. *"Today's flight log is ready. T+ 003d aboard the Explorer."* This single feature is the biggest retention lever for habit apps. PWA push works on Android cleanly; iOS PWA push is partial (16.4+) and flaky — full reliability requires the Capacitor wrap, but ship the PWA version first.
6. ✓ DONE **End-of-voyage debrief screen.** Three questions between Complete and Log: *what worked, what surprised you, what's the next voyage?* Stored on the archived expedition; surfaces in `LogView`. Makes voyages feel like events, not transactions. The user's own words are dramatically more emotionally valuable in the Log than stats alone.
7. ✓ DONE **"Yesterday" widget on the Bridge.** One-line acknowledgment of yesterday's state when the user opens the app. *"Yesterday: 3 of 4 systems nominal."* No streak framing — just a welcome back. Reads from existing logs.
8. ✓ DONE **Forgiveness language for missed days.** The Bridge is currently silent on missed days. Add explicit, kind framing for restarts after gaps. Wording matters more than the feature; write the copy before touching code. Example tone: *"Three days since last log. Voyages run on their own time. Pick up where you are."*

### Tier 3 — solve the voyage-2 problem
 
Most users who finish voyage 1 don't start voyage 2. Three things help.
 
9. **Smart carry-forward at launch.** When launching voyage 2+, offer last voyage's habits with one-tap "keep these" — but more importantly, suggest *changes* based on what happened: drop or modify habits below 30% completion, propose a stronger version of any habit that hit 100%. The data hook (`carryHabitsForward`) exists in `stores/habits.js`; this is UI + suggestion logic on top.
10. **Voyage-2 seeding during voyage 1.** Captain page shows *"Next voyage: where will you go?"* with soft preview options during the current voyage. Plants the seed before completion so the moment of "voyage complete!" isn't also the moment of "now what?"
11. **"Shore leave" as a third end-state.** Add an explicit rest mode between voyages — no penalty, no XP loss, no guilt. Reframes the gap between voyages as *part of the practice* rather than abandonment of the app. Currently the only options at voyage end are Complete or Abandon, both of which feel terminal.
12. **Sector check-in moments.** When `currentSector` advances (every 25% of the voyage), show a one-time modal prompting a short reflection. Don't spam — show once per sector boundary, even if user reloads. Stored as a per-sector reflection on the expedition.

### Tier 4 — quality-of-life polish
 
Refinements that make the app *feel* better but don't move retention dramatically.

13. **First app launch settings / settings tab.** We have to make sure that the settings are available for player - subscription, language and more will be managed here. 
13. **Notes per day per habit.** Long-press or expand-on-tap on `<HabitCard>` opens a small textarea. Persisted via existing `habits.setNote()`. Surface the notes on `<LogView>` for completed voyages.
14. **Cadence options.** Mon/Wed/Fri habits, weekly habits, not just daily. The `cadence` field is already on the Habit data model. Affects how "today's habits" filter works in the habits store.
15. **Expedition-rename mid-voyage.** Names sometimes feel wrong after sector 1; let the user change them. Tap voyage name on `StatusReadout` to edit inline.
16. **Backfill habits for prior days** when adding a habit mid-voyage. Currently a habit added on day 5 has zero history — should optionally back-fill as "didn't track" (a third state, distinct from completed/missed).
17. **Per-category completion summary on the Bridge.** Quick visual showing how today's habits are progressing within each of the four ship-system categories — at-a-glance overview without scrolling through the full list.
18. **Polish habit cards on the Bridge.** Current row layout is functional but plain. Tighter spacing, better category color treatment, possibly grouped headers with progress dots.

### Tier 5 — content & worldbuilding
 
Long-tail content that gives returning users something new to discover.
 
19. **Real astronomical distances.** Current distances are gameplay-tuned, not realistic. Real Mars is ~12 light-minutes from Earth; real Proxima is ~4 light-years. Reframe distances using real astronomical data, then either (a) compress timescales ("each voyage day = 1 light-month") or (b) lean into the fiction with FTL drives baked into ship velocities. Either way the catalog needs a pass with real numbers.
20. **Expanded destination prose.** During voyage, the user should be able to read more about where they're going than what shows on the launch screen. Add a "destination dossier" view accessible from `ExpeditionView` — extended description, atmospheric details, what crews historically report. Pure flavor; deepens the immersion.
21. **More ships and destinations.** Build out the catalog significantly — more rank gates, more variety per rank, more aspirational endpoints. Long-tenure users finishing the catalog at year 8 should find new content has been added since they started. The catalog files are pure data, so this is content work, not engineering.

### Tier 6 — shareability for organic acquisition
 
Once retention is solid, optimize for discovery. Habit apps spread when users *want* to be seen using them.
 
22. **End-of-voyage shareable image.** Generate a single beautiful image at completion (voyage name, destination, ship class, completion %, captain rank, sector dots). "Save voyage record," not "share to Twitter." Use SVG → canvas conversion, native share sheet on mobile.
23. **Text-format voyage summary.** Wordle-pattern emoji/unicode grid that copy-pastes into iMessage and Discord. Sectors as filled/empty blocks, completion bar, ship icon. Cheap to build, viral if the framing lands. Keep ASCII-only or basic emoji so it renders everywhere.

### Tier 7 — infrastructure for scale
When the app is real and you have users.
 
24. **PWA → Capacitor wrap.** When you're ready for App Store / Play Store. Same code; add `npx cap add ios`, generate Xcode project, ship. Don't do this until you've lived with the PWA for at least 6–8 weeks.
25. **Cloud sync + accounts.** When charging for it. Supabase or Firebase keeps fixed costs near zero. Persistence is already abstracted via `usePersistence.js` — that's the only file that changes. Resolves iOS PWA storage eviction (~7-week window) and enables multi-device sync.
26. **Push notifications via native APNs.** Capacitor + Apple Push Notification service. Required for reliable iOS notifications; PWA-only push is unreliable on iOS even at iOS 16.4+.
27. **AI captain (LLM-backed companion).** Knows your history. Asks *"why did sector 2 wobble?"* Use the Anthropic API. Ship after core flows are loved — this is differentiation, not core. Avoid making it gimmicky; the captain should feel like a quiet first officer, not a chatbot.
28. **Apple Health / Google Fit integration.** Auto-complete fitness habits from wearables. Requires Capacitor. Capacitor-community plugin exists for HealthKit; Android equivalent is more fragmented but workable.
29. **Storage hygiene** Habits and logs from completed expeditions accumulate forever in localStorage (localStorage["sd:habits.list"])

### Tier 0 — measurement (only once you hav e users)
 
29. **Track day-2 return rate.** The single most predictive metric for habit-app retention. Did the user open the app the day after they installed it. If yes, ~80% chance they're there at day 7. If no, ~5%. Skip everything else for now; just measure this one number.
---
 
### Open decision: XP curve retune
 
Simulation modeled actual progression curves for varying user types using realistic completion / abandonment / rest profiles. Findings:
 
- **Average user (70% completion):** ~4 months to Lieutenant, ~4 years to Captain, ~12 years to Admiral, ~13 years to all destinations.
- **Highly committed user (90%):** ~10 years to Admiral.
- **Casual user (55%):** ~15 years to Admiral.
Real calendars (life events, gaps, vacations) probably double these numbers. The early curve (R1–R4) is well-tuned. The late curve (R5–R8) is likely too slow — users in year two seeing "Admiral in 10 more years" may experience the goalpost as moving away from them.
 
**Decision pending.** Three options:
 
- **Leave it.** Admiral stays aspirational; most users live happily as Captains. Risk: locked content erodes Captain page emotional pull over time.
- **Flatten the late curve.** New `RANKS` thresholds e.g. `0 / 600 / 1500 / 2700 / 4200 / 6000 / 8000 / 10000`. Admiral around year 5–7 for committed users. Risk: ranks 5–7 become less distinct.
- **Distance-based XP multiplier.** Longer voyages give meaningfully more XP per day. Keeps the curve, rewards depth. Risk: more code, subtly incentivizes the already-rational always-pick-the-longest play.
Existing captains keep their XP if thresholds change — only their displayed rank recomputes.
 
---
 
### Things deliberately NOT on the roadmap
 
These are the temptations to refuse. Each leads back to the genre we're differentiating from. (See section 16.)
 
- Public sharing, leaderboards, social comparison
- XP bar in masthead (only on Captain page)
- Per-day XP grants
- Streak counters in any form
- Procedural encounters, random events, branching content
- Customization that lets users disable the space framing
- Multi-voyage parallel mode
- Microtransactions, ship skins, paid shortcuts
- Tutorials and tooltips beyond the first-launch onboarding
- Generic Steam-style achievements / badges

---

## 16. Anti-patterns to resist

When future-you (or a contributor) asks for one of these, push back. Each is the temptation that leads back to the genre we're trying to differentiate from.

**"Add a streak counter."** No. Not a hidden one, not a soft one, not a "personal best." The whole product position depends on its absence.

**"Show XP in the masthead."** No. Rank by name on the Bridge is enough. XP-bar-in-the-corner is the Habitica failure mode.

**"Award XP for daily completions."** No. XP is at voyage end. A per-day reward is a streak.

**"Add achievements / badges."** Only if they emerge from the existing structure (e.g. "first Pathfinder voyage"). Generic Steam-style achievement padding is noise.

**"Let users design their own ships / destinations / categories."** No. The catalog is curated. Customization sounds like power but in habit apps it actually creates choice paralysis. Curated is better.

**"Add a leaderboard."** No. Solo practice. Leaderboards turn this into a comparison engine.

**"Add real-money microtransactions for ship skins / faster XP."** No, no, and absolutely no. Subscription only, if anything. The moment you sell shortcuts, the whole roguelike-forgiveness philosophy is hollow.

**"Make habits visible across all voyages by default."** No. Per-voyage scoping is intentional. Each voyage is a chance to choose what matters *now*. Carry-forward is a deliberate user action, not a default.

**"Increase notification frequency to drive engagement."** No. Mission Control sends one well-timed line a day, not push notifications hammering you for streaks.

---

## Closing notes

This codebase is small enough to hold in your head (~4700 lines across 30 files). If you've been away for a while, the fastest re-onboarding path is: read this doc, then open `BridgeView.vue` and trace what happens when a habit is tapped. That covers the routing, the store layer, the persistence, and the rendering loop in one path.

When in doubt, keep the philosophy. The technical decisions are easy; the philosophical ones are what makes Stellar Drift not-Habitica. Defend them.

Good voyage. ◇
