<script setup>
import { computed } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import { useClock } from '@/composables/useClock'

const expedition = useExpeditionStore()
const { now } = useClock()

const elapsed = computed(() => {
  if (!expedition.current) return null
  // Compute from start-of-voyage (00:00 of departure day, local).
  const start = new Date(expedition.current.startedAt + 'T00:00:00').getTime()
  const ms = Math.max(0, now.value - start)
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return { d, h, m, s }
})

const pad = n => String(n).padStart(2, '0')
const padDay = n => String(n).padStart(3, '0')
</script>

<template>
  <span v-if="elapsed" class="chrono mono" aria-label="Mission elapsed time">
    <span class="chrono__prefix">T+</span>
    <span class="chrono__day">{{ padDay(elapsed.d) }}d</span>
    <span class="chrono__time">
      {{ pad(elapsed.h) }}<span class="chrono__sep">:</span>{{ pad(elapsed.m) }}<span class="chrono__sep chrono__sep--blink">:</span>{{ pad(elapsed.s) }}
    </span>
  </span>
</template>

<style scoped>
.chrono {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--signal-dim);
  font-variant-numeric: tabular-nums;
}
.chrono__prefix { color: var(--amber-deep); font-weight: 600; }
.chrono__day    { color: var(--amber); }
.chrono__time   { color: var(--signal); }
.chrono__sep    { color: var(--signal-low); }
.chrono__sep--blink {
  animation: blink 1.04s steps(2) infinite;
}
@keyframes blink {
  0%, 50%   { opacity: 1; }
  50.01%, 100% { opacity: 0.25; }
}
</style>
