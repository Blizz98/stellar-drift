<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useCaptainStore } from '@/stores/captain'
import { SHIPS, shipById } from '@/data/ships'
import { destinationById } from '@/data/destinations'
import DestinationPicker from '@/components/DestinationPicker.vue'
import ShipPicker from '@/components/ShipPicker.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const captain = useCaptainStore()

// ——— form state ———
const selectedShipId = ref('explorer')
const selectedDestId = ref(null)
const voyageName     = ref('')

const ship = computed(() => shipById(selectedShipId.value))
const dest = computed(() => destinationById(selectedDestId.value))

const computedDuration = computed(() => {
  if (!ship.value || !dest.value) return null
  return Math.ceil(dest.value.distanceDays / ship.value.velocity)
})

const computedDurationOK = computed(() => {
  if (!computedDuration.value || !ship.value) return false
  return computedDuration.value <= ship.value.maxRangeDays
})

const canLaunch = computed(() =>
  voyageName.value.trim() && dest.value && ship.value && computedDurationOK.value
)

// Suggest a default voyage name when destination changes
function applyDefaultName() {
  if (!voyageName.value && dest.value) {
    voyageName.value = `Voyage to ${dest.value.name}`
  }
}

function launch() {
  if (!canLaunch.value) return
  expedition.launchExpedition({
    name: voyageName.value.trim(),
    destination: dest.value.name,
    destinationId: dest.value.id,
    shipClass: ship.value.id,
    durationDays: computedDuration.value
  })
  router.push('/habits')
}
</script>

<template>
  <div class="launch">
    <header class="launch__head">
      <p class="label">Mission planning</p>
      <h1 class="display launch__title">Plot a course.</h1>
      <p class="launch__lede">
        Choose a destination, choose a hull. The voyage duration is determined by both —
        farther worlds take longer, faster ships shorten the trip. Some places are not yet
        within your reach. They will be.
      </p>

      <div class="launch__captain">
        <span class="label launch__captain-label">Currently flying as</span>
        <span class="launch__captain-rank mono">{{ captain.currentRank.name.toUpperCase() }}</span>
      </div>
    </header>

    <!-- Step 1: Ship selection -->
    <section class="step">
      <header class="step__head">
        <span class="label">Step 01</span>
        <h2 class="step__title">Select your ship</h2>
        <p class="step__lede">Each hull has a max voyage range and a cruise velocity.</p>
      </header>

      <ShipPicker v-model="selectedShipId" />
    </section>

    <!-- Step 2: Destination -->
    <section class="step">
      <header class="step__head">
        <span class="label">Step 02</span>
        <h2 class="step__title">Set destination</h2>
        <p class="step__lede">
          Tap a destination to read more, then set your course.
          Distances are in light-days; duration depends on your hull.
        </p>
      </header>

      <DestinationPicker
        v-model="selectedDestId"
        :ship-id="selectedShipId"
        @update:model-value="applyDefaultName"
      />
    </section>

    <!-- Step 3: Voyage name + summary -->
    <section v-if="dest" class="step">
      <header class="step__head">
        <span class="label">Step 03</span>
        <h2 class="step__title">Name your voyage</h2>
      </header>

      <input class="input launch__name" v-model="voyageName" placeholder="e.g. The Long Quiet" />

      <aside class="summary">
        <div class="summary__row">
          <span class="label">Destination</span>
          <span>{{ dest.name }}</span>
        </div>
        <div class="summary__row">
          <span class="label">Hull</span>
          <span>{{ ship.name }}</span>
        </div>
        <div class="summary__row">
          <span class="label">Distance</span>
          <span class="mono">{{ dest.distanceDays }} light-days</span>
        </div>
        <div class="summary__row summary__row--hi">
          <span class="label">Computed duration</span>
          <span class="mono summary__duration">{{ computedDuration }} days</span>
        </div>
      </aside>
    </section>

    <footer class="launch__foot">
      <button class="btn btn-primary launch__go" :disabled="!canLaunch" @click="launch">
        Initiate launch sequence →
      </button>
      <p class="launch__note mono">
        After launch you'll configure systems (your daily habits) on the Systems screen.
      </p>
    </footer>
  </div>
</template>

<style scoped>
.launch { display: flex; flex-direction: column; gap: var(--s-7); }

.launch__head {
  position: relative;
  padding-bottom: var(--s-5);
  border-bottom: 1px solid var(--line);
  max-width: 700px;
}
.launch__title { font-size: 56px; margin: var(--s-2) 0 var(--s-4); color: var(--signal); }
.launch__lede { color: var(--signal-dim); line-height: 1.65; font-size: 16px; }

.launch__captain {
  margin-top: var(--s-4);
  display: inline-flex;
  align-items: center;
  gap: var(--s-3);
  padding: 6px 14px;
  background: var(--hull);
  border: 1px solid var(--amber-deep);
  border-radius: 999px;
}
.launch__captain-label { color: var(--signal-low); font-size: 9px; }
.launch__captain-rank { color: var(--amber); font-size: 11px; letter-spacing: 0.14em; }

/* — Step layout — */
.step { display: flex; flex-direction: column; gap: var(--s-4); }
.step__head { max-width: 700px; }
.step__title {
  font-size: 22px;
  margin: 4px 0 6px;
  color: var(--signal);
  font-weight: 500;
}
.step__lede { color: var(--signal-dim); margin: 0; font-size: 13px; line-height: 1.6; }

/* — Ships grid — */
.ships {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--s-3);
}
.ship {
  text-align: left;
  padding: var(--s-4);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  transition: all var(--t-fast) var(--ease);
}
.ship:hover:not(.ship--locked) {
  border-color: var(--line-hi);
  background: var(--console);
}
.ship--active {
  border-color: var(--amber);
  background: var(--console);
  box-shadow: var(--glow-amber);
}
.ship--locked { opacity: 0.4; cursor: not-allowed; }

.ship__head { display: flex; justify-content: space-between; align-items: center; }
.ship__name {
  font-size: 16px;
  margin: 0;
  color: var(--signal);
  font-weight: 500;
}
.ship__lock { color: var(--amber-deep); font-size: 9px; }

.ship__tag {
  font-size: 12px;
  color: var(--signal-low);
  margin: 0;
  font-style: italic;
}

.ship__stats {
  display: flex;
  gap: var(--s-3);
  margin: 0;
  padding-top: var(--s-3);
  border-top: 1px dashed var(--line);
  font-size: 10px;
}
.ship__stats > div { display: flex; flex-direction: column; gap: 2px; }
.ship__stats dt { color: var(--signal-low); letter-spacing: 0.08em; }
.ship__stats dd { color: var(--signal); margin: 0; }

/* — Voyage name + summary — */
.launch__name { max-width: 460px; }

.summary {
  margin-top: var(--s-4);
  padding: var(--s-4);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-left: 2px solid var(--amber);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  max-width: 460px;
}
.summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--signal);
}
.summary__row .label { color: var(--signal-low); }
.summary__row--hi {
  padding-top: var(--s-2);
  border-top: 1px dashed var(--line);
}
.summary__duration { color: var(--amber); font-size: 16px; }

/* — Footer — */
.launch__foot {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  padding-top: var(--s-5);
  border-top: 1px solid var(--line);
}
.launch__go { padding: var(--s-4) var(--s-6); font-size: 13px; }
.launch__go:disabled { opacity: 0.4; cursor: not-allowed; }
.launch__note { color: var(--signal-low); font-size: 11px; max-width: 360px; }

@media (max-width: 720px) {
  .launch__title { font-size: 36px; }
  .launch__foot { flex-direction: column; align-items: flex-start; }
  .step__title { font-size: 18px; }
}
</style>
