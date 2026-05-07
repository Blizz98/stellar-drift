<script setup>
/**
 * Icon picker for habits. Renders a modal grid grouped by theme.
 * Click outside or the close button to dismiss.
 *
 * Props:
 *   modelValue — the currently selected icon id (string or null)
 *
 * Emits:
 *   update:modelValue — when user picks an icon
 *   close — when user dismisses without picking
 */

import { computed } from 'vue'
import { iconsByTheme, iconById } from '@/data/icons'

const props = defineProps({
  modelValue: { type: String, default: null }
})

const emit = defineEmits(['update:modelValue', 'close'])

const themes = computed(() => iconsByTheme())

function pick(id) {
  emit('update:modelValue', id)
  emit('close')
}
</script>

<template>
  <Transition name="fade">
    <div class="picker-overlay" @click.self="emit('close')" role="dialog" aria-modal="true">
      <div class="picker">
        <header class="picker__head">
          <h3 class="picker__title display">Select instrument</h3>
          <button class="picker__close" @click="emit('close')" aria-label="Close">×</button>
        </header>

        <div class="picker__body">
          <section v-for="theme in themes" :key="theme.id" class="picker__section">
            <h4 class="picker__section-label label">{{ theme.label }}</h4>
            <div class="picker__grid">
              <button
                v-for="icon in theme.icons"
                :key="icon.id"
                type="button"
                class="picker__icon"
                :class="{ 'picker__icon--active': modelValue === icon.id }"
                :title="icon.label"
                @click="pick(icon.id)"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <path :d="icon.path" stroke="currentColor" stroke-width="1.6"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="picker__icon-label">{{ icon.label }}</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(6, 8, 15, 0.85);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: var(--s-5);
}

.picker {
  width: 100%;
  max-width: 580px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--bulkhead);
  border: 1px solid var(--amber-deep);
  border-radius: var(--radius-lg);
  box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.7);
  overflow: hidden;
}

.picker__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--s-4) var(--s-5);
  border-bottom: 1px solid var(--line);
}
.picker__title { font-size: 22px; margin: 0; color: var(--signal); }
.picker__close {
  width: 32px; height: 32px;
  border-radius: 50%;
  font-size: 22px;
  color: var(--signal-low);
  transition: all var(--t-fast) var(--ease);
}
.picker__close:hover { background: var(--hull); color: var(--signal); }

.picker__body {
  overflow-y: auto;
  padding: var(--s-4) var(--s-5);
}

.picker__section { margin-bottom: var(--s-5); }
.picker__section:last-child { margin-bottom: 0; }
.picker__section-label {
  display: block;
  margin-bottom: var(--s-3);
  color: var(--cyan-deep);
  padding-bottom: var(--s-2);
  border-bottom: 1px dashed var(--line);
}

.picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: var(--s-2);
}

.picker__icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: var(--s-3) 6px;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  color: var(--signal-dim);
  transition: all var(--t-fast) var(--ease);
  cursor: pointer;
}
.picker__icon:hover {
  background: var(--console);
  border-color: var(--line-hi);
  color: var(--signal);
}
.picker__icon--active {
  background: var(--console);
  border-color: var(--amber);
  color: var(--amber);
  box-shadow: var(--glow-amber);
}
.picker__icon-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--signal-low);
  text-align: center;
  line-height: 1.2;
}
.picker__icon--active .picker__icon-label { color: var(--amber-deep); }

.fade-enter-active, .fade-leave-active { transition: opacity var(--t-med) var(--ease); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .picker { max-height: 90vh; }
  .picker__grid { grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); }
}
</style>