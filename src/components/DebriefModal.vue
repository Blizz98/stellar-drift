<script setup>
/**
 * DebriefModal — appears when a voyage ends (completed or abandoned).
 *
 * Reads `expedition.pendingDebrief` to determine whether to show. The
 * archived voyage data is pulled from `expedition.history` by id. User
 * fills in three short reflection fields, or skips. Either way the
 * pendingDebrief flag clears and the modal dismisses.
 *
 * The reflection text is stored on the archived voyage entry itself,
 * making it visible later in LogView as the voyage's actual record.
 */

import { computed, ref, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { destinationById } from '@/data/destinations'
import { shipById } from '@/data/ships'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

// ——— What's pending? ———
const pending = computed(() => expedition.pendingDebrief)

// Find the just-archived voyage in history
const voyage = computed(() => {
  if (!pending.value) return null
  return expedition.history.find(e => e.id === pending.value.voyageId) || null
})

const wasCompleted = computed(() => pending.value?.status === 'completed')

// ——— Voyage stats for the read-only header ———
const dest = computed(() => voyage.value?.destinationId
  ? destinationById(voyage.value.destinationId)
  : null
)
const ship = computed(() => voyage.value?.shipClass
  ? shipById(voyage.value.shipClass)
  : null
)

// Days actually completed (the voyage may have ended before its planned duration)
const daysCompleted = computed(() => {
  if (!voyage.value) return 0
  const start = new Date(voyage.value.startedAt + 'T00:00:00')
  const end = new Date((voyage.value.endedAt || voyage.value.startedAt) + 'T00:00:00')
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
})

const completionRate = computed(() => {
  if (!voyage.value) return 0
  return habits.averageCompletionForExpedition(
    voyage.value.id,
    voyage.value.startedAt,
    voyage.value.endedAt || voyage.value.startedAt
  )
})

const completionPct = computed(() => Math.round(completionRate.value * 100))

// ——— Form state ———
const draft = ref({ worked: '', surprised: '', nextVoyage: '' })

// Reset draft when a new debrief becomes pending
watch(pending, (p) => {
  if (p) {
    draft.value = { worked: '', surprised: '', nextVoyage: '' }
  }
}, { immediate: true })

// ——— Actions ———
function file() {
  if (!voyage.value) return
  expedition.fileDebrief({
    voyageId: voyage.value.id,
    worked: draft.value.worked,
    surprised: draft.value.surprised,
    nextVoyage: draft.value.nextVoyage
  })
  router.push('/log')
}

function skip() {
  if (!voyage.value) return
  expedition.fileDebrief({ voyageId: voyage.value.id, skipped: true })
  router.push('/log')
}

// ——— Question variants — slightly different framing for abandoned vs completed ———
const questions = computed(() => {
  if (wasCompleted.value) {
    return [
      { key: 'worked',     label: 'What worked?',         placeholder: 'A pattern, a habit, a moment that held...' },
      { key: 'surprised',  label: 'What surprised you?',  placeholder: 'Something you did not expect to learn...' },
      { key: 'nextVoyage', label: 'What is the next voyage?', placeholder: 'A direction, a destination, an idea...' }
    ]
  }
  return [
    { key: 'worked',     label: 'What did the run teach you?',  placeholder: 'Even short voyages leave information behind...' },
    { key: 'surprised',  label: 'What did not work this time?', placeholder: 'A habit too ambitious, a system that broke...' },
    { key: 'nextVoyage', label: 'What changes for next time?',  placeholder: 'Different scope, different systems, different ship...' }
  ]
})
</script>

<template>
  <Transition name="overlay">
    <div v-if="pending && voyage" class="overlay" role="dialog" aria-modal="true" aria-labelledby="debrief-title">
      <div class="modal">

        <header class="modal__head">
          <span class="label modal__kicker">
            {{ wasCompleted ? 'Voyage complete · debrief' : 'Voyage ended early · debrief' }}
          </span>
          <h2 id="debrief-title" class="display modal__title">
            {{ wasCompleted ? 'You made it.' : 'You ended the run.' }}
          </h2>
        </header>

        <!-- Read-only voyage stats -->
        <section class="stats">
          <div class="stats__name display">{{ voyage.name }}</div>
          <div v-if="dest" class="stats__poetic">"{{ dest.poetic }}"</div>

          <dl class="stats__grid">
            <div class="stats__cell">
              <dt class="label">Destination</dt>
              <dd>{{ voyage.destination }}</dd>
            </div>
            <div class="stats__cell">
              <dt class="label">Hull</dt>
              <dd>{{ ship?.name || voyage.shipClass }}</dd>
            </div>
            <div class="stats__cell">
              <dt class="label">Days</dt>
              <dd class="mono">{{ daysCompleted }} / {{ voyage.durationDays }}</dd>
            </div>
            <div class="stats__cell">
              <dt class="label">Completion</dt>
              <dd class="mono stats__rate">{{ completionPct }}%</dd>
            </div>
          </dl>
        </section>

        <!-- Reflection prompts -->
        <section class="reflect">
          <p class="reflect__lede">
            Three short prompts. Honest is better than thorough. You can skip — but the captain remembers what you write.
          </p>

          <div v-for="q in questions" :key="q.key" class="prompt">
            <label class="label prompt__label">{{ q.label }}</label>
            <textarea
              v-model="draft[q.key]"
              :placeholder="q.placeholder"
              class="prompt__input"
              rows="2"
              maxlength="500"
            />
          </div>
        </section>

        <footer class="modal__foot">
          <button class="btn btn-ghost" @click="skip">Skip debrief →</button>
          <button class="btn btn-primary" @click="file">File debrief →</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(6, 8, 15, 0.88);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: var(--s-5);
  overflow-y: auto;
}

.modal {
  position: relative;
  width: 100%;
  max-width: 600px;
  background:
    radial-gradient(600px 320px at 50% 0%, rgba(232, 168, 70, 0.10), transparent 70%),
    var(--bulkhead);
  border: 1px solid var(--amber);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7), var(--glow-amber);
  max-height: 100%;
  overflow: scroll;
}

/* — Header — */
.modal__head {
  padding: var(--s-6) var(--s-6) var(--s-4);
  border-bottom: 1px solid var(--line);
}
.modal__kicker { color: var(--amber-deep); }
.modal__title {
  font-size: 42px;
  margin: var(--s-2) 0 0;
  color: var(--signal);
  line-height: 1.05;
}

/* — Stats section — */
.stats {
  padding: var(--s-5) var(--s-6);
  background: var(--hull);
  border-bottom: 1px solid var(--line);
}
.stats__name {
  font-size: 24px;
  color: var(--signal);
  margin-bottom: var(--s-2);
}
.stats__poetic {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--cyan);
  font-size: 14px;
  margin-bottom: var(--s-4);
}
.stats__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-3);
  margin: 0;
}
.stats__cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stats__cell dt {
  color: var(--signal-low);
  font-size: 9px;
}
.stats__cell dd {
  margin: 0;
  font-size: 14px;
  color: var(--signal);
}
.stats__rate { color: var(--amber); font-size: 16px; }

/* — Reflection section — */
.reflect {
  padding: var(--s-5) var(--s-6);
}
.reflect__lede {
  margin: 0 0 var(--s-5);
  color: var(--signal-dim);
  font-size: 13px;
  line-height: 1.6;
  font-style: italic;
}

.prompt {
  margin-bottom: var(--s-4);
}
.prompt:last-child { margin-bottom: 0; }
.prompt__label {
  display: block;
  margin-bottom: var(--s-2);
  color: var(--cyan-deep);
}
.prompt__input {
  width: 100%;
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cyan-deep);
  border-radius: var(--radius);
  color: var(--signal);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.55;
  resize: vertical;
  min-height: 56px;
  transition: border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease);
}
.prompt__input:focus {
  outline: 0;
  border-color: var(--line-hi);
  border-left-color: var(--cyan);
  background: var(--bulkhead);
}
.prompt__input::placeholder {
  color: var(--signal-low);
  font-style: italic;
}

/* — Footer — */
.modal__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-6);
  border-top: 1px solid var(--line);
  background: var(--hull);
}

/* — Transitions — */
.overlay-enter-active { transition: opacity var(--t-med) var(--ease); }
.overlay-leave-active { transition: opacity var(--t-fast) var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.overlay-enter-active .modal { animation: modal-in 520ms var(--ease-out); }
@keyframes modal-in {
  from { transform: translateY(20px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}

@media (max-width: 720px) {
  .modal__head, .stats, .reflect, .modal__foot { padding-left: var(--s-4); padding-right: var(--s-4); }
  .modal__title { font-size: 30px; }
  .stats__grid { grid-template-columns: repeat(2, 1fr); }
  .modal__foot { flex-direction: column-reverse; }
  .modal__foot .btn { width: 100%; justify-content: center; }
}
</style>