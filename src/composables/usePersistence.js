/**
 * Thin localStorage wrapper. Designed so every read/write goes through
 * one place — when you eventually move to a backend (Supabase, Firebase,
 * your own API), you only need to swap implementations here.
 *
 * All keys are namespaced under `sd:` (Stellar Drift) to avoid collisions.
 */

const NS = 'sd:'

export function loadJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(NS + key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`[persistence] failed to load ${key}:`, err)
    return fallback
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value))
  } catch (err) {
    console.warn(`[persistence] failed to save ${key}:`, err)
  }
}

export function removeKey(key) {
  localStorage.removeItem(NS + key)
}

export function clearAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(NS))
    .forEach(k => localStorage.removeItem(k))
}
