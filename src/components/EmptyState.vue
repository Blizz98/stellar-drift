<script setup>
defineProps({
  title: { type: String, required: true },
  body:  { type: String, default: '' }
})
</script>

<template>
  <div class="empty">
    <div class="empty__mark" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
        <circle cx="32" cy="32" r="14" stroke="currentColor" stroke-width="1" opacity="0.6"/>
        <circle cx="32" cy="32" r="22" stroke="currentColor" stroke-width="0.8" opacity="0.35" stroke-dasharray="3 3"/>
        <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="0.5" opacity="0.2"/>
        <circle cx="46" cy="22" r="2" fill="currentColor"/>
      </svg>
    </div>
    <h3 class="display empty__title">{{ title }}</h3>
    <p v-if="body" class="empty__body">{{ body }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty {
  text-align: center;
  padding: var(--s-8) var(--s-5);
  color: var(--signal-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
}
.empty__mark { color: var(--amber); opacity: 0.6; margin-bottom: var(--s-2); }
.empty__title { font-size: 32px; color: var(--signal); margin: 0; }
.empty__body { max-width: 460px; line-height: 1.6; margin: 0; }
</style>
