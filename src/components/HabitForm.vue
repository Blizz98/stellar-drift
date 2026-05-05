<script setup>
/**
 * Reusable habit form. Used in two modes:
 *   - Add mode (no `existingHabit` prop): emits 'submit' with the form data;
 *     parent calls habits.addHabit().
 *   - Edit mode (`existingHabit` prop set): pre-fills fields; emits 'submit'
 *     with the form data; parent calls habits.updateHabit(id, data).
 *
 * The form is presentational only — it doesn't touch the store directly.
 * That keeps it easy to test and easy to reuse in other contexts (e.g.
 * carry-forward suggestions later).
 */

import { ref, computed, watch, nextTick } from 'vue'
import { CATEGORIES } from '@/stores/habits'

const props = defineProps({
  existingHabit: { type: Object, default: null }
})

const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.existingHabit)

// ——— Form state ———
const draft = ref(makeDraft(props.existingHabit))
const customCompletionsMode = ref(false)
const customInputRef = ref(null)

function makeDraft(habit) {
  if (habit) {
    const completions = habit.completionsNeeded || 1
    return {
      name: habit.name || '',
      description: habit.description || '',
      category: habit.category || 'engineering',
      icon: habit.icon || '',
      completions
    }
  }
  return {
    name: '',
    description: '',
    category: 'engineering',
    icon: '',
    completions: 1
  }
}

// If the parent swaps in a new habit to edit, reset the draft
watch(() => props.existingHabit, (h) => {
  draft.value = makeDraft(h)
  // If the existing habit's count isn't a preset, kick into custom mode
  customCompletionsMode.value = ![1, 2, 3, 4].includes(draft.value.completions)
}, { immediate: true })

// ——— Completions selector ———
function selectPreset(n) {
  draft.value.completions = n
  customCompletionsMode.value = false
}

async function enableCustom() {
  customCompletionsMode.value = true
  if ([1, 2, 3, 4].includes(draft.value.completions)) {
    draft.value.completions = null
  }
  await nextTick()
  customInputRef.value?.focus()
}

// ——— Submission ———
const canSubmit = computed(() => {
  const c = parseInt(draft.value.completions, 10)
  return draft.value.name.trim().length > 0 && Number.isFinite(c) && c >= 1
})

function submit() {
  if (!canSubmit.value) return
  emit('submit', {
    name: draft.value.name.trim(),
    description: draft.value.description.trim(),
    category: draft.value.category,
    icon: draft.value.icon || null,
    completionsNeeded: parseInt(draft.value.completions, 10)
  })
}

function cancel() {
  emit('cancel')
}
</script>

<template>
  <section class="form-card">
    <header class="form-card__head">
      <h2 class="form-card__title">{{ isEdit ? 'Edit system' : 'Configure new system' }}</h2>
      <button type="button" class="btn btn-ghost" @click="cancel">Cancel</button>
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

      <div class="field field--full">
        <label class="label">Daily completions</label>
        <p class="field__hint">How many times per day this system needs to fire.</p>

        <div class="comp">
          <button
            v-for="n in [1, 2, 3, 4]"
            :key="n"
            type="button"
            class="comp__opt"
            :class="{ 'comp__opt--active': draft.completions === n && !customCompletionsMode }"
            @click="selectPreset(n)"
          >
            <span class="comp__num display">{{ n }}</span>
            <span class="comp__unit label">× daily</span>
          </button>

          <button
            type="button"
            class="comp__opt comp__opt--custom"
            :class="{ 'comp__opt--active': customCompletionsMode }"
            @click="enableCustom"
          >
            <span class="comp__num display">◇</span>
            <span class="comp__unit label">custom</span>
          </button>
        </div>

        <Transition name="reveal">
          <div v-if="customCompletionsMode" class="comp__custom">
            <input
              type="number"
              min="1"
              max="20"
              v-model.number="draft.completions"
              class="input comp__custom-input"
              placeholder="e.g. 6"
              ref="customInputRef"
            />
            <span class="comp__custom-hint mono">× per day</span>
          </div>
        </Transition>
      </div>
    </div>

    <footer class="form-card__foot">
      <button type="button" class="btn btn-ghost" @click="cancel">Cancel</button>
      <button type="button" class="btn btn-primary" @click="submit" :disabled="!canSubmit">
        {{ isEdit ? 'Save changes →' : 'Add system →' }}
      </button>
    </footer>
  </section>
</template>

<style scoped>
.form-card {
  padding: var(--s-5);
  background: var(--bulkhead);
  border: 1px solid var(--amber-deep);
  border-radius: var(--radius-lg);
  box-shadow: var(--glow-amber);
    position: fixed;
  left: 20px;
  right: 20px;
  bottom: 20px;
  height: 75%;
  overflow: scroll;
}
.form-card__title { font-size: 16px; margin: 0; color: var(--signal); font-weight: 500; }
.form-card__head { 
    margin-bottom: var(--s-4); 
    display: flex;
  justify-content: space-between;
  align-content: center;
  align-items: center;}
.form-card__foot { display: flex; justify-content: flex-end; gap: var(--s-2); margin-top: var(--s-4); }
.form-card__head .btn{
    font-size: 10px;
    height: 28px;
  padding: 4px 28px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: var(--s-3);
}
.field--full { grid-column: 1 / -1; }
.field .label { display: block; margin-bottom: 6px; }
.field__hint {
  font-size: 11px;
  color: var(--signal-low);
  margin: 0 0 var(--s-3);
  line-height: 1.4;
}

/* — Categories — */
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

/* — Completions selector — */
.comp {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--s-2);
}
.comp__opt {
  padding: var(--s-3) var(--s-2);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  transition: all var(--t-fast) var(--ease);
  cursor: pointer;
}
.comp__opt:hover { background: var(--console); border-color: var(--line-hi); }
.comp__opt--active {
  border-color: var(--amber);
  background: var(--console);
  box-shadow: var(--glow-amber);
}
.comp__num { font-size: 26px; line-height: 1; color: var(--amber); }
.comp__opt--custom .comp__num { font-size: 20px; color: var(--cyan); }
.comp__opt--active.comp__opt--custom .comp__num { color: var(--amber); }
.comp__unit { font-size: 8px; color: var(--signal-low); }

.comp__custom {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin-top: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--cyan-deep);
  border-left: 2px solid var(--cyan);
  border-radius: var(--radius);
}
.comp__custom-input {
  flex: 1;
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 4px 0;
  font-family: var(--font-mono);
  font-size: 16px;
  color: var(--signal);
}
.comp__custom-input:focus { outline: 0; background: transparent; }
.comp__custom-input::-webkit-inner-spin-button,
.comp__custom-input::-webkit-outer-spin-button {
  -webkit-appearance: none; margin: 0;
}
.comp__custom-input[type=number] { -moz-appearance: textfield; }
.comp__custom-hint {
  color: var(--cyan-deep);
  font-size: 10px;
  letter-spacing: 0.12em;
}

/* Reveal transition */
.reveal-enter-active, .reveal-leave-active {
  transition: max-height 280ms var(--ease), opacity 200ms var(--ease), margin-top 280ms var(--ease);
  overflow: hidden;
}
.reveal-enter-from, .reveal-leave-to { max-height: 0; opacity: 0; margin-top: 0; }
.reveal-enter-to, .reveal-leave-from { max-height: 80px; opacity: 1; }

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 720px) {
  .form-grid { grid-template-columns: 1fr; }
  .cats { grid-template-columns: 1fr; }
  .comp { grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .comp__num { font-size: 22px; }
  .comp__opt { padding: var(--s-3) 4px; }
}
</style>