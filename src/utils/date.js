/**
 * Date utilities — all date math in the app goes through here.
 *
 * Critical: never use `new Date().toISOString().slice(0, 10)` for "today" —
 * that returns UTC date, which is wrong for users not in UTC. Always use
 * `todayISO()` from this module, which returns the local-time date.
 */

/**
 * Returns today's date in YYYY-MM-DD format, in the user's LOCAL timezone.
 * This is what the user thinks of as "today" — the day rolls over at local
 * midnight, not UTC midnight.
 */
export function todayISO() {
  const d = new Date()
  return formatLocalISO(d)
}

/**
 * Format a Date object as YYYY-MM-DD using local-time components.
 */
export function formatLocalISO(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Parse a YYYY-MM-DD string into a Date object representing midnight local time.
 * Use this instead of `new Date(isoString)` — that parses as UTC midnight,
 * which is off by the user's timezone offset.
 */
export function parseLocalISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)  // local midnight
}

/**
 * Days elapsed between two YYYY-MM-DD strings, inclusive of the start date.
 * E.g. ('2025-05-10', '2025-05-12') = 3 (days 10, 11, 12).
 */
export function daysBetween(startISO, endISO) {
  const start = parseLocalISO(startISO)
  const end = parseLocalISO(endISO)
  return Math.floor((end - start) / 86_400_000) + 1
}

/**
 * Add days to a YYYY-MM-DD string, returning a new YYYY-MM-DD string.
 */
export function addDays(iso, days) {
  const d = parseLocalISO(iso)
  d.setDate(d.getDate() + days)
  return formatLocalISO(d)
}