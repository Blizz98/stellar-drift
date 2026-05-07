<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { useCaptainStore, xpForAbandonment } from '@/stores/captain'
import { destinationById } from '@/data/destinations'
import { shipById } from '@/data/ships'
import VoyageMap from '@/components/VoyageMap.vue'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()
const captain = useCaptainStore()

const destination = computed(() =>
  expedition.current?.destinationId
    ? destinationById(expedition.current.destinationId)
    : null
)
const ship = computed(() =>
  expedition.current?.shipClass ? shipById(expedition.current.shipClass) : null
)

const sectorName = computed(() => {
  const names = ['Departure', 'Open Space', 'Deep Voyage', 'Approach']
  return names[expedition.currentSector - 1] || ''
})

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
}
</script>

<template>
  <div v-if="!expedition.isActive" class="empty-wrap">
    <EmptyState
      title="No voyage in progress"
      body="Plot a course to begin your next run."
    >
      <button class="btn btn-primary" @click="router.push('/launch')" style="margin-top: var(--s-4)">
        Plot a course →
      </button>
    </EmptyState>
  </div>

  <div v-else class="expedition">
    <!-- Header: voyage name + key readouts -->
    <header class="exp-head">
      <div class="exp-head__name">
        <p class="label exp-head__kicker">Voyage in progress</p>
        <h1 class="display exp-head__title">{{ expedition.current.name }}</h1>
      </div>

      <div class="exp-head__readouts">
        <div class="readout">
          <span class="readout__label label">Sector</span>
          <span class="readout__value display">{{ expedition.currentSector }} <span class="readout__total mono">/ 4</span></span>
          <span class="readout__sub mono">{{ sectorName.toUpperCase() }}</span>
        </div>
        <div class="readout">
          <span class="readout__label label">Day</span>
          <span class="readout__value display">{{ expedition.daysElapsed }} <span class="readout__total mono">/ {{ expedition.current.durationDays }}</span></span>
          <span class="readout__sub mono">T-{{ expedition.daysRemaining }}d REMAINING</span>
        </div>
      </div>
    </header>

    <!-- Voyage map -->
    <section class="voyage-section">
      <header class="section-head">
        <span class="label">Navigation</span>
        <h2 class="display section-title">Voyage track</h2>
      </header>
      <VoyageMap />
    </section>

    <!-- Ship & destination details -->
    <section class="details">
      <article class="detail-card">
        <header class="detail-card__head">
          <span class="label detail-card__kicker">Hull</span>
        </header>
        <h3 class="display detail-card__title">{{ ship?.name }}</h3>
        <p class="detail-card__tag mono">{{ ship?.tagline }}</p>
        <p class="detail-card__desc">{{ ship?.description }}</p>
        <dl class="detail-card__specs">
          <div><dt class="label">Velocity</dt><dd class="mono">{{ ship?.velocity }} c</dd></div>
          <div><dt class="label">Range</dt><dd class="mono">{{ ship?.maxRangeDays }}d max</dd></div>
        </dl>
      </article>

      <article v-if="destination" class="detail-card">
        <header class="detail-card__head">
          <span class="label detail-card__kicker">Destination</span>
        </header>
        <h3 class="display detail-card__title">{{ destination.name }}</h3>
        <p class="detail-card__tag mono">{{ destination.subtitle }}</p>
        <p class="detail-card__poetic display">"{{ destination.poetic }}"</p>
        <p class="detail-card__desc">{{ destination.description }}</p>
        <dl class="detail-card__specs">
          <div><dt class="label">Distance</dt><dd class="mono">{{ destination.distanceDays }} ld</dd></div>
        </dl>
      </article>
    </section>

    <!-- End-voyage section -->
    <section class="actions">
      <header class="actions__head">
        <p class="label">End voyage</p>
        <h3 class="actions__title display">Voyages end. That's the point.</h3>
        <p class="actions__lede">
          The voyage will conclude automatically when its duration is reached.
          You can also abandon it now — your captain will earn experience
          proportional to the days you completed.
        </p>
      </header>
      <div class="actions__row">
        <button class="btn actions__abandon" @click="handleAbandon">◇ Abandon voyage</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.empty-wrap { padding-top: var(--s-7); }

.expedition {
  display: flex;
  flex-direction: column;
  gap: var(--s-7);
}

/* — Voyage header — */
.exp-head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: var(--s-5);
  padding-bottom: var(--s-5);
  border-bottom: 1px solid var(--line);
}
.exp-head__kicker { color: var(--amber-deep); }
.exp-head__title {
  font-size: 48px;
  margin: 4px 0 0;
  color: var(--signal);
  line-height: 1;
}

.exp-head__readouts {
  display: flex;
  gap: var(--s-5);
}
.readout {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-end;
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--amber);
  border-radius: var(--radius);
  min-width: 140px;
}
.readout__label {
  color: var(--amber-deep);
  font-size: 9px;
}
.readout__value {
  font-size: 32px;
  color: var(--amber);
  line-height: 1;
}
.readout__total {
  font-size: 14px;
  color: var(--signal-low);
}
.readout__sub {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
  margin-top: 2px;
}

/* — Section heads (consistent across voyage screen) — */
.section-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--s-4);
}
.section-head .label { color: var(--cyan-deep); }
.section-title {
  font-size: 24px;
  color: var(--signal);
  margin: 0;
}

/* — Detail cards (ship / destination) — */
.details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-4);
}

.detail-card {
  position: relative;
  padding: var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
}

/* Faint scanline texture, matching cards / masthead */
.detail-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg, transparent 0, transparent 3px,
    rgba(232, 168, 70, 0.012) 3px, rgba(232, 168, 70, 0.012) 4px
  );
  pointer-events: none;
}

.detail-card__head { margin-bottom: var(--s-2); position: relative; z-index: 1; }
.detail-card__kicker { color: var(--amber-deep); }

.detail-card__title {
  font-size: 26px;
  margin: 0 0 var(--s-2);
  color: var(--signal);
  position: relative;
  z-index: 1;
}
.detail-card__tag {
  font-size: 10px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
  margin: 0 0 var(--s-3);
  position: relative;
  z-index: 1;
}
.detail-card__poetic {
  font-style: italic;
  color: var(--cyan);
  font-size: 14px;
  margin: var(--s-3) 0;
  position: relative;
  z-index: 1;
}
.detail-card__desc {
  color: var(--signal-dim);
  font-size: 13px;
  line-height: 1.65;
  margin: 0 0 var(--s-4);
  position: relative;
  z-index: 1;
}

.detail-card__specs {
  display: flex;
  gap: var(--s-4);
  padding-top: var(--s-3);
  border-top: 1px dashed var(--line);
  margin: 0;
  position: relative;
  z-index: 1;
}
.detail-card__specs > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-card__specs dt {
  color: var(--signal-low);
  font-size: 9px;
}
.detail-card__specs dd {
  margin: 0;
  font-size: 13px;
  color: var(--amber);
}

/* — End-voyage actions — */
.actions {
  padding: var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--thrust-deep, var(--line-hi));
  border-radius: var(--radius);
}
.actions__head { margin-bottom: var(--s-4); }
.actions__title {
  font-size: 22px;
  color: var(--signal);
  margin: 4px 0 var(--s-2);
}
.actions__lede {
  color: var(--signal-dim);
  font-size: 13px;
  line-height: 1.65;
  margin: 0;
}

.actions__row { display: flex; }
.actions__abandon {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 10px 18px;
  background: transparent;
  border: 1px solid var(--line-hi);
  color: var(--signal-dim);
  border-radius: var(--radius-sm);
  transition: all var(--t-fast) var(--ease);
}
.actions__abandon:hover {
  background: var(--hull);
  border-color: var(--thrust);
  color: var(--thrust);
}

@media (max-width: 720px) {
  .exp-head { grid-template-columns: 1fr; align-items: flex-start; }
  .exp-head__title { font-size: 36px; }
  .exp-head__readouts { width: 100%; }
  .readout { flex: 1; min-width: 0; }
  .readout__value { font-size: 24px; }
  .details { grid-template-columns: 1fr; }
}
</style>