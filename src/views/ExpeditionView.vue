<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { useCaptainStore, xpForCompletion, xpForAbandonment } from '@/stores/captain'
import VoyageMap from '@/components/VoyageMap.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()
const captain = useCaptainStore()

const todayISO = () => new Date().toISOString().slice(0, 10)

function handleComplete() {
  if (!confirm('Conclude this voyage now? It will be archived to the Log.')) return
  const exp = expedition.current
  const avgRate = habits.averageCompletionForExpedition(exp.id, exp.startedAt, todayISO())
  const xp = xpForCompletion(exp.durationDays, avgRate)
  expedition.completeExpedition()
  captain.grantXP({
    amount: xp,
    source: 'completion',
    voyageName: exp.name,
    voyageId: exp.id
  })
  router.push('/log')
}

function handleAbandon() {
  if (!confirm('Abandon ship? The voyage will be archived as abandoned. This is fine — most voyages end before the destination.')) return
  const exp = expedition.current
  const daysElapsed = expedition.daysElapsed
  const xp = xpForAbandonment(daysElapsed, exp.durationDays)
  expedition.abandonExpedition()
  captain.grantXP({
    amount: xp,
    source: 'abandonment',
    voyageName: exp.name,
    voyageId: exp.id
  })
  // Debrief modal handles routing now.
}

const sectorMessage = computed(() => {
  const s = expedition.currentSector
  return ({
    1: 'Departure. Establish rhythms; do not chase perfection.',
    2: 'Open space. The novelty is gone. This is the test.',
    3: 'Deep voyage. Watch for fatigue. Recovery is part of the work.',
    4: 'Approach. The destination is in view. Land cleanly.'
  })[s] || ''
})
</script>

<template>
  <div v-if="!expedition.isActive" class="empty-wrap">
    <EmptyState
      title="Drifting in dock"
      body="No voyage is currently underway. The star map awakens once you launch."
    />
  </div>

  <div v-else class="exp">
    <header class="exp__head">
      <p class="label">Voyage telemetry</p>
      <h1 class="display exp__title">{{ expedition.current.name }}</h1>
      <p class="exp__sub mono">
        {{ expedition.current.shipClass.toUpperCase() }} CLASS · BOUND FOR {{ expedition.current.destination.toUpperCase() }}
      </p>
    </header>

    <VoyageMap />

    <section class="sector">
      <header class="sector__head">
        <span class="label">Current sector</span>
        <h2 class="sector__name display">Sector {{ expedition.currentSector }} of 4</h2>
      </header>
      <p class="sector__msg">{{ sectorMessage }}</p>
    </section>

    <section class="actions">
      <header class="actions__head">
        <p class="label">End voyage</p>
        <h3 class="actions__title">Voyages end. That's the point.</h3>
        <p class="actions__lede">
          Whether you reached the destination or pulled the plug at sector two —
          archive this run cleanly and start the next one. There is no streak to protect.
        </p>
      </header>
      <div class="actions__row">
        <button class="btn" @click="handleAbandon">◇ Abandon voyage</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.empty-wrap { padding-top: var(--s-7); }

.exp { display: flex; flex-direction: column; gap: var(--s-6); }

.exp__head { padding-bottom: var(--s-3); border-bottom: 1px solid var(--line); }
.exp__title { font-size: 44px; margin: 4px 0 var(--s-2); color: var(--signal); }
.exp__sub { font-size: 11px; letter-spacing: 0.14em; color: var(--cyan-deep); }

.sector {
  padding: var(--s-5);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.sector__head { margin-bottom: var(--s-2); }
.sector__name {
  font-size: 28px;
  margin: 4px 0 0;
  color: var(--amber);
}
.sector__msg {
  margin: var(--s-3) 0 0;
  color: var(--signal-dim);
  line-height: 1.6;
  font-size: 16px;
  max-width: 640px;
}

.actions {
  padding: var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
}
.actions__head { margin-bottom: var(--s-4); }
.actions__title {
  font-size: 18px;
  margin: 4px 0 var(--s-2);
  color: var(--signal);
  font-weight: 500;
}
.actions__lede {
  color: var(--signal-dim);
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  max-width: 580px;
}
.actions__row { display: flex; gap: var(--s-2); flex-wrap: wrap; }

@media (max-width: 720px) {
  .exp__title { font-size: 30px; }
}
</style>
