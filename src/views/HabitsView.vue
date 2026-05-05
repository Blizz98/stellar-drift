<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'
import EmptyState from '@/components/EmptyState.vue'
import HabitForm from '@/components/HabitForm.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

// Form state — null when closed, 'add' or a habit object when open
const formMode = ref(null)  // null | 'add' | habitObject

const isFormOpen = computed(() => formMode.value !== null)
const editingHabit = computed(() =>
  formMode.value && typeof formMode.value === 'object' ? formMode.value : null
)

const grouped = computed(() => {
  const out = { engineering: [], navigation: [], research: [], 'life-support': [] }
  for (const h of habits.activeHabits) out[h.category].push(h)
  return out
})

function openAdd() {
  formMode.value = 'add'
}

function openEdit(habit) {
  formMode.value = habit
}

function closeForm() {
  formMode.value = null
}

function handleSubmit(formData) {
  if (editingHabit.value) {
    habits.updateHabit(editingHabit.value.id, formData)
  } else {
    habits.addHabit(formData)
  }
  closeForm()
}

function remove(id, event) {
  // Stop propagation so the row's edit-tap doesn't fire
  event.stopPropagation()
  if (!confirm('Decommission this system? Past logs are kept.')) return
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

  <div v-else class="habits">
    <header class="habits__head">
      <div>
        <p class="label">Configuration</p>
        <h1 class="display habits__title">Ship Systems</h1>
        <p class="habits__lede">
          Each system is a daily habit. Tap a configured system to edit it.
          {{ habits.activeHabits.length }} of an ideal 4–8 systems configured.
        </p>
      </div>
      <button class="btn btn-primary" @click="isFormOpen ? closeForm() : openAdd()">
        {{ isFormOpen ? 'Cancel' : '+ New system' }}
      </button>
    </header>

    <HabitForm
      v-if="isFormOpen"
      :existing-habit="editingHabit"
      @submit="handleSubmit"
      @cancel="closeForm"
    />

    <section
      v-for="(list, key) in grouped"
      :key="key"
      class="cat-section"
    >
      <header class="cat-section__head" :style="{ '--cat-color': CATEGORIES[key].color }">
        <span class="cat-section__icon">{{ CATEGORIES[key].icon }}</span>
        <div>
          <h3 class="cat-section__name">{{ CATEGORIES[key].label }}</h3>
          <p class="cat-section__desc">{{ CATEGORIES[key].description }}</p>
        </div>
        <span class="cat-section__count mono">{{ list.length }}</span>
      </header>

      <div v-if="list.length === 0" class="cat-section__empty mono">
        No systems configured in this category.
      </div>

      <div v-else class="cat-section__list">
        <article
          v-for="h in list"
          :key="h.id"
          class="row"
          @click="openEdit(h)"
          role="button"
          tabindex="0"
          @keydown.enter="openEdit(h)"
          @keydown.space.prevent="openEdit(h)"
        >
          <span class="row__icon">{{ h.icon }}</span>
          <div class="row__body">
            <h4 class="row__name">{{ h.name }}</h4>
            <p class="row__meta">
              <span v-if="h.description" class="row__desc">{{ h.description }}</span>
              <span v-if="h.completionsNeeded > 1" class="row__target mono">
                {{ h.completionsNeeded }}× daily
              </span>
            </p>
          </div>
          <button class="row__remove mono" @click="remove(h.id, $event)" aria-label="Decommission">
            Decommission
          </button>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.empty-wrap { padding-top: var(--s-7); }
.habits { display: flex; flex-direction: column; gap: var(--s-6); }

.habits__head {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s-5);
  align-items: end;
  padding-bottom: var(--s-5);
  border-bottom: 1px solid var(--line);
}
.habits__title { font-size: 44px; margin: 4px 0 var(--s-3); color: var(--signal); }
.habits__lede { color: var(--signal-dim); max-width: 640px; line-height: 1.6; margin: 0; }

.cat-section { padding: var(--s-5) 0; }
.cat-section__head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-3);
  padding-bottom: var(--s-3);
  border-bottom: 1px solid var(--line);
  margin-bottom: var(--s-3);
}
.cat-section__icon {
  font-size: 22px;
  color: var(--cat-color);
  width: 32px; height: 32px;
  display: grid;
  place-items: center;
  background: var(--hull);
  border-radius: var(--radius-sm);
}
.cat-section__name {
  font-size: 16px;
  color: var(--signal);
  margin: 0;
  font-weight: 500;
}
.cat-section__desc { font-size: 12px; color: var(--signal-low); margin: 2px 0 0; }
.cat-section__count {
  font-size: 13px;
  color: var(--cat-color);
  padding: 2px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.cat-section__empty {
  padding: var(--s-4);
  text-align: center;
  color: var(--signal-low);
  font-size: 11px;
  background: var(--hull);
  border: 1px dashed var(--line);
  border-radius: var(--radius);
}

.cat-section__list { display: flex; flex-direction: column; gap: var(--s-2); }

.row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--s-3);
  align-items: center;
  padding: var(--s-3) var(--s-4);
  background: var(--console);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all var(--t-fast) var(--ease);
  -webkit-tap-highlight-color: transparent;
}
.row:hover, .row:focus-visible {
  background: var(--console-hi);
  border-color: var(--line-hi);
  outline: none;
}
.row:focus-visible {
  border-color: var(--amber-deep);
}

.row__icon { font-size: 18px; }
.row__name { font-size: 14px; margin: 0; color: var(--signal); }
.row__meta {
  display: flex;
  gap: var(--s-3);
  align-items: baseline;
  margin: 2px 0 0;
}
.row__desc { font-size: 12px; color: var(--signal-low); }
.row__target {
  font-size: 10px;
  color: var(--cat-color, var(--cyan));
  letter-spacing: 0.04em;
}
.row__remove {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
  text-transform: uppercase;
  padding: 6px 10px;
  border-radius: 4px;
  transition: all var(--t-fast) var(--ease);
}
.row__remove:hover { color: var(--thrust); background: var(--hull); }

@media (max-width: 720px) {
  .habits__head { grid-template-columns: 1fr; }
  .habits__title { font-size: 32px; }
}
</style>