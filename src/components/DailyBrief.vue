<script setup>
import { computed } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { dailyBrief } from '@/composables/useFlavorText'

const expedition = useExpeditionStore()
const habits = useHabitsStore()

const today = new Date().toISOString().slice(0, 10)

const brief = computed(() => {
  if (!expedition.current) return ''
  return dailyBrief(expedition.currentSector, habits.todayCompletionRate, today)
})

const sectorTag = computed(() => {
  const names = { 1: 'Departure', 2: 'Open Space', 3: 'Deep Voyage', 4: 'Approach' }
  return names[expedition.currentSector] || ''
})
</script>

<template>
  <article v-if="expedition.current" class="brief">
    <header class="brief__head">
      <span class="brief__tag mono">FIRST OFFICER · SECTOR {{ expedition.currentSector }} · {{ sectorTag.toUpperCase() }}</span>
    </header>
    <p class="brief__quote display">“{{ brief }}”</p>
  </article>
</template>

<style scoped>
.brief {
  position: relative;
  padding: var(--s-5) var(--s-6);
  background:
    radial-gradient(600px 200px at 100% 0%, rgba(93, 212, 240, 0.06), transparent 70%),
    var(--bulkhead);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cyan);
  border-radius: var(--radius);
}

.brief__head { margin-bottom: var(--s-2); }
.brief__tag {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: var(--cyan-deep);
}

.brief__quote {
  font-size: 22px;
  margin: 0;
  color: var(--signal);
  line-height: 1.4;
  max-width: 720px;
}

@media (max-width: 720px) {
  .brief { padding: var(--s-4); }
  .brief__quote { font-size: 18px; }
}
</style>
