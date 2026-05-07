<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'
import EmptyState from '@/components/EmptyState.vue'
import HabitForm from '@/components/HabitForm.vue'
import SystemRow from '@/components/SystemRow.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

// Form state — null when closed, 'add' or a habit object when open
const formMode = ref(null)
const isFormOpen = computed(() => formMode.value !== null)
const editingHabit = computed(() =>
  formMode.value && typeof formMode.value === 'object' ? formMode.value : null
)

const grouped = computed(() => {
  const out = { engineering: [], navigation: [], research: [], 'life-support': [] }
  for (const h of habits.activeHabits) out[h.category].push(h)
  return out
})

// Per-category aggregate: average of past-averages of habits in that category
function categoryAverage(catKey) {
  if (!expedition.current) return null
  const habitsInCat = grouped.value[catKey]
  if (habitsInCat.length === 0) return null
  const averages = habitsInCat
    .map(h => habits.habitPastAverage(h, expedition.current.startedAt))
    .filter(a => a !== null)
  if (averages.length === 0) return null
  return averages.reduce((s, a) => s + a, 0) / averages.length
}

function categoryAveragePct(catKey) {
  const avg = categoryAverage(catKey)
  return avg === null ? null : Math.round(avg * 100)
}

function openAdd()             { formMode.value = 'add' }
function openEdit(habit)       { formMode.value = habit }
function closeForm()           { formMode.value = null }

function handleSubmit(formData) {
  if (editingHabit.value) {
    habits.updateHabit(editingHabit.value.id, formData)
  } else {
    habits.addHabit(formData)
  }
  closeForm()
}

function handleRemove(id) {
  habits.removeHabit(id)
}
</script>

<template>
  <div v-if="!expedition.isActive" class="empty-wrap">
    <EmptyState
      title="No voyage to configure"
      body="Systems are configured per-voyage. Launch a voyage first."
    >
      <button class="btn btn-primary" @click="router.push('/launch')" style="margin-top: var(--s-4)">
        Plot a course →
      </button>
    </EmptyState>
  </div>

  <div v-else class="systems-view">
    <!-- Header -->
    <header class="sv-head">
      <div>
        <p class="label sv-head__kicker">Configuration</p>
        <h1 class="display sv-head__title">Ship Systems</h1>
        <p class="sv-head__lede">
          Each system is a daily habit. Tap a system to reconfigure it. Hold the
          decommission button to remove. {{ habits.activeHabits.length }} of an
          ideal 4–8 systems active.
        </p>
      </div>
      <button class="btn btn-primary sv-head__add" @click="isFormOpen ? closeForm() : openAdd()">
        {{ isFormOpen ? 'Cancel' : '+ New system' }}
      </button>
    </header>

    <!-- Legend strip — explains the visual language -->
    <aside class="legend mono">
      <span class="legend__item">
        <span class="legend__swatch legend__swatch--past" /> COMPLETED DAY
      </span>
      <span class="legend__item">
        <span class="legend__swatch legend__swatch--today" /> TODAY
      </span>
      <span class="legend__item">
        <span class="legend__swatch legend__swatch--future" /> AHEAD
      </span>
      <span class="legend__item">
        <span class="legend__swatch legend__swatch--missing" /> BEFORE SYS
      </span>
    </aside>

    <!-- Form (when open) -->
    <HabitForm
      v-if="isFormOpen"
      :existing-habit="editingHabit"
      @submit="handleSubmit"
      @cancel="closeForm"
    />

    <!-- Per-category sections -->
    <section
      v-for="(list, key) in grouped"
      :key="key"
      class="cat"
      :style="{ '--cat-color': CATEGORIES[key].color }"
    >
      <header class="cat__head">
        <span class="cat__icon">{{ CATEGORIES[key].icon }}</span>
        <div class="cat__head-text">
          <h3 class="cat__name">{{ CATEGORIES[key].label }}</h3>
          <p class="cat__sub">{{ CATEGORIES[key].description }}</p>
        </div>
        <div class="cat__agg">
          <span class="cat__count mono">{{ list.length }} {{ list.length === 1 ? 'SYS' : 'SYS' }}</span>
          <span v-if="categoryAveragePct(key) !== null" class="cat__avg mono">
            {{ categoryAveragePct(key) }}% AVG
          </span>
        </div>
      </header>

      <div v-if="list.length === 0" class="cat__empty mono">
        ◇ NO SYSTEMS CONFIGURED IN THIS CATEGORY
      </div>

      <div v-else class="cat__list">
        <SystemRow
          v-for="(h, idx) in list"
          :key="h.id"
          :habit="h"
          :index="idx + 1"
          @edit="openEdit"
          @remove="handleRemove"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.empty-wrap { padding-top: var(--s-7); }

.systems-view {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
}

/* — Header — */
.sv-head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s-5);
  align-items: end;
  padding-bottom: var(--s-5);
  border-bottom: 1px solid var(--line);
}
.sv-head__kicker { color: var(--amber-deep); }
.sv-head__title {
  font-size: 44px;
  margin: 4px 0 var(--s-3);
  color: var(--signal);
  line-height: 1;
}
.sv-head__lede {
  color: var(--signal-dim);
  max-width: 640px;
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

/* — Legend — */
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s-4);
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cyan-deep);
  border-radius: var(--radius);
  font-size: 9px;
  letter-spacing: 0.12em;
  color: var(--signal-low);
}
.legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.legend__swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}
.legend__swatch--past    { background: var(--amber); opacity: 0.8; }
.legend__swatch--today   { background: var(--cyan); box-shadow: 0 0 4px var(--cyan); }
.legend__swatch--future  { background: var(--bulkhead); border: 1px solid var(--line); }
.legend__swatch--missing { background: var(--bulkhead); opacity: 0.4; }

/* — Categories — */
.cat {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}

.cat__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cat-color);
  border-radius: var(--radius);
}
.cat__icon {
  font-size: 20px;
  color: var(--cat-color);
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: var(--bulkhead);
  border-radius: var(--radius-sm);
}
.cat__head-text { min-width: 0; }
.cat__name {
  font-size: 14px;
  margin: 0;
  color: var(--signal);
  font-weight: 500;
  letter-spacing: 0.02em;
}
.cat__sub {
  font-size: 11px;
  color: var(--signal-low);
  margin: 2px 0 0;
  line-height: 1.4;
}

.cat__agg {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.cat__count {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--cat-color);
  padding: 3px 8px;
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: 999px;
}
.cat__avg {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
}

.cat__empty {
  padding: var(--s-4);
  text-align: center;
  color: var(--signal-low);
  font-size: 9px;
  letter-spacing: 0.14em;
  background: var(--hull);
  border: 1px dashed var(--line);
  border-radius: var(--radius);
}

.cat__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--s-3);
}

@media (max-width: 720px) {
  .sv-head { grid-template-columns: 1fr; }
  .sv-head__title { font-size: 32px; }
  .sv-head__add { justify-self: stretch; }
  .legend { gap: var(--s-3); }
  .cat__head { grid-template-columns: auto 1fr; gap: var(--s-2); }
  .cat__agg {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
    padding-top: var(--s-2);
    border-top: 1px dashed var(--line);
  }
  .cat__list { grid-template-columns: 1fr; }
}
</style>