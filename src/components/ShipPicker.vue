<script setup>
import { computed, ref } from 'vue'
import { SHIPS, shipsAvailable, visibleShips } from '@/data/ships'
import { useCaptainStore } from '@/stores/captain'


const captain = useCaptainStore()
const selectedShipId = ref('explorer')

const shipList = computed(() =>{
  return SHIPS.map(s => ({
    ...s,
    unlocked: s.rankRequired <= captain.currentRank.rank
  }))
});

const reducedShipList = computed(() => {
  const { unlocked, locked } = visibleShips(captain.currentRank.rank)

  return [...unlocked, ...locked].map(s => ({
    ...s,
    unlocked: s.rankRequired <= captain.currentRank.rank
  }))
})

const emit = defineEmits(['update:modelValue'])

function pickShip(shipOpt) {
  if (!shipOpt.unlocked) return
  selectedShipId.value = shipOpt.id

  emit('update:modelValue', shipOpt.id);
}

</script>
<template>
    <div class="ships">
        <button
            v-for="s in reducedShipList"
            :key="s.id"
            type="button"
            class="ship"
            :class="{
            'ship--active': selectedShipId === s.id,
            'ship--locked': !s.unlocked
            }"
            :disabled="!s.unlocked"
            @click="pickShip(s)"
        >
            <header class="ship__head">
            <h3 class="ship__name">{{ s.name }}</h3>
            <span v-if="!s.unlocked" class="ship__lock label">RANK {{ s.rankRequired }}</span>
            </header>
            <p class="ship__tag">{{ s.tagline }}</p>
            <dl class="ship__stats mono">
            <div><dt>RANGE</dt><dd>{{ s.maxRangeDays }}d</dd></div>
            <div><dt>VEL</dt><dd>{{ s.velocity.toFixed(1) }}c</dd></div>
            <div v-if="s.bonus"><dt>BIAS</dt><dd>{{ s.bonus.slice(0, 8).toUpperCase() }}</dd></div>
            </dl>
        </button>
        <!-- Hidden remainder indicator -->
        <div v-if="visibleShips(captain.currentRank.rank).hiddenCount > 0" class="more">
            <span class="mono more__text">
                ◇ {{ visibleShips(captain.currentRank.rank).hiddenCount }} more ships {{ visibleShips(captain.currentRank.rank).hiddenCount === 1 ? 'destination' : 'destinations' }} await — earn rank to be able to pilot them
            </span>
        </div>
    </div>
</template>
<style scoped>
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

/* — More-await indicator — */
.more {
  text-align: center;
  padding: var(--s-4);
  margin-top: var(--s-2);
  border: 1px dashed var(--line);
  border-radius: var(--radius);
  background: linear-gradient(180deg, transparent 0%, rgba(93, 212, 240, 0.03) 100%);
}
.more__text {
  font-size: 10px;
  color: var(--signal-low);
  letter-spacing: 0.08em;
}
</style>