<script setup>
import { computed } from 'vue'
import { CATEGORIES, useHabitsStore } from '@/stores/habits'
import { iconById } from '@/data/icons'

const props = defineProps({
  habit:  { type: Object, required: true },
  date:   { type: String, default: () => new Date().toISOString().slice(0, 10) },
  /**
   * The card's identifier number, e.g. 4 for "SYS-04". Set by the parent
   * (BridgeView) based on the habit's order within its category group.
   * Pure presentation — not stored on the habit data.
   */
  index:  { type: Number, default: 1 }
})

const habits = useHabitsStore()

const log = computed(() => habits.getLog(props.date, props.habit.id))
const isComplete = computed(() => log.value.completed)
const cat = computed(() => CATEGORIES[props.habit.category])
const isCarried = computed(() => Boolean(props.habit.carriedFrom))

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

// Custom icon (from icon library) or fallback to category default
const iconData = computed(() => iconById(props.habit.icon))

// Status badge — three states reading like instrument readouts
const status = computed(() => {
  if (isComplete.value)              return { label: 'NOMINAL', code: 'nominal' }
  if (isMulti.value && count.value > 0) return { label: 'ACTIVE',  code: 'active' }
  return { label: 'STANDBY', code: 'standby' }
})

// Category abbreviation for the SYS-04 / NAV-02 etc identifier
const catAbbr = computed(() => {
  const map = {
    'engineering':  'ENG',
    'navigation':   'NAV',
    'research':     'RES',
    'life-support': 'LFS'
  }
  return map[props.habit.category] || 'SYS'
})

const sysId = computed(() =>
  `${catAbbr.value}-${String(props.index).padStart(2, '0')}`
)

// ——— Long-press to reset (multi-completion only) ———
let pressTimer = null
let didLongPress = false

function onPressStart() {
  didLongPress = false
  if (!isMulti.value) return
  pressTimer = setTimeout(() => {
    didLongPress = true
    pressTimer = null
    habits.toggleCompletion(props.habit.id, props.date)
  }, 500)
}

function clearPressTimer() {
  if (pressTimer) {
    clearTimeout(pressTimer)
    pressTimer = null
  }
}

function handleClick() {
  if (didLongPress) {
    didLongPress = false
    return
  }
  clearPressTimer()
  if (isMulti.value) {
    if (count.value >= needed.value) return
    habits.incrementCompletion(props.habit.id, props.date)
  } else {
    habits.toggleCompletion(props.habit.id, props.date)
  }
}
</script>

<template>
  <button
    type="button"
    class="console"
    :class="[`console--${status.code}`, { 'console--multi': isMulti }]"
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
    <!-- Top header strip: SYS-ID and STATUS -->
    <header class="console__head">
      <span class="console__sysid mono">{{ sysId }}</span>
      <span class="console__sep mono">/</span>
      <span v-if="isCarried" class="console__carried mono" title="Continued from last voyage">↻ CONT</span>
      <span class="console__status mono">{{ status.label }}</span>
      <span class="console__dot" :class="`console__dot--${status.code}`" aria-hidden="true" />
    </header>

    <!-- Main body: icon + name -->
    <div class="console__body">
      <span class="console__icon" aria-hidden="true">
        <svg v-if="iconData" viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path :d="iconData.path" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-else class="console__icon-fallback">{{ cat.icon }}</span>
      </span>

      <div class="console__text">
        <h4 class="console__name">{{ habit.name }}</h4>
        <p v-if="habit.description" class="console__desc">{{ habit.description }}</p>
      </div>
    </div>

    <!-- Bottom telemetry strip: indicator + meta -->
    <footer class="console__foot">
      <span class="console__meta mono">
        <template v-if="isMulti">REQ {{ needed }}× · LOG {{ count }}</template>
        <template v-else>{{ isComplete ? 'CONFIRMED' : 'AWAITING INPUT' }}</template>
      </span>

      <span class="console__indicator" aria-hidden="true">
        <!-- Binary: classic checkmark circle -->
        <span v-if="!isMulti" class="console__check">
          <svg v-if="isComplete" viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>

        <!-- Multi (≤5): progress dots -->
        <span v-else-if="useDots" class="console__dots">
          <span
            v-for="i in needed"
            :key="i"
            class="console__pip"
            :class="{ 'console__pip--filled': i <= count }"
          />
        </span>

        <!-- Multi (>5): compact fraction -->
        <span v-else class="console__fraction mono">
          <span class="console__fraction-current">{{ count }}</span>
          <span class="console__fraction-sep">/</span>
          <span class="console__fraction-total">{{ needed }}</span>
        </span>
      </span>
    </footer>
  </button>
</template>

<style scoped>
/* ——— Container ——— */
.console {
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--console);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all var(--t-fast) var(--ease);
}

/* Faint scanline texture for completed cards */
.console--nominal::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 3px,
    rgba(176, 232, 156, 0.025) 3px,
    rgba(176, 232, 156, 0.025) 4px
  );
  pointer-events: none;
}

/* Left edge accent: category color stripe */
.console::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--cat-color);
  opacity: 0.6;
  transition: width var(--t-fast) var(--ease), opacity var(--t-fast) var(--ease);
}
.console:hover::after { width: 4px; opacity: 1; }

.console:hover {
  background: var(--console-hi);
  border-color: var(--line-hi);
}

.console--multi:active { transform: scale(0.997); }

/* ——— Top header strip: SYS-ID / STATUS ——— */
.console__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px var(--s-3) 8px var(--s-4);
  background: var(--hull);
  border-bottom: 1px dashed var(--line);
  font-size: 9px;
  letter-spacing: 0.14em;
}
.console__sysid {
  color: var(--cat-color);
}
.console__sep {
  color: var(--signal-low);
  opacity: 0.5;
}
.console__status {
  color: var(--signal-low);
  flex: 1;
}
.console--nominal .console__status { color: var(--verdant); }
.console--active .console__status  { color: var(--cyan); }

.console__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.console__dot--standby { background: var(--line-hi); }
.console__dot--active  {
  background: var(--cyan);
  box-shadow: 0 0 6px var(--cyan);
  animation: pulse 1.6s ease-in-out infinite;
}
.console__dot--nominal {
  background: var(--verdant);
  box-shadow: 0 0 6px var(--verdant);
}

/* ——— Main body: icon + name ——— */
.console__body {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: var(--s-3);
  align-items: center;
  padding: var(--s-4);
}
.console__icon {
  width: 44px; height: 44px;
  display: grid;
  place-items: center;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--cat-color);
  transition: all var(--t-fast) var(--ease);
}
.console--nominal .console__icon {
  border-color: var(--cat-color);
  box-shadow: 0 0 12px -4px var(--cat-color);
}
.console__icon-fallback {
  font-size: 20px;
}

.console__text { min-width: 0; }
.console__name {
  font-size: 15px;
  margin: 0;
  color: var(--signal);
  font-weight: 500;
  line-height: 1.25;
}
.console--nominal .console__name {
  color: var(--signal-dim);
}
.console__desc {
  margin: 4px 0 0;
  font-size: 11px;
  color: var(--signal-low);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ——— Bottom strip: meta + indicator ——— */
.console__foot {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--s-3);
  padding: 8px var(--s-4);
  background: var(--hull);
  border-top: 1px dashed var(--line);
  min-height: 36px;
}
.console__meta {
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--signal-low);
}
.console--nominal .console__meta { color: var(--verdant); }

.console__indicator {
  display: grid;
  place-items: center;
  min-width: 28px;
}

/* — Binary checkmark — */
.console__check {
  width: 22px; height: 22px;
  border: 1.5px solid var(--line-hi);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: transparent;
  transition: all var(--t-fast) var(--ease);
}
.console--nominal .console__check {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: var(--void);
}

/* — Multi dots — */
.console__dots {
  display: flex;
  gap: 4px;
  align-items: center;
}
.console__pip {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--line-hi);
  transition: all var(--t-med) var(--ease);
}
.console__pip--filled {
  background: var(--cat-color);
  box-shadow: 0 0 5px var(--cat-color);
}
.console__carried {
  color: var(--cyan-deep);
  letter-spacing: 0.14em;
  margin-right: 4px;
}

/* — Multi fraction — */
.console__fraction {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 4px 8px;
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}
.console__fraction-current {
  color: var(--cat-color);
  font-size: 14px;
}
.console__fraction-sep   { color: var(--signal-low); font-size: 11px; }
.console__fraction-total { color: var(--signal-dim);  font-size: 11px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
</style>