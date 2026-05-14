<script setup>
/**
 * CarryForwardView — appears after launch when there's a previous voyage to draw from.
 *
 * Lists last voyage's habits with their completion percentages. User selects which
 * to bring forward; selected habits get cloned into the new voyage. Then routes to
 * the Bridge (or to the regular Systems screen for adding fresh habits).
 *
 * Skipped automatically (via router beforeEnter) if:
 *   - There's no active voyage (shouldn't get here without one)
 *   - There's no previous voyage in history
 *   - The previous voyage had no habits
 */

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'
import { iconById } from '@/data/icons'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

// ——— The voyage we're carrying from (most recent in history) ———
const prevVoyage = computed(() => expedition.history[0] || null)

const prevHabits = computed(() => {
  if (!prevVoyage.value) return []
  return habits.habits.filter(h => h.expeditionId === prevVoyage.value.id)
})

// ——— Selection state — all habits selected by default ———
const selected = ref(new Set(prevHabits.value.map(h => h.id)))

function toggle(id) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id); else next.add(id)
  selected.value = next
}
function selectAll()  { selected.value = new Set(prevHabits.value.map(h => h.id)) }
function selectNone() { selected.value = new Set() }

const selectedCount = computed(() => selected.value.size)

// ——— Per-habit stats from previous voyage ———
function pastCompletionPct(habit) {
  if (!prevVoyage.value) return null
  const avg = habits.habitPastAverage(habit, prevVoyage.value)
  if (avg === null) return null
  return Math.round(avg * 100)
}

// Visual hint: low-completion habits get a "consider dropping" cyan tint
function completionTone(pct) {
  if (pct === null) return 'new'
  if (pct >= 70)    return 'strong'
  if (pct >= 30)    return 'partial'
  return 'low'
}

// ——— Submit ———
function continueToVoyage() {
  if (!expedition.current) {
    router.push('/launch')
    return
  }
  const ids = [...selected.value]
  if (ids.length > 0) {
    habits.carryHabitsForward(ids, expedition.current.id)
  }
  router.push('/')
}

// Skip carry-forward entirely
function skipCarry() {
  router.push('/habits')  // go to systems screen to configure fresh
}

// ——— Group prev habits by category for readability ———
const grouped = computed(() => {
  const out = { engineering: [], navigation: [], research: [], 'life-support': [] }
  for (const h of prevHabits.value) out[h.category].push(h)
  return out
})

const orderedCategories = ['engineering', 'navigation', 'research', 'life-support']
</script>

<template>
  <div class="carry">
    <!-- Header -->
    <header class="carry__head">
      <p class="label carry__kicker">New voyage launched · pre-flight</p>
      <h1 class="display carry__title">Configure systems for the next voyage.</h1>
      <p class="carry__lede">
        Your last voyage to <strong>{{ prevVoyage?.destination }}</strong> ran
        <strong>{{ prevHabits.length }}</strong> systems. Select which to carry forward.
        Numbers shown are completion rates from that voyage — useful context, not
        judgment.
      </p>
    </header>

    <!-- Bulk select controls -->
    <div class="carry__bulk">
      <button class="btn-mono" @click="selectAll">Select all</button>
      <button class="btn-mono" @click="selectNone">Select none</button>
      <span class="carry__count mono">{{ selectedCount }} of {{ prevHabits.length }} selected</span>
    </div>

    <!-- Habits list, grouped by category -->
    <div class="carry__list">
      <section
        v-for="catKey in orderedCategories"
        :key="catKey"
        v-show="grouped[catKey]?.length"
        class="cat-block"
        :style="{ '--cat-color': CATEGORIES[catKey].color }"
      >
        <header class="cat-block__head">
          <span class="cat-block__icon">{{ CATEGORIES[catKey].icon }}</span>
          <span class="cat-block__name">{{ CATEGORIES[catKey].label }}</span>
          <span class="cat-block__count mono">{{ grouped[catKey].length }}</span>
        </header>

        <ul class="cat-block__habits">
          <li
            v-for="h in grouped[catKey]"
            :key="h.id"
            class="prev-habit"
            :class="[
              { 'prev-habit--off': !selected.has(h.id) },
              `prev-habit--${completionTone(pastCompletionPct(h))}`
            ]"
            @click="toggle(h.id)"
            role="button"
            tabindex="0"
            @keydown.enter="toggle(h.id)"
            @keydown.space.prevent="toggle(h.id)"
          >
            <span class="prev-habit__check" aria-hidden="true">
              <svg v-if="selected.has(h.id)" viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M5 12.5l4.5 4.5L19 7.5"
                      stroke="currentColor" stroke-width="2.5"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>

            <span class="prev-habit__icon" aria-hidden="true">
              <svg v-if="iconById(h.icon)" viewBox="0 0 24 24" width="20" height="20" fill="none">
                <path :d="iconById(h.icon).path" stroke="currentColor" stroke-width="1.6"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span v-else>{{ CATEGORIES[h.category].icon }}</span>
            </span>

            <div class="prev-habit__body">
              <span class="prev-habit__name">{{ h.name }}</span>
              <span v-if="h.description" class="prev-habit__desc">{{ h.description }}</span>
              <span v-if="(h.completionsNeeded ?? 1) > 1" class="prev-habit__meta mono">
                {{ h.completionsNeeded }}× DAILY
              </span>
            </div>

            <div class="prev-habit__stat">
              <template v-if="pastCompletionPct(h) !== null">
                <span class="prev-habit__pct mono">{{ pastCompletionPct(h) }}%</span>
                <span class="prev-habit__pct-label mono">LAST VOYAGE</span>
              </template>
              <template v-else>
                <span class="prev-habit__pct prev-habit__pct--new mono">NEW</span>
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>

    <!-- Footer actions -->
    <footer class="carry__foot">
      <button class="btn btn-ghost" @click="skipCarry">
        Skip · configure fresh →
      </button>
      <button class="btn btn-primary" @click="continueToVoyage">
        <template v-if="selectedCount === 0">Continue to bridge →</template>
        <template v-else>Carry {{ selectedCount }} forward · Take the bridge →</template>
      </button>
    </footer>
  </div>
</template>

<style scoped>
.carry {
  display: flex;
  flex-direction: column;
  gap: var(--s-5);
  max-width: 800px;
  margin: 0 auto;
}

/* — Header — */
.carry__head {
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--line);
}
.carry__kicker { color: var(--amber-deep); }
.carry__title {
  font-size: 36px;
  margin: 4px 0 var(--s-3);
  color: var(--signal);
  line-height: 1.1;
}
.carry__lede {
  margin: 0;
  color: var(--signal-dim);
  font-size: 14px;
  line-height: 1.65;
  max-width: 640px;
}
.carry__lede strong {
  color: var(--amber);
  font-weight: 500;
}

/* — Bulk controls — */
.carry__bulk {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.btn-mono {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--bulkhead);
  color: var(--signal-dim);
  transition: all var(--t-fast) var(--ease);
}
.btn-mono:hover {
  border-color: var(--amber-deep);
  color: var(--amber);
}
.carry__count {
  margin-left: auto;
  font-size: 10px;
  color: var(--signal-low);
  letter-spacing: 0.1em;
}

/* — Category blocks — */
.cat-block {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.cat-block__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-2) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cat-color);
  border-radius: var(--radius);
}
.cat-block__icon {
  font-size: 14px;
  color: var(--cat-color);
}
.cat-block__name {
  font-size: 12px;
  color: var(--signal);
  font-weight: 500;
  flex: 1;
}
.cat-block__count {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--cat-color);
  padding: 2px 8px;
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: 999px;
}

.cat-block__habits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

/* — Per-habit row — */
.prev-habit {
  display: grid;
  grid-template-columns: 22px 36px 1fr auto;
  gap: var(--s-3);
  align-items: center;
  padding: var(--s-3) var(--s-4);
  background: var(--console);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cat-color);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--t-fast) var(--ease);
  -webkit-tap-highlight-color: transparent;
}
.prev-habit:hover, .prev-habit:focus-visible {
  background: var(--console-hi);
  border-color: var(--line-hi);
  border-left-color: var(--cat-color);
  outline: none;
}
.prev-habit--off {
  opacity: 0.5;
  border-left-color: var(--line);
}

.prev-habit__check {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--line-hi);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--cat-color);
  transition: all var(--t-fast) var(--ease);
}
.prev-habit:not(.prev-habit--off) .prev-habit__check {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: var(--void);
}

.prev-habit__icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  background: var(--hull);
  border-radius: var(--radius-sm);
  color: var(--cat-color);
}

.prev-habit__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.prev-habit__name {
  font-size: 14px;
  color: var(--signal);
  font-weight: 500;
}
.prev-habit__desc {
  font-size: 11px;
  color: var(--signal-low);
  line-height: 1.4;
}
.prev-habit__meta {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.12em;
  margin-top: 2px;
}

.prev-habit__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  white-space: nowrap;
}
.prev-habit__pct {
  font-size: 16px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}
.prev-habit__pct-label {
  font-size: 8px;
  color: var(--signal-low);
  letter-spacing: 0.16em;
}
.prev-habit__pct--new {
  color: var(--signal-low);
  font-size: 10px;
  letter-spacing: 0.18em;
}

/* Tone-coded percentage based on last voyage's performance */
.prev-habit--strong  .prev-habit__pct { color: var(--verdant); }
.prev-habit--partial .prev-habit__pct { color: var(--cyan); }
.prev-habit--low     .prev-habit__pct { color: var(--amber-deep); }
.prev-habit--new     .prev-habit__pct { color: var(--signal-low); }

/* — Footer — */
.carry__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--s-3);
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
}

@media (max-width: 720px) {
  .carry__title { font-size: 28px; }
  .prev-habit { grid-template-columns: 22px 28px 1fr auto; gap: var(--s-2); }
  .prev-habit__icon { width: 28px; height: 28px; }
  .prev-habit__name { font-size: 13px; }
  .prev-habit__pct { font-size: 14px; }
  .carry__foot { flex-direction: column-reverse; }
  .carry__foot .btn { width: 100%; justify-content: center; }
  .carry__bulk { flex-wrap: wrap; }
  .carry__count { width: 100%; }
}
</style>