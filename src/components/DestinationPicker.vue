<script setup>
import { computed, ref } from 'vue'
import { useCaptainStore } from '@/stores/captain'
import { visibleDestinations } from '@/data/destinations'
import { SHIPS, shipById } from '@/data/ships'

const props = defineProps({
  modelValue: { type: String, default: null },  // selected destination id
  shipId:     { type: String, default: null }   // currently selected ship for duration calc
})
const emit = defineEmits(['update:modelValue'])

const captain = useCaptainStore()

const list = computed(() => visibleDestinations(captain.currentRank.rank))

const expandedId = ref(null)
function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

/**
 * Compute the duration (in days) it would take in the currently selected ship,
 * or in the smallest-rank ship that can reach it (for unreachable destinations).
 */
function durationInShip(dest) {
  const ship = shipById(props.shipId) || shipById('explorer')
  if (!ship) return null
  return Math.ceil(dest.distanceDays / ship.velocity)
}

function reachableInCurrentShip(dest) {
  const ship = shipById(props.shipId) || shipById('explorer')
  if (!ship) return false
  const duration = durationInShip(dest)
  return duration <= ship.maxRangeDays
}

function smallestShipFor(dest) {
  return SHIPS.find(s => Math.ceil(dest.distanceDays / s.velocity) <= s.maxRangeDays)
}

function pick(dest) {
  if (!reachableInCurrentShip(dest)) return
  emit('update:modelValue', dest.id)
}
</script>

<template>
  <div class="picker">
    <!-- Reachable destinations (within rank AND ship range) -->
    <article
      v-for="dest in list.reachable"
      :key="dest.id"
      class="dest"
      :class="{
        'dest--selected': modelValue === dest.id,
        'dest--out-of-range': !reachableInCurrentShip(dest)
      }"
    >
      <header class="dest__head" @click="toggle(dest.id)">
        <div class="dest__title">
          <span class="dest__select-mark" :aria-hidden="true">
            <span v-if="modelValue === dest.id" class="dest__select-dot" />
          </span>
          <div>
            <h3 class="dest__name">{{ dest.name }}</h3>
            <p class="dest__sub">{{ dest.subtitle }}</p>
          </div>
        </div>

        <div class="dest__meta mono">
          <span class="dest__distance">{{ dest.distanceDays }} ld</span>
          <span class="dest__sep">·</span>
          <template v-if="reachableInCurrentShip(dest)">
            <span class="dest__duration">{{ durationInShip(dest) }}d voyage</span>
          </template>
          <template v-else>
            <span class="dest__warn">
              ◇ requires {{ smallestShipFor(dest)?.name || 'larger hull' }}
            </span>
          </template>
        </div>
      </header>

      <Transition name="reveal">
        <div v-if="expandedId === dest.id" class="dest__body">
          <p class="dest__poetic">{{ dest.poetic }}</p>
          <p class="dest__desc">{{ dest.description }}</p>
          <div class="dest__actions">
            <button
              v-if="reachableInCurrentShip(dest)"
              class="btn btn-primary"
              @click.stop="pick(dest)"
            >
              {{ modelValue === dest.id ? '✓ Selected' : 'Set course →' }}
            </button>
            <p v-else class="dest__hint mono">
              Your current hull cannot make this voyage. Try the {{ smallestShipFor(dest)?.name }}.
            </p>
          </div>
        </div>
      </Transition>
    </article>

    <!-- Locked but visible (foreshadowed) destinations -->
    <article
      v-for="dest in list.locked"
      :key="dest.id"
      class="dest dest--locked"
    >
      <header class="dest__head dest__head--locked">
        <div class="dest__title">
          <span class="dest__lock-mark" aria-hidden="true">◇</span>
          <div>
            <h3 class="dest__name dest__name--locked">{{ dest.name }}</h3>
            <p class="dest__sub">{{ dest.subtitle }}</p>
          </div>
        </div>
        <div class="dest__meta mono">
          <span class="dest__distance">{{ dest.distanceDays }} ld</span>
          <span class="dest__sep">·</span>
          <span class="dest__locked-rank">RANK {{ dest.minRank }} REQUIRED</span>
        </div>
      </header>
    </article>

    <!-- Hidden remainder indicator -->
    <div v-if="list.hiddenCount > 0" class="more">
      <span class="mono more__text">
        ◇ {{ list.hiddenCount }} further {{ list.hiddenCount === 1 ? 'destination' : 'destinations' }} await — earn rank to chart them
      </span>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.dest {
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all var(--t-fast) var(--ease);
}
.dest:hover { border-color: var(--line-hi); }

.dest__head {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-3) var(--s-4);
  cursor: pointer;
}

.dest__title {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  min-width: 0;
}

.dest__select-mark {
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--line-hi);
  border-radius: 50%;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  transition: border-color var(--t-fast) var(--ease);
}
.dest__select-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 8px var(--amber);
}
.dest--selected .dest__select-mark { border-color: var(--amber); }
.dest--selected { border-color: var(--amber-deep); background: var(--bulkhead); }

.dest__name {
  font-size: 15px;
  margin: 0;
  color: var(--signal);
}
.dest__sub {
  font-size: 11px;
  color: var(--signal-low);
  margin: 2px 0 0;
}

.dest__meta {
  font-size: 10px;
  color: var(--signal-dim);
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: 0.04em;
  white-space: nowrap;
}
.dest__distance { color: var(--signal); }
.dest__duration { color: var(--cyan); }
.dest__sep      { color: var(--signal-low); }
.dest__warn     { color: var(--amber-deep); }

.dest--out-of-range { opacity: 0.65; }
.dest--out-of-range .dest__head { cursor: pointer; }

/* — Expanded body — */
.dest__body {
  padding: var(--s-4) var(--s-4) var(--s-5);
  border-top: 1px dashed var(--line);
  background: var(--bulkhead);
}
.dest__poetic {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 16px;
  color: var(--cyan);
  margin: 0 0 var(--s-3);
  letter-spacing: 0.01em;
}
.dest__desc {
  font-size: 13px;
  color: var(--signal-dim);
  line-height: 1.65;
  margin: 0 0 var(--s-4);
  max-width: 560px;
}
.dest__actions {
  display: flex;
  align-items: center;
  gap: var(--s-3);
}
.dest__hint {
  font-size: 10px;
  color: var(--amber-deep);
  letter-spacing: 0.08em;
}

.reveal-enter-active, .reveal-leave-active {
  transition: opacity var(--t-fast) var(--ease), transform var(--t-fast) var(--ease);
}
.reveal-enter-from, .reveal-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* — Locked destinations — */
.dest--locked {
  background: linear-gradient(180deg, var(--hull) 0%, rgba(232, 168, 70, 0.03) 100%);
  border-color: var(--line);
  border-style: dashed;
}
.dest__head--locked { cursor: default; opacity: 0.7; }
.dest__lock-mark {
  width: 16px; height: 16px;
  display: grid;
  place-items: center;
  color: var(--amber-deep);
  font-size: 10px;
}
.dest__name--locked { color: var(--signal-dim); }
.dest__locked-rank {
  color: var(--amber-deep);
  letter-spacing: 0.14em;
}

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

@media (max-width: 720px) {
  .dest__head { grid-template-columns: 1fr; }
  .dest__meta { justify-content: flex-start; padding-left: 28px; }
}
</style>
