<script setup>
import { computed } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'

const expedition = useExpeditionStore()
const habits = useHabitsStore()

/**
 * Build sector blocks. Each sector contains its day cells with completion data.
 * Vertical layout: read top→bottom like a flight plan.
 */
const sectors = computed(() => {
  if (!expedition.current) return []
  const total = expedition.current.durationDays
  const sectorSize = total / 4
  const start = new Date(expedition.current.startedAt + 'T00:00:00')

  const out = []
  for (let s = 0; s < 4; s++) {
    const fromIdx = Math.floor(s * sectorSize)
    const toIdx   = Math.floor((s + 1) * sectorSize)
    const days = []
    for (let i = fromIdx; i < toIdx; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      days.push({
        idx: i + 1,
        date: iso,
        isPast: i + 1 < expedition.daysElapsed,
        isToday: i + 1 === expedition.daysElapsed,
        rate: habits.completionRate(iso)
      })
    }
    out.push({
      num: s + 1,
      isCurrent: expedition.currentSector === s + 1,
      isPast: expedition.currentSector > s + 1,
      days
    })
  }
  return out
})

const sectorNames = { 1: 'Departure', 2: 'Open Space', 3: 'Deep Voyage', 4: 'Approach' }
</script>

<template>
  <div v-if="expedition.current" class="vmap">
    <header class="vmap__head">
      <div class="vmap__poles">
        <span class="mono">◉ ORIGIN</span>
        <span class="mono vmap__dest">{{ expedition.current.destination.toUpperCase() }} ◇</span>
      </div>
      <div class="vmap__rail" aria-hidden="true">
        <div class="vmap__rail-fill" :style="{ width: expedition.progressPercent + '%' }" />
      </div>
    </header>

    <ol class="sectors">
      <li
        v-for="s in sectors"
        :key="s.num"
        class="sector"
        :class="{
          'sector--current': s.isCurrent,
          'sector--past':    s.isPast
        }"
      >
        <header class="sector__head">
          <span class="sector__num mono">SEC {{ s.num }}</span>
          <span class="sector__name">{{ sectorNames[s.num] }}</span>
          <span v-if="s.isCurrent" class="sector__badge mono">CURRENT</span>
        </header>

        <div class="cells" role="group" :aria-label="`Sector ${s.num} days`">
          <span
            v-for="d in s.days"
            :key="d.idx"
            class="cell"
            :class="{
              'cell--past':  d.isPast,
              'cell--today': d.isToday
            }"
            :style="{ '--rate': d.rate }"
            :title="`Day ${d.idx} — ${Math.round(d.rate * 100)}%`"
          />
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.vmap {
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}

.vmap__head {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin-bottom: var(--s-4);
}
.vmap__poles {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
}
.vmap__dest { color: var(--cyan); }

.vmap__rail {
  position: relative;
  height: 3px;
  background: var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.vmap__rail-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--amber-deep), var(--amber));
  transition: width var(--t-slow) var(--ease);
  box-shadow: 0 0 8px var(--amber);
}

.sectors {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.sector {
  position: relative;
  padding: var(--s-3) var(--s-3) var(--s-3) var(--s-5);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: all var(--t-med) var(--ease);
}
.sector::before {
  content: '';
  position: absolute;
  top: var(--s-2); bottom: var(--s-2); left: 0;
  width: 3px;
  background: var(--line-hi);
  border-radius: 2px;
}
.sector--past::before    { background: var(--amber-deep); }
.sector--current::before { background: var(--amber); box-shadow: 0 0 12px var(--amber); }
.sector--current {
  border-color: var(--amber-deep);
  background: var(--console);
}

.sector__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin-bottom: var(--s-3);
}
.sector__num {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
}
.sector--past    .sector__num { color: var(--amber-deep); }
.sector--current .sector__num { color: var(--amber); }

.sector__name {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 18px;
  color: var(--signal);
}

.sector__badge {
  margin-left: auto;
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--amber);
  padding: 3px 8px;
  border: 1px solid var(--amber-deep);
  border-radius: 999px;
  animation: pulse-soft 2.4s ease-in-out infinite;
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.55; }
}

.cells {
  display: grid;
  grid-template-columns: repeat(auto-fill, 14px);
  gap: 4px;
}
.cell {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  background: var(--hull);
  border: 1px solid var(--line);
  transition: all var(--t-fast) var(--ease);
}
.cell--past {
  background: rgba(232, 168, 70, calc(0.25 + var(--rate, 0) * 0.75));
  border-color: var(--amber-deep);
}
.cell--today {
  background: var(--amber);
  border-color: var(--amber-soft);
  box-shadow: 0 0 10px var(--amber), inset 0 0 0 2px var(--void);
  animation: cell-pulse 2.2s ease-in-out infinite;
}
@keyframes cell-pulse {
  0%, 100% { box-shadow: 0 0 10px var(--amber), inset 0 0 0 2px var(--void); }
  50%      { box-shadow: 0 0 18px var(--amber), inset 0 0 0 2px var(--void); }
}
</style>
