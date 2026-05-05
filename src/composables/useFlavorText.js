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
  // ——— Original 30 ———
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
  'External hull temp -271.3°C',

  // ——— Ship systems & maintenance ———
  'Plasma conduit flushed',
  'Atmospheric scrubbers running clean',
  'Gravity plating recalibrated, deck 3',
  'Fuel cell stack at 87.4%',
  'Auxiliary power on standby',
  'Thruster gimbal alignment verified',
  'Coolant loop pressure steady',
  'Antimatter containment: nominal',
  'Cryo array thermal gradient stable',
  'Maintenance bot dispatched, junction C-7',
  'Sublight engine harmonics clean',
  'Field generator humming inside spec',
  'Waste recycler at 62% capacity',
  'Backup beacon armed and silent',
  'Damage control drill: passed',

  // ——— Navigation & astronomy ———
  'Pulsar triangulation refined',
  'Local star drift logged',
  'Gravitational lens compensation applied',
  'Astrogator chart cache refreshed',
  'Helm response within 4ms',
  'Spatial anomaly: nothing of note',
  'Course confidence interval tightening',
  'Rogue planet logged, no threat',
  'Comet flyby observed at 2.3 AU',
  'Dark matter density: as expected',
  'Stellar parallax measurement queued',
  'Quantum entanglement link stable',
  'Time dilation correction: 0.0008%',
  'Reference frame locked',
  'Wormhole survey, none in range',

  // ——— Crew & living ———
  'Night watch handover complete',
  'Galley prepares synthcake for shift change',
  'Captain\'s ready room lights dimmed',
  'Botanist tending to the orchids',
  'Engineer reading on the observation deck',
  'Doctor on standby, infirmary quiet',
  'Yeoman filing the morning report',
  'Helmsman whistling, again',
  'Cat sighted in cargo bay 4',
  'Crew movie night: Tarkovsky',
  'Library checkouts: 12 today',
  'Yoga deck reserved 0600–0700',
  'Mess hall conversation: low and warm',
  'Carpentry shop dust-free',
  'Mailroom quiet, as ever',

  // ——— Atmosphere, weather, oddments ———
  'Solar flare: minor, deflected',
  'Cosmic background hum recorded',
  'Aurora visible from observation lounge',
  'Meteor shower expected, 14h',
  'Ice crystal formations on viewport 7',
  'Ringed gas giant on long-range scan',
  'Twin star system entering view',
  'Nebula colors shifting, port side',
  'Distant pulsar audible on shortwave',
  'Solar sail furled for the night cycle',
  'Comet trail crosses navigation plane',
  'Faint signal, ancient, ignored',
  'Old satellite passes silently',
  'Probe deployed, awaiting return',
  'Star-shadow on the hull, 14 seconds',

  // ——— Logs, archives, and quiet things ———
  'Captain\'s log autosaved',
  'Voyage record committed to archive',
  'Crew manifest unchanged',
  'Personal logs encrypted, as requested',
  'Daily debrief filed without comment',
  'Memorial service held, deck 5',
  'Archive access: minimal',
  'Photographic record updated',
  'Dream log reviewed by Doctor',
  'Letter dispatched home, 4-month delay',
  'Ship\'s clock checked against pulsar',
  'Recreational reading list expanded',
  'Off-duty hours observed strictly',
  'Internal comms: 4 personal calls',
  'Voyage soundtrack on shuffle',

  // ——— Outer-system flavor ———
  'Heliosphere boundary in view',
  'Trans-Neptunian object catalogued',
  'Outer-system silence, profound',
  'Voyager-class probe detected, ahead',
  'Drift signal from Oort cloud',
  'Long-period comet logged',
  'Galactic plane crossing in 2 days',
  'Interstellar medium composition: usual',
  'Dust impact: smaller than a grain of rice',
  'Local interstellar cloud entered',
  'Sky brighter than expected, by 2%',
  'Halo orbit established',
  'Magnetosphere wake observed',
  'Bow shock crossed at 0237',
  'Bright object, far port: identified, friendly'
]

export function dailyTelemetry(dateISO, count = 10) {
  return pickN(TELEMETRY, count, `tlm:${dateISO}`)
}
