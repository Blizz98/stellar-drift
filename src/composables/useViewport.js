import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Reactive viewport flag. Uses matchMedia for efficient updates
 * (no scroll-jank, no resize storms).
 */
export function useViewport(breakpoint = '(max-width: 720px)') {
  const isMobile = ref(false)
  let mq = null

  function update(e) {
    isMobile.value = e.matches
  }

  onMounted(() => {
    if (typeof window === 'undefined') return
    mq = window.matchMedia(breakpoint)
    isMobile.value = mq.matches
    mq.addEventListener('change', update)
  })

  onUnmounted(() => {
    mq?.removeEventListener('change', update)
  })

  return { isMobile }
}
