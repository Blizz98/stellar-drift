<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'
import EmptyState from '@/components/EmptyState.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

const draft = ref({ name: '', description: '', category: 'engineering', icon: '' })
const showForm = ref(false)

const grouped = computed(() => {
  const out = { engineering: [], navigation: [], research: [], 'life-support': [] }
  for (const h of habits.activeHabits) out[h.category].push(h)
  return out
})

function submit() {
  if (!draft.value.name.trim()) return
  habits.addHabit({ ...draft.value, icon: draft.value.icon || null })
  draft.value = { name: '', description: '', category: 'engineering', icon: '' }
  showForm.value = false
}

function remove(id) {
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
          Each system is a daily habit. Group them into the four ship categories so the
          voyage stays balanced. Light scope is better than ambitious scope —
          {{ habits.activeHabits.length }} of an ideal 4–8 systems configured.
        </p>
      </div>
      <button class="btn btn-primary" @click="showForm = !showForm">
        {{ showForm ? 'Cancel' : '+ New system' }}
      </button>
    </header>

    <section v-if="showForm" class="form-card">
      <header class="form-card__head">
        <h2 class="form-card__title">Configure new system</h2>
      </header>

      <div class="form-grid">
        <div class="field">
          <label class="label">System name</label>
          <input v-model="draft.name" class="input" placeholder="e.g. Strength training" />
        </div>

        <div class="field">
          <label class="label">Icon (emoji, optional)</label>
          <input v-model="draft.icon" class="input" placeholder="🏋️" maxlength="2" />
        </div>

        <div class="field field--full">
          <label class="label">Brief</label>
          <input v-model="draft.description" class="input" placeholder="What does this look like on a good day?" />
        </div>

        <div class="field field--full">
          <label class="label">Category</label>
          <div class="cats">
            <button
              v-for="(cat, key) in CATEGORIES"
              :key="key"
              type="button"
              class="cat"
              :class="{ 'cat--active': draft.category === key }"
              :style="{ '--cat-color': cat.color }"
              @click="draft.category = key"
            >
              <span class="cat__icon">{{ cat.icon }}</span>
              <span class="cat__body">
                <span class="cat__name">{{ cat.label }}</span>
                <span class="cat__sub label">{{ cat.sublabel }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <footer class="form-card__foot">
        <button class="btn btn-ghost" @click="showForm = false">Cancel</button>
        <button class="btn btn-primary" @click="submit">Add system →</button>
      </footer>
    </section>

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
        <article v-for="h in list" :key="h.id" class="row">
          <span class="row__icon">{{ h.icon }}</span>
          <div class="row__body">
            <h4 class="row__name">{{ h.name }}</h4>
            <p v-if="h.description" class="row__desc">{{ h.description }}</p>
          </div>
          <button class="row__remove mono" @click="remove(h.id)" aria-label="Decommission">
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

/* — New system form — */
.form-card {
  padding: var(--s-5);
  background: var(--bulkhead);
  border: 1px solid var(--amber-deep);
  border-radius: var(--radius-lg);
  box-shadow: var(--glow-amber);
}
.form-card__title { font-size: 16px; margin: 0; color: var(--signal); font-weight: 500; }
.form-card__head { margin-bottom: var(--s-4); }
.form-card__foot { display: flex; justify-content: flex-end; gap: var(--s-2); margin-top: var(--s-4); }

.form-grid {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: var(--s-3);
}
.field--full { grid-column: 1 / -1; }
.field .label { display: block; margin-bottom: 6px; }

.cats { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--s-2); }
.cat {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-3);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-align: left;
  transition: all var(--t-fast) var(--ease);
}
.cat:hover { background: var(--console); border-color: var(--line-hi); }
.cat--active {
  border-color: var(--cat-color);
  background: var(--console);
}
.cat__icon { font-size: 18px; color: var(--cat-color); width: 24px; text-align: center; }
.cat__body { display: flex; flex-direction: column; gap: 2px; }
.cat__name { font-size: 13px; color: var(--signal); }
.cat__sub  { font-size: 9px; }

/* — Category section — */
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
  width: 32px;
  height: 32px;
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
}
.row__icon { font-size: 18px; }
.row__name { font-size: 14px; margin: 0; color: var(--signal); }
.row__desc { font-size: 12px; color: var(--signal-low); margin: 2px 0 0; }
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
  .form-grid { grid-template-columns: 1fr; }
  .cats { grid-template-columns: 1fr; }
}
</style>
