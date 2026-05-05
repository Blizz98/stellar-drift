<script setup>
import { computed, ref } from 'vue'
import { CATEGORIES, useHabitsStore } from '@/stores/habits'

const props = defineProps({
  habit: { type: Object, required: true },
  date:  { type: String, default: () => new Date().toISOString().slice(0, 10) }
})

const habits = useHabitsStore()

const log = computed(() => habits.getLog(props.date, props.habit.id))
const isComplete = computed(() => log.value.completed)
const cat = computed(() => CATEGORIES[props.habit.category])

// Coerce to integer with a safe fallback. Handles strings from form inputs,
// undefined from old habits created before this feature shipped, etc.
const needed = computed(() => {
  const n = parseInt(props.habit.completionsNeeded, 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
})
const count = computed(() => {
  const c = parseInt(log.value.count, 10)
  return Number.isFinite(c) && c >= 0 ? c : 0
})
const isMulti = computed(() => needed.value > 1)
const useDots = computed(() => needed.value <= 5)

// ——— Long-press to reset (multi-completion only) ———
let pressTimer = null
let didLongPress = false

function onPressStart() {
  didLongPress = false
  if (!isMulti.value) return
  pressTimer = setTimeout(() => {
    didLongPress = true
    pressTimer = null
    // Reset multi-completion habit to 0
    habits.toggleCompletion(props.habit.id, props.date)
  }, 500)
}

function clearPressTimer() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

// ——— Click handler (the actual tap) ———
function handleClick() {
  // If a long-press just fired, swallow the click that follows
  if (didLongPress) {
    didLongPress = false
    return
  }
  clearPressTimer()

  if (isMulti.value) {
    if (count.value >= needed.value) return  // already complete; long-press to reset
    habits.incrementCompletion(props.habit.id, props.date)
  } else {
    habits.toggleCompletion(props.habit.id, props.date)
  }
}
</script>

<template>
  <button
    type="button"
    class="habit"
    :class="{ 'habit--done': isComplete, 'habit--multi': isMulti }"
    :style="{ '--cat-color': cat.color }"
    @click="handleClick"
    @mousedown="onPressStart"
    @mouseup="clearPressTimer"
    @mouseleave="clearPressTimer"
    @touchstart.passive="onPressStart"
    @touchend="clearPressTimer"
    @touchcancel="clearPressTimer"
    :aria-label="isMulti
      ? `${habit.name}: ${count} of ${needed} complete. Tap to add one${count >= needed ? ', long-press to reset' : ''}.`
      : `${habit.name}: ${isComplete ? 'complete' : 'incomplete'}. Tap to toggle.`"
  >
    <span class="habit__icon" aria-hidden="true">{{ habit.icon }}</span>

    <span class="habit__body">
      <span class="habit__name">{{ habit.name }}</span>
      <span class="habit__cat label">
        {{ cat.label }}
        <template v-if="isMulti">
          <span class="habit__cat-sep">·</span>
          <span class="habit__cat-target mono">{{ count }} / {{ needed }}</span>
        </template>
      </span>
    </span>

    <span class="habit__indicator" aria-hidden="true">
      <span v-if="!isMulti" class="habit__check">
        <svg v-if="isComplete" viewBox="0 0 24 24" width="18" height="18" fill="none">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>

      <span v-else-if="useDots" class="habit__dots">
        <span
          v-for="i in needed"
          :key="i"
          class="habit__dot"
          :class="{ 'habit__dot--filled': i <= count }"
        />
      </span>

      <span v-else class="habit__fraction mono">
        <span class="habit__fraction-current">{{ count }}</span>
        <span class="habit__fraction-sep">/</span>
        <span class="habit__fraction-total">{{ needed }}</span>
      </span>
    </span>
  </button>
</template>

<style scoped>
/* ... keep your existing scoped styles unchanged ... */
.habit {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-4);
  padding: var(--s-4) var(--s-5);
  background: var(--console);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-align: left;
  width: 100%;
  transition: all var(--t-fast) var(--ease);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.habit::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--cat-color);
  opacity: 0.7;
  transition: width var(--t-fast) var(--ease), opacity var(--t-fast) var(--ease);
}
.habit:hover { background: var(--console-hi); border-color: var(--line-hi); }
.habit:hover::before { width: 5px; opacity: 1; }
.habit--multi:active { background: var(--console-hi); transform: scale(0.995); }

.habit__icon {
  font-size: 20px;
  width: 36px; height: 36px;
  display: grid;
  place-items: center;
  background: var(--hull);
  border-radius: var(--radius-sm);
  color: var(--cat-color);
}
.habit__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.habit__name {
  font-size: 15px;
  color: var(--signal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.habit__cat {
  color: var(--signal-low);
  font-size: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.habit__cat-sep { color: var(--signal-low); opacity: 0.5; }
.habit__cat-target {
  color: var(--cat-color);
  letter-spacing: 0.04em;
  transition: color var(--t-fast) var(--ease);
}

.habit__indicator { display: grid; place-items: center; min-width: 28px; }

.habit__check {
  width: 28px; height: 28px;
  border: 1.5px solid var(--line-hi);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: transparent;
  transition: all var(--t-fast) var(--ease);
}

.habit__dots {
  display: flex;
  gap: 5px;
  align-items: center;
  padding: 4px 8px;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: 999px;
}
.habit__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--line-hi);
  transition: all var(--t-med) var(--ease);
}
.habit__dot--filled {
  background: var(--cat-color);
  box-shadow: 0 0 6px var(--cat-color);
}

.habit__fraction {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 6px 10px;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.habit__fraction-current {
  color: var(--cat-color);
  font-size: 15px;
  transition: color var(--t-fast) var(--ease);
}
.habit__fraction-sep { color: var(--signal-low); }
.habit__fraction-total { color: var(--signal-dim); font-size: 12px; }

.habit--done { background: var(--bulkhead); }
.habit--done::before { width: 5px; }
.habit--done:not(.habit--multi) .habit__check {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: var(--void);
  box-shadow: 0px 0px 5px var(--cat-color);
}
.habit--done .habit__name {
  color: var(--signal-dim);
  text-decoration: line-through;
  text-decoration-color: var(--signal-low);
  text-decoration-thickness: 1px;
}
.habit--done.habit--multi .habit__dots,
.habit--done.habit--multi .habit__fraction {
  border-color: var(--cat-color);
  box-shadow: 0 0 12px -4px var(--cat-color);
}
</style>