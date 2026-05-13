<script setup>
import { computed } from 'vue'
import { useCaptainStore, rankDisplay } from '@/stores/captain'
import { SHIPS } from '@/data/ships'
import RankInsignia from '@/components/RankInsignia.vue'

const captain = useCaptainStore()

const pending = computed(() => captain.pendingLevelUp)
const isNamed = computed(() => pending.value?.namedPromotion === true)

const fromDisplay = computed(() => pending.value ? rankDisplay(pending.value.from) : '')
const toDisplay   = computed(() => pending.value ? rankDisplay(pending.value.to)   : '')

// Newly unlocked ships, only when this is a named promotion
const unlockedShips = computed(() => {
  if (!pending.value || !isNamed.value) return []
  const fromRank = pending.value.from.rank
  const toRank   = pending.value.to.rank
  return SHIPS.filter(s => s.rankRequired > fromRank && s.rankRequired <= toRank)
})

function dismiss() {
  captain.clearPendingLevelUp()
}
</script>

<template>
  <Transition name="overlay">
    <div v-if="pending" class="overlay" :class="{ 'overlay--named': isNamed, 'overlay--grade': !isNamed }"
         role="dialog" aria-modal="true">
      <div class="modal" :class="{ 'modal--named': isNamed }">

        <!-- Background ray pattern, stronger for named promotions -->
        <div v-if="isNamed" class="modal__rays" aria-hidden="true">
          <span v-for="i in 12" :key="i" class="modal__ray" :style="{ transform: `rotate(${i * 30}deg)` }" />
        </div>

        <header class="modal__head">
          <span class="label modal__kicker">
            {{ isNamed ? 'Promotion · new rank earned' : 'Grade advancement' }}
          </span>
          <h2 class="display modal__title">
            {{ isNamed ? 'Promoted.' : 'Grade up.' }}
          </h2>
        </header>

        <!-- The actual rank progression -->
        <section class="progression">
          <div class="step step--from">
            <RankInsignia
              :rank="pending.from.rank"
              :grade="pending.from.grade"
              :size="isNamed ? 64 : 56"
            />
            <span class="step__label mono">{{ fromDisplay }}</span>
          </div>

          <div class="arrow" aria-hidden="true">→</div>

          <div class="step step--to">
            <div class="step__glow" />
            <RankInsignia
              :rank="pending.to.rank"
              :grade="pending.to.grade"
              :size="isNamed ? 96 : 72"
            />
            <span class="step__label step__label--to mono">{{ toDisplay }}</span>
          </div>
        </section>

        <!-- Unlocked ships, only on named promotions -->
        <section v-if="unlockedShips.length > 0" class="unlocks">
          <p class="label unlocks__kicker">New hulls available</p>
          <ul class="unlocks__list">
            <li v-for="ship in unlockedShips" :key="ship.id" class="unlock">
              <span class="display unlock__name">{{ ship.name }}</span>
              <span class="mono unlock__tag">{{ ship.tagline }}</span>
            </li>
          </ul>
        </section>

        <footer class="modal__foot">
          <button class="btn btn-primary modal__ack" @click="dismiss">
            {{ isNamed ? 'Acknowledge promotion →' : 'Continue →' }}
          </button>
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
  display: grid;
  place-items: center;
  padding: var(--s-5);
  background: rgba(6, 8, 15, 0.88);
  backdrop-filter: blur(10px);
}
.overlay--named { background: rgba(6, 8, 15, 0.92); }

.modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--bulkhead);
  border: 1px solid var(--amber-deep);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  padding: var(--s-6);
}
.modal--named {
  border-color: var(--amber);
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7), var(--glow-amber);
}

/* Rotating ray pattern, only on named promotions */
.modal__rays {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0.4;
  animation: rays-rotate 60s linear infinite;
}
.modal__ray {
  position: absolute;
  width: 800px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--amber-deep), transparent);
  transform-origin: center;
  opacity: 0.3;
}
@keyframes rays-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.modal__head {
  text-align: center;
  margin-bottom: var(--s-5);
  position: relative;
  z-index: 1;
}
.modal__kicker { color: var(--amber-deep); }
.modal__title {
  font-size: 36px;
  margin: var(--s-2) 0 0;
  color: var(--signal);
  line-height: 1;
}
.modal--named .modal__title { font-size: 42px; color: var(--amber); }

.progression {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--s-4);
  align-items: center;
  margin: var(--s-5) 0;
  position: relative;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  position: relative;
}
.step--from { color: var(--signal-low); opacity: 0.6; }
.step--to   { color: var(--amber); }

.step__glow {
  position: absolute;
  inset: -16px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,168,70,0.25), transparent 70%);
  animation: step-glow 3s ease-in-out infinite;
}
@keyframes step-glow {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.05); }
}

.step__label {
  font-size: 10px;
  letter-spacing: 0.14em;
}
.step__label--to {
  color: var(--amber);
  font-size: 12px;
}

.arrow {
  font-size: 24px;
  color: var(--amber-deep);
  font-family: var(--font-mono);
}

.unlocks {
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--amber);
  border-radius: var(--radius);
  margin-top: var(--s-4);
  position: relative;
  z-index: 1;
}
.unlocks__kicker { color: var(--amber-deep); margin-bottom: var(--s-3); display: block; }
.unlocks__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.unlock {
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
}
.unlock__name { font-size: 18px; color: var(--signal); }
.unlock__tag {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
}

.modal__foot {
  margin-top: var(--s-5);
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.modal__ack {
  padding: 12px 24px;
  font-size: 12px;
}

.overlay-enter-active { transition: opacity var(--t-med) var(--ease); }
.overlay-leave-active { transition: opacity var(--t-fast) var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }
.overlay-enter-active .modal { animation: modal-in 480ms var(--ease-out); }
@keyframes modal-in {
  from { transform: translateY(20px) scale(0.96); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}

@media (max-width: 720px) {
  .modal__title { font-size: 28px; }
  .modal--named .modal__title { font-size: 32px; }
  .progression { gap: var(--s-3); }
  .arrow { font-size: 18px; }
}
</style>