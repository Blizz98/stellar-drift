<script setup>
/**
 * SystemRow — instrument-panel display for a single configured habit on the
 * Systems view. Shows the system identifier, status, icon, name, description,
 * and a per-day voyage strip with completion intensity.
 *
 * Tap opens the edit modal (parent handles via @edit emit). Decommission is
 * an explicit hold-to-confirm action to prevent accidental deletion.
 */

import { computed, ref } from 'vue'
import { CATEGORIES, useHabitsStore } from '@/stores/habits'
import { useExpeditionStore } from '@/stores/expedition'
import { iconById } from '@/data/icons'

const props = defineProps({
  habit: { type: Object, required: true },
  index: { type: Number, default: 1 }
})

const emit = defineEmits(['edit', 'remove'])

const habits = useHabitsStore()
const expedition = useExpeditionStore()

const cat = computed(() => CATEGORIES[props.habit.category])
const iconData = computed(() => iconById(props.habit.icon))

const catAbbr = computed(() => {
  const map = { 'engineering': 'ENG', 'navigation': 'NAV', 'research': 'RES', 'life-support': 'LFS' }
  return map[props.habit.category] || 'SYS'
})

const sysId = computed(() =>
  `${catAbbr.value}-${String(props.index).padStart(2, '0')}`
)

// Voyage strip data
const strip = computed(() => {
  if (!expedition.current) return []
  return habits.habitVoyageStrip(props.habit, expedition.current.startedAt)
})

const pastAverage = computed(() => {
  if (!expedition.current) return null
  return habits.habitPastAverage(props.habit, expedition.current.startedAt)
})

const pastAveragePct = computed(() => {
  if (pastAverage.value === null) return null
  return Math.round(pastAverage.value * 100)
})

// Status — derived from past average
const status = computed(() => {
  if (pastAverage.value === null) return { label: 'NEW', code: 'new' }
  if (pastAverage.value >= 0.8)   return { label: 'NOMINAL', code: 'nominal' }
  if (pastAverage.value >= 0.5)   return { label: 'PARTIAL', code: 'partial' }
  return { label: 'INTERMITTENT', code: 'intermittent' }
})

// Multi-completion indicator (shown in meta line)
const isMulti = computed(() => (props.habit.completionsNeeded ?? 1) > 1)

// ——— Hold-to-confirm decommission ———
const holdProgress = ref(0)
let holdTimer = null
let holdInterval = null
const HOLD_DURATION = 800  // ms

function startHold(event) {
  event.stopPropagation()
  holdProgress.value = 0
  const startTime = Date.now()
  holdInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    holdProgress.value = Math.min(1, elapsed / HOLD_DURATION)
  }, 16)
  holdTimer = setTimeout(() => {
    cancelHold()
    emit('remove', props.habit.id)
  }, HOLD_DURATION)
}

function cancelHold() {
  if (holdTimer)    { clearTimeout(holdTimer);    holdTimer = null }
  if (holdInterval) { clearInterval(holdInterval); holdInterval = null }
  holdProgress.value = 0
}
</script>

<template>
  <article
    class="sys-row"
    :class="[`sys-row--${status.code}`]"
    :style="{ '--cat-color': cat.color }"
    @click="emit('edit', habit)"
    role="button"
    tabindex="0"
    @keydown.enter="emit('edit', habit)"
  >
    <!-- Top header strip -->
    <header class="sys-row__head">
      <span class="sys-row__sysid mono">{{ sysId }}</span>
      <span class="sys-row__sep mono">/</span>
      <span class="sys-row__status mono">{{ status.label }}</span>
      <span class="sys-row__dot" :class="`sys-row__dot--${status.code}`" aria-hidden="true" />
    </header>

    <!-- Body -->
    <div class="sys-row__body">
      <span class="sys-row__icon" aria-hidden="true">
        <svg v-if="iconData" viewBox="0 0 24 24" width="22" height="22" fill="none">
          <path :d="iconData.path" stroke="currentColor" stroke-width="1.6"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span v-else class="sys-row__icon-fallback">{{ cat.icon }}</span>
      </span>

      <div class="sys-row__text">
        <h4 class="sys-row__name">{{ habit.name }}</h4>
        <p v-if="habit.description" class="sys-row__desc">{{ habit.description }}</p>
        <p class="sys-row__meta mono">
          <span v-if="isMulti">REQ {{ habit.completionsNeeded }}× DAILY</span>
          <span v-else>BINARY · 1× DAILY</span>
        </p>
      </div>

      <!-- Decommission button (hold to confirm) -->
      <button
        type="button"
        class="sys-row__decom"
        :class="{ 'sys-row__decom--holding': holdProgress > 0 }"
        :style="{ '--hold-progress': holdProgress }"
        @mousedown="startHold"
        @mouseup="cancelHold"
        @mouseleave="cancelHold"
        @touchstart.passive="startHold"
        @touchend="cancelHold"
        @touchcancel="cancelHold"
        @click.stop
        aria-label="Hold to decommission"
      >
        <span class="sys-row__decom-bar" aria-hidden="true" />
        <span class="sys-row__decom-label mono">
          {{ holdProgress > 0 ? 'HOLD…' : 'DECOMISSION' }}
        </span>
      </button>
    </div>

    <!-- Voyage strip -->
    <footer class="sys-row__foot">
      <div class="sys-row__strip" :class="`sys-row__strip--len-${strip.length > 30 ? 'long' : 'short'}`">
        <span
          v-for="d in strip"
          :key="d.day"
          class="sys-row__cell"
          :class="{
            'sys-row__cell--past':    d.isPast && d.habitExisted,
            'sys-row__cell--today':   d.isToday,
            'sys-row__cell--future':  d.isFuture,
            'sys-row__cell--missing': !d.habitExisted
          }"
          :style="d.isPast && d.habitExisted ? { '--cell-fill': d.completion } : {}"
          :title="`Day ${d.day}: ${d.completion === null ? '—' : Math.round(d.completion * 100) + '%'}`"
        />
      </div>

      <span v-if="pastAveragePct !== null" class="sys-row__avg mono">
        {{ pastAveragePct }}% AVG
      </span>
      <span v-else class="sys-row__avg sys-row__avg--new mono">
        NEW SYSTEM
      </span>
    </footer>
  </article>
</template>

<style scoped>
.sys-row {
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--console);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-align: left;
  width: 100%;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--t-fast) var(--ease);
  -webkit-tap-highlight-color: transparent;
}

.sys-row:hover, .sys-row:focus-visible {
  background: var(--console-hi);
  border-color: var(--line-hi);
  outline: none;
}

/* Left edge category color stripe */
.sys-row::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  background: var(--cat-color);
  opacity: 0.6;
  transition: width var(--t-fast) var(--ease);
}
.sys-row:hover::after { width: 4px; opacity: 1; }

/* Subtle scanline texture for nominal systems */
.sys-row--nominal::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg, transparent 0, transparent 3px,
    rgba(176, 232, 156, 0.025) 3px, rgba(176, 232, 156, 0.025) 4px
  );
  pointer-events: none;
}

/* — Header strip — */
.sys-row__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px var(--s-3) 8px var(--s-4);
  background: var(--hull);
  border-bottom: 1px dashed var(--line);
  font-size: 9px;
  letter-spacing: 0.14em;
}
.sys-row__sysid { color: var(--cat-color); }
.sys-row__sep   { color: var(--signal-low); opacity: 0.5; }
.sys-row__status { color: var(--signal-low); flex: 1; }

.sys-row--nominal      .sys-row__status { color: var(--verdant); }
.sys-row--partial      .sys-row__status { color: var(--cyan); }
.sys-row--intermittent .sys-row__status { color: var(--amber-deep); }
.sys-row--new          .sys-row__status { color: var(--signal-dim); }

.sys-row__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sys-row__dot--new          { background: var(--line-hi); }
.sys-row__dot--nominal      { background: var(--verdant); box-shadow: 0 0 6px var(--verdant); }
.sys-row__dot--partial      { background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }
.sys-row__dot--intermittent { background: var(--amber-deep); }

/* — Body — */
.sys-row__body {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  gap: var(--s-3);
  align-items: center;
  padding: var(--s-4);
}
.sys-row__icon {
  width: 44px; height: 44px;
  display: grid;
  place-items: center;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--cat-color);
}
.sys-row__icon-fallback { font-size: 20px; }

.sys-row__text { min-width: 0; }
.sys-row__name {
  font-size: 15px;
  margin: 0;
  color: var(--signal);
  font-weight: 500;
  line-height: 1.25;
}
.sys-row__desc {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--signal-low);
  line-height: 1.5;
}
.sys-row__meta {
  margin: 6px 0 0;
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.12em;
}

/* — Decom button (hold to confirm) — */
.sys-row__decom {
  position: relative;
  width: 82px;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  color: var(--signal-low);
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  overflow: hidden;
  cursor: pointer;
  transition: all var(--t-fast) var(--ease);
  -webkit-tap-highlight-color: transparent;
}
.sys-row__decom:hover {
  border-color: var(--thrust);
  color: var(--thrust);
}
.sys-row__decom--holding {
  border-color: var(--thrust);
  color: var(--thrust);
}
.sys-row__decom-bar {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--thrust);
  opacity: 0.18;
  width: calc(var(--hold-progress, 0) * 100%);
  transition: width 16ms linear;
}
.sys-row__decom-label { position: relative; z-index: 1; }

/* — Voyage strip footer — */
.sys-row__foot {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: var(--s-3);
  padding: 10px var(--s-4);
  background: var(--hull);
  border-top: 1px dashed var(--line);
}

.sys-row__strip {
  display: grid;
  gap: 2px;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  height: 14px;
}
.sys-row__strip--long {
  /* Slightly taller cells for very long voyages where width gets cramped */
  grid-auto-columns: minmax(3px, 1fr);
}

.sys-row__cell {
  background: var(--bulkhead);
  border-radius: 2px;
  position: relative;
  min-width: 3px;
}
.sys-row__cell--past {
  background: var(--cat-color);
  /* Cell intensity scales with that day's completion */
  opacity: calc(0.2 + (var(--cell-fill, 0) * 0.8));
}
.sys-row__cell--today {
  background: var(--cyan);
  box-shadow: 0 0 4px var(--cyan);
  animation: today-cell-pulse 2.4s ease-in-out infinite;
}
.sys-row__cell--future {
  background: var(--bulkhead);
  border: 1px solid var(--line);
  opacity: 0.5;
}
.sys-row__cell--missing {
  background: var(--bulkhead);
  opacity: 0.2;
}

@keyframes today-cell-pulse {
  0%, 100% { opacity: 0.7; }
  50%      { opacity: 1; }
}

.sys-row__avg {
  font-size: 11px;
  color: var(--cat-color);
  letter-spacing: 0.08em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.sys-row__avg--new {
  color: var(--signal-low);
}

@media (max-width: 720px) {
  .sys-row__body { grid-template-columns: 36px 1fr auto; gap: var(--s-2); padding: var(--s-3); }
  .sys-row__icon { width: 36px; height: 36px; }
  .sys-row__decom { padding: 8px 10px; }
  .sys-row__name { font-size: 14px; }
  .sys-row__desc { font-size: 11px; }
  .sys-row__strip { height: 10px; }
}
</style>