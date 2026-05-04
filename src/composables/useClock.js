import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Single shared 1Hz timer for live "T+" displays. Reference-counted so
 * the interval only runs while at least one component is mounted.
 */
const now = ref(Date.now())
let timer = null
let refs = 0

export function useClock() {
  onMounted(() => {
    refs += 1
    if (!timer) {
      now.value = Date.now()
      timer = setInterval(() => { now.value = Date.now() }, 1000)
    }
  })

  onUnmounted(() => {
    refs -= 1
    if (refs <= 0 && timer) {
      clearInterval(timer)
      timer = null
      refs = 0
    }
  })

  return { now }
}
