/**
 * Deterministic flavor-text picker. Same seed → same output, so the user
 * sees a stable message all day (no "what was that line?" flicker).
 *
 * Used for:
 *  - daily mission brief (BRIEFS, by sector + completion bucket)
 *  - ambient telemetry feed (TELEMETRY, rolling 3-line sample)
 */

function hash(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

function pickFrom(arr, seed) {
  return arr[hash(seed) % arr.length]
}

function pickN(arr, n, seed) {
  // simple deterministic shuffle: pick by stepping through with a coprime stride
  if (arr.length <= n) return [...arr]
  const stride = (hash(seed + ':stride') % (arr.length - 1)) + 1
  let idx = hash(seed) % arr.length
  const out = []
  const seen = new Set()
  while (out.length < n && seen.size < arr.length) {
    if (!seen.has(idx)) { out.push(arr[idx]); seen.add(idx) }
    idx = (idx + stride) % arr.length
  }
  return out
}

/* ——————————————————————————————————————————
   DAILY MISSION BRIEFS — keyed [sector][bucket]
   bucket: 'low' (<33%), 'mid' (33–66%), 'high' (>66%)
   Tone: a wise, unfussy first officer.
   —————————————————————————————————————————— */
const BRIEFS = {
  1: {
    low:  [
      'Departure days. Establish rhythms; do not chase perfection.',
      'The ship is leaving dock. Small movements are enough today.',
      'Sector one is for showing up. That is the entire job.',
      'Early voyage. Aim for present, not impressive.'
    ],
    mid: [
      'Cadence is finding its shape. Resist the urge to add more.',
      'Steady departure. Watch for over-commitment in the first weeks.',
      'You are building the rhythm you will live with for the whole run.'
    ],
    high: [
      'Strong start. Note the cadence — you will need it later.',
      'All systems firing. Bank the pattern, not the day.',
      'Departure went clean. The voyage is younger than it feels.'
    ]
  },
  2: {
    low: [
      'Open space. Novelty has worn thin. This is the test.',
      'Sector two is where most voyages drift. Anchor on one system today.',
      'Mid-voyage fatigue is data, not failure.'
    ],
    mid: [
      'Holding through the quiet stretch. Continue.',
      'No spectacle here, just the work. Continue.',
      'The middle of the voyage rewards consistency over heroics.'
    ],
    high: [
      'Strong showing in the hardest sector. Do not explain why; just continue.',
      'You are where most crews fail. You are not failing.',
      'The pattern is holding. Trust it through the silence.'
    ]
  },
  3: {
    low: [
      'Long stretch from origin and destination both. Stay light.',
      'Deep voyage. Fatigue accumulates. Recovery is part of the work.',
      'Sector three asks for restraint, not effort.'
    ],
    mid: [
      'Past the halfway point. Keep the deck clear.',
      'Deep voyage. The crew remembers the start, not the average day.',
      'Hold the line; the destination will come into view soon enough.'
    ],
    high: [
      'Approach is in sight. Do not change course now.',
      'You held through the deep. The rest is execution.',
      'Sector three nominal. Begin tightening for approach.'
    ]
  },
  4: {
    low: [
      'Approach. Soft landing matters more than perfect performance.',
      'The voyage will end soon, however it ends. Land gently.',
      'Final sector. The last days are a courtesy, not a sprint.'
    ],
    mid: [
      'Destination in view. Land cleanly.',
      'Approach phase. Wrap loose ends; do not start new ones.',
      'Final sector. Reduce, do not add.'
    ],
    high: [
      'Final approach, full sails. End it well.',
      'You are about to complete the voyage. Sit with that.',
      'The voyage closes strong. Note how it felt — you will repeat it.'
    ]
  }
}

export function dailyBrief(sector, completionRate, dateISO) {
  const bucket = completionRate < 0.33 ? 'low' : completionRate < 0.67 ? 'mid' : 'high'
  const bank = BRIEFS[sector]?.[bucket] ?? BRIEFS[1].low
  return pickFrom(bank, `brief:${dateISO}:${sector}:${bucket}`)
}

/* ——————————————————————————————————————————
   AMBIENT TELEMETRY — flavor lines, no game weight.
   Pure atmosphere. Pulled from a shared bank, deterministic per-day.
   —————————————————————————————————————————— */
const TELEMETRY = [
  'Long-range scan: clear horizon',
  'Hydroponics yield within parameters',
  'Crew chronometer synchronized',
  'Telemetry buffer at 99.7% capacity',
  'Reaction mass: nominal',
  'Star catalogue updated, 47 new entries',
  'Reactor flux steady at 0.8c',
  'Comm relay handshake confirmed',
  'Astronav drift correction logged',
  'Cabin pressure stable',
  'Heat sink discharge cycle complete',
  'Solar wind reading: 412 km/s',
  'Magnetic deflection minor',
  'Cargo manifest reconciled',
  'Library uplink complete',
  'Recreational deck quiet',
  'Dust impact log: 3 micro-events',
  'Course correction applied: 0.04°',
  'Hibernation pods all green',
  'Galley inventory updated',
  'Deep-field telescope idle',
  'Subspace ping returned',
  'Backup AI dreaming',
  'Sensor array de-iced',
  'Radiation shield: 100%',
  'Coffee replicator nominal',
  'Inertial dampers steady',
  'Lifeline tether retracted',
  'Star fix locked, error 0.002 arcsec',
  'External hull temp -271.3°C'
]

export function dailyTelemetry(dateISO, count = 3) {
  return pickN(TELEMETRY, count, `tlm:${dateISO}`)
}
