<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { destinationById } from '@/data/destinations'

const expedition = useExpeditionStore()
const habits = useHabitsStore()

// ——— Sector names (4 acts of every voyage) ———
const SECTOR_NAMES = ['Departure', 'Open Space', 'Deep Voyage', 'Approach']

// ——— Origin: previous voyage's destination, or 'Earth' for first voyage ———
const originName = computed(() => {
  if (expedition.history.length === 0) return 'Earth'
  return expedition.history[0]?.destination || 'Earth'
})

// ——— Destination ———
const destination = computed(() => {
  const cur = expedition.current
  if (!cur) return null
  return destinationById(cur.destinationId) || { name: cur.destination, poetic: '' }
})

// ——— Day markers ———
/**
 * Each day is a marker on the voyage line. Shape:
 *   { day, dateISO, sector, isToday, isPast, isFuture, completion, sectorIdx }
 * `completion` is 0..1 for past days, null for today/future.
 */
const dayMarkers = computed(() => {
  const cur = expedition.current
  if (!cur) return []

  const total = cur.durationDays
  const sectorSize = total / 4
  const today = expedition.daysElapsed
  const start = new Date(cur.startedAt + 'T00:00:00')

  // Sector boundary indices (inclusive end)
  const sectorBounds = []
  for (let s = 0; s < 4; s++) {
    sectorBounds.push(Math.floor((s + 1) * sectorSize))
  }

  return Array.from({ length: total }, (_, i) => {
    const dayNum = i + 1
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateISO = date.toISOString().slice(0, 10)

    // Determine which sector (0..3)
    let sectorIdx = 0
    for (let s = 0; s < 4; s++) {
      if (i < sectorBounds[s]) { sectorIdx = s; break }
    }

    const isPast = dayNum < today
    const isToday = dayNum === today
    const isFuture = dayNum > today

    let completion = null
    if (isPast || isToday) {
      completion = habits.completionRate(dateISO)
    }

    return {
      day: dayNum,
      dateISO,
      sector: sectorIdx + 1,
      sectorIdx,
      isPast,
      isToday,
      isFuture,
      completion
    }
  })
})

// ——— Sector boundary nodes (named, larger markers between sectors) ———
const sectorNodes = computed(() => {
  const cur = expedition.current
  if (!cur) return []
  const total = cur.durationDays
  const sectorSize = total / 4

  return SECTOR_NAMES.map((name, idx) => {
    const startDay = Math.floor(idx * sectorSize) + 1
    const endDay = Math.floor((idx + 1) * sectorSize)
    const today = expedition.daysElapsed
    const isCurrentSector = today >= startDay && today <= endDay
    const isPastSector = today > endDay
    const isFutureSector = today < startDay

    return {
      idx,
      name,
      number: idx + 1,
      startDay,
      endDay,
      isCurrentSector,
      isPastSector,
      isFutureSector,
      length: endDay - startDay + 1
    }
  })
})

// ——— Today index in flat day list (used to scroll into view on mount) ———
const todayDayIdx = computed(() => expedition.daysElapsed - 1)

const containerRef = ref(null)
const todayMarkerRef = ref(null)

onMounted(() => {
  // Scroll today into view, centered, after layout settles
  requestAnimationFrame(() => {
    if (todayMarkerRef.value && containerRef.value) {
      const tEl = todayMarkerRef.value
      const cEl = containerRef.value
      const offsetTop = tEl.offsetTop - cEl.offsetTop
      const target = offsetTop - cEl.clientHeight / 2 + tEl.clientHeight / 2
      cEl.scrollTo({ top: target, behavior: 'instant' })
    }
  })
})

// ——— Generate a small static starfield for the background ———
// 60 stars at random positions, sizes, opacities. Generated once on mount,
// stable for the session — no per-frame randomization.
const stars = computed(() => {
  // Seeded by start date so the same voyage always has the same starfield
  const seed = expedition.current?.startedAt || 'no-voyage'
  let h = 5381
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) + h) + seed.charCodeAt(i)
    h |= 0
  }
  const rand = () => {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
  return Array.from({ length: 60 }, () => ({
    x: rand() * 100,                  // % across
    y: rand() * 100,                  // % down
    size: rand() < 0.85 ? 1 : 2,      // most small, a few bigger
    opacity: 0.2 + rand() * 0.5
  }))
})
</script>

<template>
  <div v-if="expedition.current" ref="containerRef" class="voyage-map">
    <!-- Static starfield (parallax via background-attachment fixed feel) -->
    <div class="starfield" aria-hidden="true">
      <span
        v-for="(s, i) in stars"
        :key="i"
        class="starfield__star"
        :style="{
          left: s.x + '%',
          top: s.y + '%',
          width: s.size + 'px',
          height: s.size + 'px',
          opacity: s.opacity
        }"
      />
    </div>

    <!-- The voyage line itself -->
    <div class="voyage">
      <!-- Origin node (top) -->
      <div class="node node--origin">
        <div class="node__core">
          <svg viewBox="0 0 32 32" width="22" height="22" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="6" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="16" cy="16" r="11" stroke="currentColor" stroke-width="0.6" opacity="0.5" stroke-dasharray="2 2"/>
          </svg>
        </div>
        <div class="node__label">
          <span class="label node__kicker">Origin</span>
          <span class="display node__name">{{ originName }}</span>
          <span class="mono node__meta">DEPARTURE LOGGED</span>
        </div>
      </div>

      <!-- Connecting line + day markers + sector dividers -->
      <div class="voyage__line">

        <template v-for="sector in sectorNodes" :key="sector.idx">
          <!-- Sector header (between sectors) -->
          <div
            class="sector"
            :class="{
              'sector--current': sector.isCurrentSector,
              'sector--past':    sector.isPastSector,
              'sector--future':  sector.isFutureSector
            }"
          >
            <span class="sector__bar" aria-hidden="true" />
            <div class="sector__plate">
              <span class="mono sector__num">SEC-{{ String(sector.number).padStart(2, '0') }}</span>
              <span class="display sector__name">{{ sector.name }}</span>
              <span class="mono sector__days">D{{ sector.startDay }}–D{{ sector.endDay }} · {{ sector.length }}d</span>
            </div>
          </div>

          <!-- Days within this sector -->
          <div class="sector__days-list">
            <template v-for="d in dayMarkers.filter(m => m.sectorIdx === sector.idx)" :key="d.day">
              <div
                class="day"
                :class="{
                  'day--past':    d.isPast,
                  'day--today':   d.isToday,
                  'day--future':  d.isFuture
                }"
                :ref="d.isToday ? (el) => { todayMarkerRef = el } : null"
                :style="d.isPast && d.completion !== null
                  ? { '--day-fill': d.completion }
                  : {}"
              >
                <span class="day__connector" aria-hidden="true" />
                <span class="day__marker" aria-hidden="true">
                  <!-- Today: pulsing reticle -->
                  <template v-if="d.isToday">
                    <span class="day__reticle">
                      <span class="day__reticle-ring day__reticle-ring--outer" />
                      <span class="day__reticle-ring day__reticle-ring--inner" />
                      <span class="day__reticle-dot" />
                    </span>
                  </template>
                  <!-- Past: filled by completion intensity -->
                  <template v-else-if="d.isPast">
                    <span class="day__dot" />
                  </template>
                  <!-- Future: hollow ring -->
                  <template v-else>
                    <span class="day__dot day__dot--hollow" />
                  </template>
                </span>
                <span class="day__label mono">
                  D{{ d.day }}
                  <template v-if="d.isToday"> · TODAY</template>
                </span>
              </div>
            </template>
          </div>
        </template>

      </div>

      <!-- Destination node (bottom) -->
      <div class="node node--destination">
        <div class="node__core">
          <svg viewBox="0 0 32 32" width="26" height="26" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="3" fill="currentColor"/>
            <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.2"/>
            <circle cx="16" cy="16" r="13" stroke="currentColor" stroke-width="0.6" opacity="0.5"/>
          </svg>
        </div>
        <div class="node__label">
          <span class="label node__kicker">Destination</span>
          <span class="display node__name">{{ destination?.name }}</span>
          <span v-if="destination?.poetic" class="node__poetic">"{{ destination.poetic }}"</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voyage-map {
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: var(--s-5) var(--s-4);
  -webkit-overflow-scrolling: touch;
}

/* Hide scrollbar but keep scrolling */
.voyage-map::-webkit-scrollbar { width: 0; }

/* — Starfield — */
.starfield {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.starfield__star {
  position: absolute;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.4);
}

/* — Voyage container — */
.voyage {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* — Origin / Destination nodes — */
.node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  text-align: center;
  padding: var(--s-4);
  position: relative;
  z-index: 2;
}

.node__core {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  background: var(--bulkhead);
  border: 1px solid var(--cyan-deep);
  border-radius: 50%;
  color: var(--cyan);
  position: relative;
}
.node--origin .node__core {
  border-color: var(--signal-low);
  color: var(--signal-dim);
}
.node--destination .node__core {
  border-color: var(--amber);
  color: var(--amber);
  box-shadow: 0 0 16px -4px var(--amber);
}

.node__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.node__kicker {
  color: var(--signal-low);
  font-size: 9px;
  letter-spacing: 0.18em;
}
.node--destination .node__kicker { color: var(--amber-deep); }

.node__name {
  font-size: 22px;
  color: var(--signal);
  line-height: 1.1;
}
.node--destination .node__name { font-size: 26px; color: var(--amber); }

.node__meta {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
  margin-top: 2px;
}
.node__poetic {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--cyan);
  font-size: 13px;
  margin-top: 4px;
  max-width: 280px;
}

/* — Connecting line — */
.voyage__line {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Vertical spine running through the line */
.voyage__line::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg,
    var(--line) 0%,
    var(--line-hi) 25%,
    var(--line-hi) 75%,
    var(--line) 100%);
  transform: translateX(-50%);
  z-index: 0;
}

/* — Sector divider plate — */
.sector {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin: var(--s-5) 0 var(--s-3);
}

.sector__bar {
  flex: 1;
  height: 1px;
  background: var(--line-hi);
  opacity: 0.4;
}

.sector__plate {
  display: flex;
  flex-direction: column;
  gap: 1px;
  align-items: center;
  padding: var(--s-2) var(--s-3);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-align: center;
  white-space: nowrap;
}
.sector--current .sector__plate {
  border-color: var(--amber);
  box-shadow: var(--glow-amber);
}
.sector--past .sector__plate {
  border-color: var(--amber-deep);
  opacity: 0.65;
}
.sector__num {
  color: var(--signal-low);
  font-size: 8px;
  letter-spacing: 0.18em;
}
.sector--current .sector__num { color: var(--amber-deep); }
.sector--past .sector__num    { color: var(--amber-deep); }

.sector__name {
  color: var(--signal);
  font-size: 16px;
  line-height: 1;
}
.sector--current .sector__name { color: var(--amber); }

.sector__days {
  color: var(--signal-low);
  font-size: 8px;
  letter-spacing: 0.1em;
  margin-top: 2px;
}

/* Sector divider plate continues with bars on both sides */
.sector::before {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line-hi);
  opacity: 0.4;
}

/* — Days list — */
.sector__days-list {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.day {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  width: 100%;
  height: 24px;
  gap: var(--s-3);
}

/* Connector line between marker and label */
.day__connector {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line));
  align-self: center;
}

.day__marker {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  z-index: 2;
  background: var(--hull);
  border-radius: 50%;
}

.day__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--amber);
  /* Past day fill scales with completion */
  opacity: calc(0.25 + (var(--day-fill, 0) * 0.75));
}
.day--future .day__dot,
.day__dot--hollow {
  background: transparent;
  border: 1px solid var(--line-hi);
  opacity: 0.6;
}

/* Today reticle */
.day__reticle {
  position: relative;
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
}
.day__reticle-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--cyan);
}
.day__reticle-ring--outer {
  width: 22px;
  height: 22px;
  animation: reticle-pulse 2.4s ease-in-out infinite;
}
.day__reticle-ring--inner {
  width: 14px;
  height: 14px;
  border-color: var(--cyan);
  opacity: 0.7;
  animation: reticle-pulse 2.4s ease-in-out infinite reverse;
}
.day__reticle-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--cyan);
  box-shadow: 0 0 8px var(--cyan);
  z-index: 1;
}
@keyframes reticle-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%      { opacity: 1;   transform: scale(1.15); }
}

.day__label {
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--signal-low);
  white-space: nowrap;
  align-self: center;
}
.day--today .day__label {
  color: var(--cyan);
  font-weight: 600;
}
.day--past .day__label {
  color: var(--signal-dim);
}
</style>