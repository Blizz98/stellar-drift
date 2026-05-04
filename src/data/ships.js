/**
 * Ship catalog. Each ship has:
 *   id            string
 *   name          string
 *   tagline       short flavor line
 *   rankRequired  captain rank to unlock (1..8)
 *   maxRangeDays  longest voyage this ship can attempt
 *   velocity      light-days per voyage-day (used to compute duration from distance)
 *   bonus         which system category this hull is biased toward, or null for balanced
 *   description   longer prose for the ship card
 *
 * Voyage duration formula:  durationDays = ceil(distanceLightDays / ship.velocity)
 * The ship's maxRangeDays gates what destinations are even attemptable.
 */

export const SHIPS = [
  {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'Balanced. Built to begin.',
    rankRequired: 1,
    maxRangeDays: 14,
    velocity: 1.0,
    bonus: null,
    description:
      'A standard-issue scout. No specialization, no glamour — just enough hull to get out, look around, and come home. Every captain starts here. Most return to it on purpose.'
  },
  {
    id: 'frigate',
    name: 'Frigate',
    tagline: 'Reinforced. Built for strain.',
    rankRequired: 2,
    maxRangeDays: 30,
    velocity: 1.1,
    bonus: 'engineering',
    description:
      'Thicker armor, redundant systems, brutal acceleration profile. Engineering crews swear by it. Favor this hull when the voyage will demand sustained physical effort.'
  },
  {
    id: 'science-vessel',
    name: 'Science Vessel',
    tagline: 'Patient. Built to learn.',
    rankRequired: 3,
    maxRangeDays: 45,
    velocity: 1.2,
    bonus: 'research',
    description:
      'Half the ship is laboratory. A research vessel rewards voyages structured around learning — curricula, courses, the long study of one thing. The library is enormous.'
  },
  {
    id: 'cutter',
    name: 'Cutter',
    tagline: 'Sharp. Built to cut a course.',
    rankRequired: 4,
    maxRangeDays: 60,
    velocity: 1.4,
    bonus: 'navigation',
    description:
      'A long-range vessel with an obsessive nav suite. Cutters are flown by captains who know exactly where they are going and want to get there cleanly. Focus voyages thrive in this hull.'
  },
  {
    id: 'long-hauler',
    name: 'Long-Hauler',
    tagline: 'Generous. Built to sustain.',
    rankRequired: 6,
    maxRangeDays: 75,
    velocity: 1.5,
    bonus: 'life-support',
    description:
      'Heavy on hydroponics, generous quarters, exceptional medical bay. The hull of choice when a voyage is fundamentally about recovery, sleep, food, and stillness — the slow systems that make the rest possible.'
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    tagline: 'Flagship. Built to reach.',
    rankRequired: 8,
    maxRangeDays: 90,
    velocity: 1.7,
    bonus: null,
    description:
      'A balanced flagship reserved for Admirals. Reaches destinations no other hull can. Most who fly it have flown everything else first; they earned the patience the long voyage requires.'
  }
]

export function shipById(id) {
  return SHIPS.find(s => s.id === id)
}

export function shipsAvailable(rank) {
  return SHIPS.filter(s => s.rankRequired <= rank)
}
