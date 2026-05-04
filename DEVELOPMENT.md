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

In rough priority order. Things to ship before declaring v1 "done":

**Tier 1 — sharpen the core loop:**

1. **Carry-forward UI** on launch. The `carryHabitsForward` function in the habits store is unused. Add a checkbox in `LaunchView` step 3 that, post-launch, clones the previous voyage's habits to the new one. Reduces friction when running back-to-back voyages.
2. **Notes per day per habit.** Long-press or expand-on-tap on `<HabitCard>` opens a small textarea. Persisted via existing `habits.setNote()`. Surface the notes on `<LogView>` for completed voyages.
3. **Sector check-in moments.** When `currentSector` advances (every 25%), show a one-time modal prompting a short reflection. Don't spam — show once per sector boundary, even if user reloads.
4. **Forgiveness language for missed days.** Currently the UI is silent on missed days. Add a small "yesterday" widget on the Bridge that names a missed day without shaming it. The wording matters more than the feature; write it before coding it.

**Tier 2 — quality of life:**

5. **Cadence options.** Mon/Wed/Fri habits, weekly habits, not just daily. The `cadence` field is already on the Habit data model.
6. **Edit existing habits.** Currently you can add or remove but not edit. Add an edit modal.
7. **Expedition-rename mid-voyage.** Names sometimes feel wrong after sector 1; let the user change them.
8. **Backfill habits for prior days** when adding a habit mid-voyage. Currently a habit added on day 5 has zero history — should optionally back-fill as "didn't track" (a third state, distinct from completed/missed).

**Tier 3 — feature additions:**

9. **AI captain (LLM-backed companion).** Knows your history. Asks "why did sector 2 wobble?" Ships once core flows are loved. Use Anthropic's API; the artifact docs in this project show how to call it from the client.
10. **Apple Health / Google Fit integration.** Auto-complete fitness habits. Requires Capacitor (i.e. the App Store path).
11. **Reflection / debrief on voyage end.** Currently you click "Complete" and get an XP grant. Add a 3-question debrief screen between Complete and Log: what worked, what didn't, what's next. Stored on the archived expedition.

**Tier 4 — infrastructure for scale:**

12. **PWA → Capacitor wrap.** When you're ready for App Store. Same code; add `npx cap add ios`, generate Xcode project, ship.
13. **Cloud sync + accounts.** When charging for it. Supabase or Firebase keeps fixed costs near zero. Persistence is already abstracted via `usePersistence.js` — that's the only file that needs swapping.
14. **Push notifications for sector check-ins.** Requires native (PWA push on iOS is fragile). Capacitor + APNs.

**Things deliberately NOT on the roadmap:**

- Public sharing / social features
- XP bar in masthead (only on Captain page)
- Per-day XP grants
- Procedural encounters / random events
- Customization that lets users disable the space framing (the framing IS the product)
- Multi-voyage parallel mode

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
