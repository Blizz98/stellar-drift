<script setup>
import { computed } from 'vue'
import { useCaptainStore } from '@/stores/captain'
import { SHIPS } from '@/data/ships'

const captain = useCaptainStore()

const lu = computed(() => captain.pendingLevelUp)

// Find any ships unlocked specifically by this rank crossing
const newShips = computed(() => {
  if (!lu.value) return []
  return SHIPS.filter(s => s.rankRequired === lu.value.to.rank)
})

function dismiss() {
  captain.clearPendingLevelUp()
}
</script>

<template>
  <Transition name="overlay">
    <div v-if="lu" class="overlay" role="dialog" aria-modal="true" aria-labelledby="lu-title">
      <div class="modal">
        <div class="modal__rays" aria-hidden="true">
          <span v-for="i in 24" :key="i" class="modal__ray" :style="{ transform: `rotate(${i * 15}deg)` }" />
        </div>

        <header class="modal__head">
          <span class="label modal__kicker">Promotion · captain's commission</span>
          <h2 id="lu-title" class="display modal__title">Ranked up.</h2>
        </header>

        <div class="modal__transition mono">
          <span class="modal__from">{{ lu.from.name.toUpperCase() }}</span>
          <span class="modal__arrow" aria-hidden="true">→</span>
          <span class="modal__to">{{ lu.to.name.toUpperCase() }}</span>
        </div>

        <p class="modal__quote">
          The fleet records your new rank. There is no ceremony — only the next voyage.
        </p>

        <section v-if="newShips.length > 0" class="modal__unlocks">
          <header class="modal__unlocks-head">
            <span class="label">Newly available hulls</span>
          </header>
          <ul class="modal__unlocks-list">
            <li v-for="s in newShips" :key="s.id" class="modal__unlock">
              <span class="modal__unlock-name">{{ s.name }}</span>
              <span class="modal__unlock-tag">{{ s.tagline }}</span>
              <span class="modal__unlock-range mono">RANGE {{ s.maxRangeDays }}d · VEL {{ s.velocity.toFixed(1) }}c</span>
            </li>
          </ul>
        </section>

        <footer class="modal__foot">
          <button class="btn btn-primary" @click="dismiss">Acknowledge →</button>
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
  background: rgba(6, 8, 15, 0.85);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: var(--s-5);
}

.modal {
  position: relative;
  max-width: 540px;
  width: 100%;
  padding: var(--s-7) var(--s-6) var(--s-6);
  background:
    radial-gradient(500px 300px at 50% 0%, rgba(232, 168, 70, 0.12), transparent 70%),
    var(--bulkhead);
  border: 1px solid var(--amber);
  border-radius: var(--radius-lg);
  box-shadow: 0 0 80px -16px rgba(232, 168, 70, 0.5);
  overflow: hidden;
  text-align: center;
}

/* — Background ray sweep — */
.modal__rays {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0.18;
}
.modal__ray {
  position: absolute;
  width: 1px;
  height: 200px;
  background: linear-gradient(180deg, transparent, var(--amber));
  transform-origin: bottom center;
  animation: rays 30s linear infinite;
}
@keyframes rays { to { transform: rotate(360deg); } }

/* — Content — */
.modal__head { position: relative; margin-bottom: var(--s-5); }
.modal__kicker { color: var(--amber-deep); }
.modal__title {
  font-size: 56px;
  margin: var(--s-2) 0 0;
  color: var(--signal);
  line-height: 1.05;
}

.modal__transition {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--s-3);
  font-size: 14px;
  letter-spacing: 0.18em;
  margin-bottom: var(--s-4);
}
.modal__from { color: var(--signal-low); }
.modal__arrow { color: var(--amber); font-size: 18px; }
.modal__to {
  color: var(--amber);
  font-size: 18px;
  text-shadow: 0 0 12px var(--amber);
  animation: rank-glow 2.4s ease-in-out infinite;
}
@keyframes rank-glow {
  0%, 100% { text-shadow: 0 0 12px var(--amber); }
  50%      { text-shadow: 0 0 24px var(--amber); }
}

.modal__quote {
  position: relative;
  color: var(--signal-dim);
  font-size: 14px;
  max-width: 380px;
  margin: 0 auto var(--s-5);
  line-height: 1.6;
  font-style: italic;
}

/* — Unlock section — */
.modal__unlocks {
  position: relative;
  text-align: left;
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  margin-bottom: var(--s-5);
}
.modal__unlocks-head { margin-bottom: var(--s-3); }
.modal__unlocks-list {
  list-style: none;
  padding: 0; margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}
.modal__unlock {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--s-2);
  align-items: baseline;
}
.modal__unlock-name {
  font-size: 15px;
  color: var(--signal);
  grid-column: 1;
}
.modal__unlock-tag {
  grid-column: 1;
  font-size: 12px;
  color: var(--signal-low);
  font-style: italic;
}
.modal__unlock-range {
  grid-column: 2;
  grid-row: 1 / span 2;
  font-size: 9px;
  color: var(--cyan);
  align-self: center;
  letter-spacing: 0.08em;
}

.modal__foot { position: relative; }

/* — Transitions — */
.overlay-enter-active { transition: opacity var(--t-med) var(--ease); }
.overlay-leave-active { transition: opacity var(--t-fast) var(--ease); }
.overlay-enter-from, .overlay-leave-to { opacity: 0; }

.overlay-enter-active .modal {
  animation: modal-in 520ms var(--ease-out);
}
@keyframes modal-in {
  from { transform: translateY(20px) scale(0.94); opacity: 0; }
  to   { transform: translateY(0)    scale(1);    opacity: 1; }
}

@media (max-width: 720px) {
  .modal { padding: var(--s-5) var(--s-4); }
  .modal__title { font-size: 38px; }
}
</style>
