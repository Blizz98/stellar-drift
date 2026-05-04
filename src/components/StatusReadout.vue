<script setup>
import { computed } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { useCaptainStore } from '@/stores/captain'

const expedition = useExpeditionStore()
const habits = useHabitsStore()
const captain = useCaptainStore()

const completionPct = computed(() => Math.round(habits.todayCompletionRate * 100))
const sectorLabel = computed(() => `Sector ${expedition.currentSector} of 4`)
</script>

<template>
  <section v-if="expedition.current" class="readout">
    <header class="readout__head">
      <div>
        <p class="label">Active expedition</p>
        <h2 class="display readout__title">{{ expedition.current.name }}</h2>
        <p class="readout__meta">
          <span class="mono">→ {{ expedition.current.destination }}</span>
          <span class="readout__sep">·</span>
          <span class="mono">{{ sectorLabel }}</span>
        </p>
        <RouterLink to="/captain" class="readout__captain mono">
          <span class="readout__captain-pip" />
          <span class="readout__captain-name">{{ captain.state.name }}</span>
          <span class="readout__captain-sep">·</span>
          <span class="readout__captain-rank">{{ captain.currentRank.name.toUpperCase() }}</span>
        </RouterLink>
      </div>

      <div class="readout__metrics">
        <div class="metric">
          <span class="metric__value mono">{{ String(expedition.daysElapsed).padStart(3, '0') }}</span>
          <span class="metric__label label">Days elapsed</span>
        </div>
        <div class="metric">
          <span class="metric__value mono">{{ String(expedition.daysRemaining).padStart(3, '0') }}</span>
          <span class="metric__label label">Days remaining</span>
        </div>
        <div class="metric">
          <span class="metric__value mono">{{ completionPct }}%</span>
          <span class="metric__label label">Today's systems</span>
        </div>
      </div>
    </header>

    <div class="progress">
      <div class="progress__track">
        <div class="progress__fill" :style="{ width: expedition.progressPercent + '%' }" />
        <div
          v-for="i in 3"
          :key="i"
          class="progress__milestone"
          :style="{ left: (i * 25) + '%' }"
        />
      </div>
      <div class="progress__legend mono">
        <span>{{ expedition.progressPercent }}% of voyage complete</span>
        <span class="readout__route">{{ expedition.current.shipClass.toUpperCase() }} CLASS</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.readout {
  padding: var(--s-6);
  background: linear-gradient(135deg, var(--bulkhead) 0%, var(--hull) 100%);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

.readout::after {
  /* tiny corner registration mark */
  content: '';
  position: absolute;
  top: 12px; right: 12px;
  width: 24px; height: 24px;
  border-top: 1px solid var(--amber);
  border-right: 1px solid var(--amber);
  opacity: 0.4;
}

.readout__head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s-6);
  align-items: start;
  margin-bottom: var(--s-6);
}

.readout__title {
  font-size: 38px;
  margin: 4px 0 8px;
  color: var(--signal);
}

.readout__meta {
  margin: 0;
  font-size: 13px;
  color: var(--signal-dim);
  display: flex;
  gap: var(--s-2);
  align-items: center;
}
.readout__sep { color: var(--signal-low); }

.readout__captain {
  margin-top: var(--s-3);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: var(--hull);
  border: 1px solid var(--amber-deep);
  border-radius: 999px;
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--signal-dim);
  transition: all var(--t-fast) var(--ease);
}
.readout__captain:hover {
  border-color: var(--amber);
  background: var(--bulkhead);
}
.readout__captain-pip {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 6px var(--amber);
}
.readout__captain-name { color: var(--signal); }
.readout__captain-sep { color: var(--signal-low); }
.readout__captain-rank { color: var(--amber); }

.readout__metrics {
  display: flex;
  gap: var(--s-6);
  align-items: flex-start;
}

.metric { display: flex; flex-direction: column; gap: 4px; min-width: 64px; }
.metric__value {
  font-size: 28px;
  color: var(--amber);
  letter-spacing: 0.04em;
  line-height: 1;
}
.metric__label {
  color: var(--signal-low);
  font-size: 9px;
}

.progress { margin-top: var(--s-2); }
.progress__track {
  position: relative;
  height: 6px;
  background: var(--hull);
  border-radius: 999px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.progress__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--amber-deep), var(--amber));
  box-shadow: 0 0 12px var(--amber);
  transition: width var(--t-slow) var(--ease);
}
.progress__milestone {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background: var(--line-hi);
}
.progress__legend {
  margin-top: var(--s-3);
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--signal-low);
}
.readout__route { color: var(--cyan-deep); }

@media (max-width: 720px) {
  .readout { padding: var(--s-5); }
  .readout__head { grid-template-columns: 1fr; }
  .readout__title { font-size: 28px; }
  .readout__metrics { gap: var(--s-4); }
  .metric__value { font-size: 22px; }
}
</style>
