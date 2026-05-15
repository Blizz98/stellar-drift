<script setup>
import { ref, computed } from 'vue'
import { useCaptainStore } from '@/stores/captain'

const captain = useCaptainStore()

const nameDraft = ref('')

const showModal = computed(() => !captain.state.hasOnboarded)

function commit() {
  captain.completeOnboarding(nameDraft.value)
}

function skip() {
  captain.completeOnboarding('')  // keeps default 'Captain'
}
</script>

<template>
  <Transition name="overlay">
    <div v-if="showModal" class="overlay" role="dialog" aria-modal="true">
      <div class="modal">

        <header class="modal__head">
          <p class="label modal__kicker">First contact</p>
          <h2 class="display modal__title">Welcome aboard.</h2>
        </header>

        <section class="modal__body">
          <p class="modal__lede">
            Stellar Drift tracks daily habits across long voyages.
            You're the captain. Voyages last days or weeks. Habits are
            the ship's systems — engineering, navigation, research,
            life-support — and you keep them running.
          </p>
          <p class="modal__lede">
            There's no streak counter. No daily punishment. Every voyage
            ends, and ending is fine.
          </p>

          <div class="field">
            <label for="captain-name" class="label">What's your name?</label>
            <input
              id="captain-name"
              v-model="nameDraft"
              type="text"
              class="input modal__name-input"
              placeholder="Captain"
              maxlength="40"
              autofocus
              @keydown.enter="commit"
            />
            <p class="field__hint mono">USED IN THE CAPTAIN'S RECORD — CAN BE CHANGED LATER</p>
          </div>
        </section>

        <footer class="modal__foot">
          <button class="btn btn-ghost" @click="skip">
            Skip
          </button>
          <button class="btn btn-primary" @click="commit">
            <template v-if="nameDraft.trim()">Begin · I am {{ nameDraft.trim() }} →</template>
            <template v-else>Begin without naming →</template>
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
  background: rgba(6, 8, 15, 0.92);
  backdrop-filter: blur(10px);
}

.modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: var(--bulkhead);
  border: 1px solid var(--amber);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7), var(--glow-amber);
  overflow: hidden;
  padding: var(--s-6);
}

.modal__head {
  text-align: center;
  margin-bottom: var(--s-5);
}
.modal__kicker { color: var(--amber-deep); }
.modal__title {
  font-size: 36px;
  margin: var(--s-2) 0 0;
  color: var(--amber);
  line-height: 1;
}

.modal__lede {
  color: var(--signal-dim);
  font-size: 13px;
  line-height: 1.65;
  margin: 0 0 var(--s-4);
}
.modal__lede:last-of-type { margin-bottom: var(--s-5); }

.field { margin-top: var(--s-4); }
.field .label { display: block; margin-bottom: var(--s-2); }
.field__hint {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
  margin: var(--s-2) 0 0;
}

.modal__name-input {
  width: 100%;
  font-family: var(--font-display);
  font-size: 20px;
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--signal);
  transition: border-color var(--t-fast) var(--ease);
}
.modal__name-input:focus {
  outline: 0;
  border-color: var(--amber);
}

.modal__foot {
  display: flex;
  justify-content: space-between;
  gap: var(--s-3);
  margin-top: var(--s-5);
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
  .modal { padding: var(--s-5); }
  .modal__title { font-size: 28px; }
  .modal__foot { flex-direction: column-reverse; }
  .modal__foot .btn { width: 100%; justify-content: center; }
}
</style>