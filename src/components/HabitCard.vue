<script setup>
import { computed } from 'vue'
import { CATEGORIES, useHabitsStore } from '@/stores/habits'

const props = defineProps({
  habit: { type: Object, required: true },
  date:  { type: String, default: () => new Date().toISOString().slice(0, 10) }
})

const habits = useHabitsStore()

const log = computed(() => habits.getLog(props.date, props.habit.id))
const isComplete = computed(() => log.value.completed)
const cat = computed(() => CATEGORIES[props.habit.category])

function toggle() {
  habits.toggleCompletion(props.habit.id, props.date)
}
</script>

<template>
  <button
    type="button"
    class="habit"
    :class="{ 'habit--done': isComplete }"
    :style="{ '--cat-color': cat.color }"
    @click="toggle"
  >
    <span class="habit__icon" aria-hidden="true">{{ habit.icon }}</span>

    <span class="habit__body">
      <span class="habit__name">{{ habit.name }}</span>
      <span class="habit__cat label">{{ cat.label }}</span>
    </span>

    <span class="habit__check" aria-hidden="true">
      <svg v-if="isComplete" viewBox="0 0 24 24" width="18" height="18" fill="none">
        <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
</template>

<style scoped>
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
}

.habit::before {
  /* subtle category color stripe on the left */
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 3px;
  background: var(--cat-color);
  opacity: 0.7;
  transition: width var(--t-fast) var(--ease), opacity var(--t-fast) var(--ease);
}

.habit:hover {
  background: var(--console-hi);
  border-color: var(--line-hi);
}
.habit:hover::before { width: 5px; opacity: 1; }

.habit__icon {
  font-size: 20px;
  width: 36px;
  height: 36px;
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
}

.habit__check {
  width: 28px;
  height: 28px;
  border: 1.5px solid var(--line-hi);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: transparent;
  transition: all var(--t-fast) var(--ease);
}

.habit--done {
  background: var(--bulkhead);
}
.habit--done::before { width: 5px; }
.habit--done .habit__check {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: var(--void);
}
.habit--done .habit__name {
  color: var(--signal-dim);
  text-decoration: line-through;
  text-decoration-color: var(--signal-low);
  text-decoration-thickness: 1px;
}
</style>
