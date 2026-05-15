<script setup>
/**
 * GuidedFirstLaunch — first-run onboarding popup.
 *
 * Renders only on the user's very first session (gated by the persisted
 * `sd:onboarding.completed` flag). Walks the user through a 4-step flow:
 *
 *   1. Welcome & philosophy — a single line that establishes the position
 *   2. Starter habits — pre-filled, tap-to-toggle, all 4 categories covered
 *   3. Auto-launch — confirm the 14-day Luna voyage that's about to happen
 *   4. Done — quick orientation to the Bridge
 *
 * Choosing "Skip tutorial" at step 1 still routes through step 2 (the
 * starter habits) because the four-empty-categories paralysis is the
 * single biggest first-run failure mode. The user who knows what they're
 * doing can deselect everything; the user who doesn't is rescued from
 * cold-start regardless of their tutorial choice.
 *
 * Step transitions are direction-aware: forward navigation slides
 * right-to-left, backward slides left-to-right. The `direction` ref
 * is updated by every navigation function before it changes `step`.
 */

import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'
import { destinationById } from '@/data/destinations'
import { shipById } from '@/data/ships'
import { loadJSON, saveJSON } from '@/composables/usePersistence'
import { useCaptainStore } from '@/stores/captain'

const ONBOARDING_KEY = 'onboarding.completed'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

const emit = defineEmits(['done'])

const captain = useCaptainStore()

// ——— Visibility ———
// Show only if the user has completed the welcome (name prompt) AND
// hasn't completed this guided launch flow AND has no active voyage.
const visible = ref(false)

function checkVisibility() {
  const completed = loadJSON(ONBOARDING_KEY, false)
  visible.value = 
    captain.state.hasOnboarded &&
    !completed &&
    !expedition.isActive
}

// Initial check on mount
onMounted(() => {
  checkVisibility()
})

// React to onboarding completing (WelcomeModal dismissing)
watch(() => captain.state.hasOnboarded, () => {
  checkVisibility()
})

// ——— Step state ———
const step = ref(1)                  // 1..4
const direction = ref('forward')     // 'forward' | 'backward' — drives slide direction
const launching = ref(false)         // disables buttons during the launch action

// ——— Starter habits — bad-day-proof defaults, one per category ———
// Selected by default. User can deselect anything they don't want, or add more
// later from the Systems screen.
const starterHabits = ref([
  {
    name: 'Take a walk',
    description: 'Take a breath outside and enjoy a healthy walk.',
    category: 'engineering',
    icon: '🚶',
    selected: true
  },
  {
    name: 'One focused work block',
    description: '25 minutes on one thing, no notifications.',
    category: 'navigation',
    icon: '◎',
    selected: true
  },
  {
    name: 'Read 20 minutes',
    description: 'Book, paper, course — anything sustained.',
    category: 'research',
    icon: '📖',
    selected: true
  },
  {
    name: 'Lights out by 11pm',
    description: 'Sleep is very important, do not neglect it.',
    category: 'life-support',
    icon: '🌙',
    selected: true
  }
])

const selectedCount = computed(() => starterHabits.value.filter(h => h.selected).length)

function toggleHabit(idx) {
  starterHabits.value[idx].selected = !starterHabits.value[idx].selected
}

// ——— Voyage parameters (fixed for first launch) ———
const firstVoyageDest = destinationById('luna-outpost')
const firstVoyageShip = shipById('explorer')
const firstVoyageDuration = computed(() =>
  Math.ceil(firstVoyageDest.distanceDays / firstVoyageShip.velocity)
)

// ——— Step navigation ———
function nextStep() {
  direction.value = 'forward'
  step.value = Math.min(4, step.value + 1)
}

function prevStep() {
  direction.value = 'backward'
  step.value = Math.max(1, step.value - 1)
}

/**
 * Skip the philosophy intro but still take the user through habit selection.
 * The cold-start fix is the most important part; we don't gate it behind
 * "yes I want a tutorial."
 */
function skipIntro() {
  visible.value = false
  emit('done')
  router.push('/')
  saveJSON(ONBOARDING_KEY, true)
}

// ——— Final action: launch the voyage and add starter habits ———
async function launchFirstVoyage() {
  if (launching.value) return
  launching.value = true

  // Order matters: addHabit scopes to expedition.current, so we must launch first.
  expedition.launchExpedition({
    name: 'First Voyage',
    destination: firstVoyageDest.name,
    destinationId: firstVoyageDest.id,
    shipClass: firstVoyageShip.id,
    durationDays: firstVoyageDuration.value
  })

  for (const h of starterHabits.value) {
    if (!h.selected) continue
    habits.addHabit({
      name: h.name,
      description: h.description,
      category: h.category,
      icon: h.icon
    })
  }

  saveJSON(ONBOARDING_KEY, true)
  direction.value = 'forward'
  step.value = 4
  launching.value = false
}

function finish() {
  visible.value = false
  emit('done')
  router.push('/')
}
</script>

<template>
  <Transition name="overlay">
    <div v-if="visible" class="guided" role="dialog" aria-modal="true" aria-labelledby="guided-title">
      <div class="guided__sheet">

        <!-- Step indicator -->
        <header class="guided__head">
          <span class="label guided__kicker">First launch · step {{ step }} of 4</span>
          <div class="guided__pips" aria-hidden="true">
            <span
              v-for="i in 4"
              :key="i"
              class="guided__pip"
              :class="{
                'guided__pip--current': step === i,
                'guided__pip--past':    step > i
              }"
            />
          </div>
        </header>

        <!-- Step container clips the sliding panels -->
        <div class="guided__steps">
          <Transition :name="direction === 'forward' ? 'slide-fwd' : 'slide-back'" mode="out-in">

            <!-- ===================== STEP 1: WELCOME ===================== -->
            <section v-if="step === 1" key="step-1" class="guided__body">
              <h2 id="guided-title" class="display guided__title">Welcome aboard, captain.</h2>

              <p class="guided__lede">
                Stellar Drift is a habit tracker shaped like a voyage. You pick the destination,
                cruise for a while, and then reach the destination — ending the voyage.
              </p>

              <div class="guided__principles">
                <span class="principles__header">Principles</span>
                <div class="principle">
                  <span class="principle__num mono">01</span>
                  <p class="principle__text">There is no streak to break. Voyages end. That's the point.</p>
                </div>
                <div class="principle">
                  <span class="principle__num mono">02</span>
                  <p class="principle__text">At first, pick small things you'd do on a bad day. Not your best day.</p>
                </div>
                <div class="principle">
                  <span class="principle__num mono">03</span>
                  <p class="principle__text">Your captain ranks up at voyage end, not by daily performance.</p>
                </div>
              </div>

              <p class="guided__sub">We'll set up your first voyage now. Two minutes.</p>

              <footer class="guided__foot">
                <button class="btn btn-ghost guided__skip" @click="skipIntro">Skip intro →</button>
                <button class="btn btn-primary" @click="nextStep">Continue →</button>
              </footer>
            </section>

            <!-- ===================== STEP 2: STARTER HABITS ===================== -->
            <section v-else-if="step === 2" key="step-2" class="guided__body">
              <h2 class="display guided__title">Your first systems.</h2>

              <p class="guided__lede">
                Four small habits, one per ship system. We picked these because they're
                achievable on a bad day. Tap any to deselect — you can change everything later.
              </p>

              <ul class="starters">
                <li
                  v-for="(h, idx) in starterHabits"
                  :key="h.name"
                  class="starter"
                  :class="{ 'starter--off': !h.selected }"
                  :style="{ '--cat-color': CATEGORIES[h.category].color }"
                  @click="toggleHabit(idx)"
                >
                  <span class="starter__check" aria-hidden="true">
                    <svg v-if="h.selected" viewBox="0 0 24 24" width="14" height="14" fill="none">
                      <path d="M5 12.5l4.5 4.5L19 7.5"
                            stroke="currentColor" stroke-width="2.5"
                            stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>

                  <span class="starter__icon">{{ h.icon }}</span>

                  <div class="starter__body">
                    <span class="starter__cat label">{{ CATEGORIES[h.category].label }}</span>
                    <span class="starter__name">{{ h.name }}</span>
                    <span class="starter__desc">{{ h.description }}</span>
                  </div>
                </li>
              </ul>

              <p v-if="selectedCount === 0" class="guided__warn mono">
                ◇ At least one system is recommended to begin.
              </p>

              <footer class="guided__foot">
                <button class="btn btn-ghost" @click="prevStep">← Back</button>
                <button class="btn btn-primary" @click="nextStep" :disabled="selectedCount === 0">
                  Continue → ({{ selectedCount }} selected)
                </button>
              </footer>
            </section>

            <!-- ===================== STEP 3: CONFIRM LAUNCH ===================== -->
            <section v-else-if="step === 3" key="step-3" class="guided__body">
              <h2 class="display guided__title">Plot a course.</h2>

              <p class="guided__lede">
                Your first voyage is a short one — a 14-day run to Luna Outpost
                in the Explorer. Brief enough to catch the rhythm.
              </p>

              <aside class="summary">
                <div class="summary__row">
                  <span class="label">Destination</span>
                  <span>{{ firstVoyageDest.name }}</span>
                </div>
                <div class="summary__row">
                  <span class="label">Ship</span>
                  <span>{{ firstVoyageShip.name }}</span>
                </div>
                <div class="summary__row">
                  <span class="label">Distance</span>
                  <span class="mono">{{ firstVoyageDest.distanceDays }} light-days</span>
                </div>
                <div class="summary__row summary__row--hi">
                  <span class="label">Duration</span>
                  <span class="mono summary__duration">{{ firstVoyageDuration }} days</span>
                </div>
                <div class="summary__row summary__row--hi">
                  <span class="label">Systems</span>
                  <span class="mono summary__systems">{{ selectedCount }} configured</span>
                </div>
              </aside>

              <p class="guided__poetic display">
                "{{ firstVoyageDest.poetic }}"
              </p>

              <footer class="guided__foot">
                <button class="btn btn-ghost" @click="prevStep" :disabled="launching">← Back</button>
                <button class="btn btn-primary" @click="launchFirstVoyage" :disabled="launching">
                  {{ launching ? 'Launching...' : 'Initiate launch →' }}
                </button>
              </footer>
            </section>

            <!-- ===================== STEP 4: ORIENTED ===================== -->
            <section v-else-if="step === 4" key="step-4" class="guided__body guided__body--success">
              <div class="guided__seal" aria-hidden="true">
                <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
                  <circle cx="32" cy="32" r="14" stroke="currentColor" stroke-width="1.4"/>
                  <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="0.8" opacity="0.5"
                          stroke-dasharray="3 3"/>
                  <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
                  <circle cx="46" cy="22" r="2.5" fill="currentColor"/>
                </svg>
              </div>

              <h2 class="display guided__title">Voyage launched.</h2>

              <p class="guided__lede">
                You're on the bridge of the Explorer, en route to Luna Outpost.
                Tap any system today to mark it nominal.
              </p>

              <ul class="next-up">
                <li><span class="mono next-up__pip">◇</span>The <strong>Bridge</strong> tab is your daily check-in.</li>
                <li><span class="mono next-up__pip">◇</span>The <strong>Voyage</strong> tab shows your progress.</li>
                <li><span class="mono next-up__pip">◇</span>The <strong>Systems</strong> tab allows you to configure your habits.</li>
                <li><span class="mono next-up__pip">◇</span>The <strong>Captain</strong> tab shows your rank and fleet.</li>
                <li><span class="mono next-up__pip">◇</span>The <strong>Log</strong> tab shows your history of voyages.</li>
              </ul>

              <footer class="guided__foot">
                <button class="btn btn-primary guided__finish" @click="finish">
                  Take the bridge →
                </button>
              </footer>
            </section>

          </Transition>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ——————————————————————————————————————————————————————————
   Overlay & sheet shell
   —————————————————————————————————————————————————————————— */
.guided {
  position: fixed;
  inset: 0;
  z-index: 110;
  background: rgba(6, 8, 15, 0.2);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  padding: var(--s-5);
  overflow-y: auto;
}

.guided__sheet {
  position: relative;
  width: 100%;
  max-width: 560px;
  background:
    radial-gradient(600px 320px at 50% 0%, rgba(232, 168, 70, 0.10), transparent 70%),
    var(--bulkhead);
  border: 1px solid var(--amber);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7), var(--glow-amber);
  overflow: hidden;
}

/* ——— Step header (kicker + pips) ——— */
.guided__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  padding: var(--s-4) var(--s-5);
  border-bottom: 1px solid var(--line);
}
.guided__kicker { color: var(--amber-deep); }
.guided__pips { display: flex; gap: 6px; }
.guided__pip {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--line-hi);
  transition: background var(--t-med) var(--ease), box-shadow var(--t-med) var(--ease);
}
.guided__pip--past    { background: var(--amber-deep); }
.guided__pip--current { background: var(--amber); box-shadow: 0 0 8px var(--amber); }

/* ——— Step container — clips the sliding panels ——— */
.guided__steps {
  position: relative;
  overflow: hidden;
}

/* ——— Body container ——— */
.guided__body {
  padding: var(--s-6);
}
.guided__body--success {
  text-align: center;
  padding-top: var(--s-7);
}

.guided__title {
  font-size: 38px;
  margin: 0 0 var(--s-3);
  color: var(--signal);
  line-height: 1.1;
}
.guided__body--success .guided__title {
  font-size: 44px;
  margin-top: var(--s-3);
}

.guided__lede {
  color: var(--signal-dim);
  line-height: 1.65;
  margin: 0 0 var(--s-5);
  font-size: 15px;
}

.guided__sub {
  color: var(--signal-low);
  font-size: 13px;
  margin: var(--s-4) 0 0;
  font-style: italic;
}

/* ——— Step 1: principles list ——— */
.guided__principles {
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  margin-bottom: var(--s-4);
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cyan);
  border-radius: var(--radius);
}
.principles__header{
  color: var(--cyan);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
  text-transform: uppercase;
}
.principle {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: var(--s-3);
  align-items: baseline;
}
.principle__num {
  color: var(--cyan-deep);
  font-size: 11px;
  letter-spacing: 0.08em;
}
.principle__text {
  color: var(--signal);
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

/* ——— Step 2: starter-habit list ——— */
.starters {
  list-style: none;
  margin: 0 0 var(--s-4);
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.starter {
  display: grid;
  grid-template-columns: 22px 32px 1fr;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cat-color);
  border-radius: var(--radius);
  cursor: pointer;
  align-items: center;
  transition: all var(--t-fast) var(--ease);
}
.starter:hover {
  background: var(--console);
  border-color: var(--line-hi);
  border-left-color: var(--cat-color);
}
.starter--off {
  opacity: 0.45;
  border-left-color: var(--line);
}

.starter__check {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--line-hi);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--cat-color);
  transition: all var(--t-fast) var(--ease);
}
.starter:not(.starter--off) .starter__check {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: var(--void);
}

.starter__icon {
  font-size: 18px;
  text-align: center;
}

.starter__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.starter__cat {
  color: var(--cat-color);
  font-size: 9px;
}
.starter__name {
  font-size: 14px;
  color: var(--signal);
}
.starter__desc {
  font-size: 11px;
  color: var(--signal-low);
  line-height: 1.4;
}

.guided__warn {
  color: var(--amber-deep);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-align: center;
  margin: 0 0 var(--s-3);
}

/* ——— Step 3: launch summary ——— */
.summary {
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--amber);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
  margin-bottom: var(--s-4);
}
.summary__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--signal);
}
.summary__row .label { color: var(--signal-low); }
.summary__row--hi {
  padding-top: var(--s-2);
  border-top: 1px dashed var(--line);
}
.summary__duration { color: var(--amber); font-size: 16px; }
.summary__systems  { color: var(--cyan); }

.guided__poetic {
  font-size: 18px;
  color: var(--cyan);
  font-style: italic;
  margin: var(--s-4) 0 0;
  text-align: center;
  line-height: 1.4;
}

/* ——— Step 4: success ——— */
.guided__seal {
  color: var(--amber);
  display: flex;
  justify-content: center;
  margin-bottom: var(--s-3);
}

.next-up {
  list-style: none;
  margin: var(--s-4) 0;
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.next-up li {
  display: flex;
  gap: var(--s-3);
  font-size: 13px;
  color: var(--signal-dim);
  line-height: 1.5;
}
.next-up strong { color: var(--amber); font-weight: 500; text-transform: uppercase; }
.next-up__pip { color: var(--amber-deep); font-size: 10px; }

.guided__finish {
  width: 100%;
  justify-content: center;
  padding: var(--s-4) var(--s-5);
}

/* ——— Footer (back/continue) ——— */
.guided__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--s-3);
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
  margin-top: var(--s-4);
}
.guided__skip {
  margin-right: auto;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ——————————————————————————————————————————————————————————
   Transitions
   —————————————————————————————————————————————————————————— */

/* Outer overlay fade */
.overlay-enter-active { transition: opacity var(--t-med) var(--ease); }
.overlay-leave-active { transition: opacity var(--t-fast) var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.overlay-enter-active .guided__sheet { animation: sheet-in 460ms var(--ease-out); }
@keyframes sheet-in {
  from { transform: translateY(20px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}

/* Forward slide: enter from right, leave to left */
.slide-fwd-enter-active,
.slide-fwd-leave-active {
  transition: transform 360ms var(--ease-out), opacity 280ms var(--ease);
}
.slide-fwd-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.slide-fwd-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

/* Backward slide: enter from left, leave to right */
.slide-back-enter-active,
.slide-back-leave-active {
  transition: transform 360ms var(--ease-out), opacity 280ms var(--ease);
}
.slide-back-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-back-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

/* ——— Mobile ——— */
@media (max-width: 720px) {
  .guided { padding: var(--s-3); align-items: center; padding-top: var(--s-5); }
  .guided__title { font-size: 28px; }
  .guided__body--success .guided__title { font-size: 32px; }
  .guided__head, .guided__body { padding: var(--s-4); }
}
</style>