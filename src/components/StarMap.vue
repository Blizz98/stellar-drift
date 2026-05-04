<script setup>
import { computed } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'

const expedition = useExpeditionStore()
const habits = useHabitsStore()

/**
 * Build an array of day-points laid out along an arcing path.
 * Each point shows whether that day was logged (and how completely).
 */
const points = computed(() => {
  if (!expedition.current) return []
  const days = expedition.current.durationDays
  const start = new Date(expedition.current.startedAt)
  const out = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    const t = i / Math.max(1, days - 1) // 0..1
    // Arc parameters: x sweeps left→right, y rises with a sine bump
    const x = 40 + t * 720
    const y = 110 - Math.sin(t * Math.PI) * 60
    out.push({
      idx: i + 1,
      date: iso,
      x, y,
      isPast: i + 1 < expedition.daysElapsed,
      isToday: i + 1 === expedition.daysElapsed,
      rate: habits.completionRate(iso)
    })
  }
  return out
})

const pathD = computed(() => {
  if (points.value.length === 0) return ''
  const [first, ...rest] = points.value
  return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ')
})

const sectorMarks = computed(() => {
  if (points.value.length === 0) return []
  const total = points.value.length
  return [0.25, 0.5, 0.75].map(t => {
    const idx = Math.floor(total * t)
    return points.value[idx]
  })
})
</script>

<template>
  <div class="starmap" v-if="expedition.current">
    <svg viewBox="0 0 800 200" class="starmap__svg" preserveAspectRatio="xMidYMid meet">
      <!-- Background grid -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.1"/>
        </pattern>
        <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stop-color="var(--amber)"  stop-opacity="0.1"/>
          <stop offset="100%" stop-color="var(--amber)" stop-opacity="0.7"/>
        </linearGradient>
      </defs>
      <rect width="800" height="200" fill="url(#grid)" opacity="0.4"/>

      <!-- Voyage path -->
      <path :d="pathD" stroke="var(--line-hi)" stroke-width="1" fill="none" stroke-dasharray="4 4"/>
      <path
        :d="pathD"
        stroke="url(#trail)"
        stroke-width="1.5"
        fill="none"
        :stroke-dasharray="`${(expedition.daysElapsed / expedition.current.durationDays) * 1500} 1500`"
      />

      <!-- Sector markers -->
      <g v-for="(m, i) in sectorMarks" :key="`s${i}`">
        <line :x1="m.x" :y1="m.y - 14" :x2="m.x" :y2="m.y + 14" stroke="var(--line-hi)" stroke-width="0.5"/>
        <text :x="m.x" :y="m.y - 18" text-anchor="middle"
              fill="var(--signal-low)" font-size="9" font-family="JetBrains Mono">
          SECTOR {{ i + 2 }}
        </text>
      </g>

      <!-- Day points -->
      <g v-for="p in points" :key="p.idx">
        <circle
          :cx="p.x"
          :cy="p.y"
          :r="p.isToday ? 5 : (p.isPast ? 2.5 : 1.5)"
          :fill="p.isPast ? 'var(--amber)' : 'var(--line-hi)'"
          :opacity="p.isToday ? 1 : (p.isPast ? Math.max(0.4, p.rate) : 0.5)"
        />
        <circle
          v-if="p.isToday"
          :cx="p.x"
          :cy="p.y"
          r="9"
          fill="none"
          stroke="var(--amber)"
          stroke-width="1"
          opacity="0.7"
        >
          <animate attributeName="r" from="5" to="14" dur="2.4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.7" to="0" dur="2.4s" repeatCount="indefinite"/>
        </circle>
      </g>

      <!-- Origin & destination labels -->
      <text x="40" y="180" fill="var(--signal-low)" font-size="9" font-family="JetBrains Mono">
        ◉ ORIGIN
      </text>
      <text x="760" y="180" text-anchor="end" fill="var(--cyan)" font-size="9" font-family="JetBrains Mono">
        {{ expedition.current.destination.toUpperCase() }} ◇
      </text>
    </svg>
  </div>
</template>

<style scoped>
.starmap {
  padding: var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  color: var(--signal);
}
.starmap__svg {
  width: 100%;
  height: auto;
  display: block;
}
</style>
