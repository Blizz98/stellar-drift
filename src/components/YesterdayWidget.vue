<script setup>
/**
 * Yesterday widget — shown at the top of the Bridge as a welcome-back acknowledgment.
 *
 * Self-hides when there's nothing meaningful to show (no voyage active yesterday,
 * no habits eligible, etc.). The copy is deliberately non-judgmental — even the
 * 0% case avoids streak/failure language. The widget says "we see you, the voyage
 * continues," not "you missed your habits."
 */

import { computed } from 'vue'
import { useHabitsStore } from '@/stores/habits'

const habits = useHabitsStore()

const summary = computed(() => habits.yesterdaySummary())

// Format yesterday's date as a short, friendly label (e.g. "Mon, May 4")
const dateLabel = computed(() => {
  if (!summary.value) return ''
  const d = new Date(summary.value.date + 'T00:00:00')
  return d.toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric'
  })
})

// Map completion rate to a tone: 'quiet' (0%), 'partial' (>0 and <100), 'nominal' (100%)
const tone = computed(() => {
  if (!summary.value) return null
  if (summary.value.rate <= 0)   return 'quiet'
  if (summary.value.rate >= 1)   return 'nominal'
  return 'partial'
})

// Copy is deliberately non-judgmental for the quiet case.
const message = computed(() => {
  if (!summary.value) return ''
  const { completed, total } = summary.value
  switch (tone.value) {
    case 'quiet':
      return 'Yesterday went quiet. The voyage continues.'
    case 'nominal':
      return `Yesterday: all ${total} ${total === 1 ? 'system' : 'systems'} nominal.`
    case 'partial':
      return `Yesterday: ${completed} of ${total} ${total === 1 ? 'system' : 'systems'} nominal.`
  }
})

// Pip indicators visualize the day at a glance — one pip per habit
const pips = computed(() => {
  if (!summary.value) return []
  const { completed, total } = summary.value
  return Array.from({ length: total }, (_, i) => i < completed)
})
</script>

<template>
  <Transition name="fade">
    <article v-if="summary" class="yesterday" :class="`yesterday--${tone}`">
      <header class="yesterday__head">
        <span class="yesterday__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
        <span class="yesterday__kicker label">Yesterday · {{ dateLabel }}</span>
      </header>

      <p class="yesterday__msg">{{ message }}</p>

      <div class="yesterday__pips" aria-hidden="true">
        <span
          v-for="(filled, i) in pips"
          :key="i"
          class="yesterday__pip"
          :class="{ 'yesterday__pip--filled': filled }"
        />
      </div>
    </article>
  </Transition>
</template>

<style scoped>
.yesterday {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: var(--s-2) var(--s-4);
  align-items: center;
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--tone-color, var(--signal-low));
  border-radius: var(--radius);
}

.yesterday--quiet   { --tone-color: var(--signal-low); }
.yesterday--partial { --tone-color: var(--cyan-deep); }
.yesterday--nominal { --tone-color: var(--verdant); }

.yesterday__head {
  display: inline-flex;
  align-items: center;
  gap: var(--s-2);
  grid-column: 1;
  grid-row: 1;
}
.yesterday__icon {
  color: var(--tone-color);
  display: flex;
}
.yesterday__kicker {
  color: var(--tone-color);
  font-size: 9px;
}

.yesterday__msg {
  margin: 0;
  font-size: 13px;
  color: var(--signal);
  line-height: 1.45;
  grid-column: 1;
  grid-row: 2;
}

.yesterday__pips {
  display: flex;
  gap: 4px;
  grid-column: 2;
  grid-row: 1 / span 2;
  align-self: center;
}
.yesterday__pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--line-hi);
}
.yesterday__pip--filled {
  background: var(--tone-color);
  box-shadow: 0 0 4px var(--tone-color);
}

/* Fade in/out transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--t-med) var(--ease), transform var(--t-med) var(--ease);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@media (max-width: 720px) {
  .yesterday {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  .yesterday__pips {
    grid-column: 1;
    grid-row: 3;
    margin-top: var(--s-1);
  }
}
</style>