/**
 * Destinations catalog. Each destination has:
 *   id              string
 *   name            string                       (display name)
 *   subtitle        string                       (one-line classification)
 *   distanceDays    number                       (light-days from origin; multiplied by 1/velocity → duration)
 *   minRank         number                       (captain rank required to even unlock — gates UI visibility)
 *   description     string                       (longer prose, shown when destination expanded)
 *   poetic          string                       (a single italic line of mood, shown subtle)
 *
 * Distances are tuned so:
 *   - The starter Explorer (velocity 1.0, range 14d) can reach all 14d-distance entries.
 *   - The Pathfinder (velocity 1.7, range 90d) can reach all 153-light-day destinations.
 *   - Mid-tier ships open up middle distances naturally.
 *
 * minRank is the ranks-and-ships gate. Destinations only appear in the UI list once the
 * captain has reached at least (minRank - 1), so there's always something just-out-of-reach
 * to see, but the list isn't an unmanageable wall.
 */

export const DESTINATIONS = [
  // ——— Solar (rank 1) ———
  {
    id: 'luna-outpost',
    name: 'Luna Outpost',
    subtitle: 'Lunar far-side research station',
    distanceDays: 14,
    minRank: 1,
    description:
      'A modest outpost on the lunar far side, used for short orientation runs. Most captains begin here. The journey is brief, the gravity is forgiving, the air smells faintly of solder.',
    poetic: 'A short voyage. A real one.'
  },
  {
    id: 'mars-station',
    name: 'Mars Station',
    subtitle: 'Olympus relay & resupply',
    distanceDays: 14,
    minRank: 1,
    description:
      'A working station nestled at the foot of Olympus Mons. The dust gets into everything. Captains often run a Mars rotation as their second voyage, when the rhythms from the first one are still warm.',
    poetic: 'The dust remembers every footprint.'
  },

  // ——— Inner system (rank 2) ———
  {
    id: 'callisto-mining',
    name: 'Callisto Mining Concern',
    subtitle: 'Jovian moon settlement',
    distanceDays: 28,
    minRank: 2,
    description:
      'A working mining settlement on the most distant Galilean moon. The crew here speaks in shifts, not days. A solid mid-length voyage — long enough to prove a routine, short enough to stay sharp.',
    poetic: 'Jupiter never quite sets here.'
  },
  {
    id: 'titan-academy',
    name: 'Titan Academy',
    subtitle: 'Saturnian school of navigation',
    distanceDays: 30,
    minRank: 2,
    description:
      'A teaching outpost orbiting Titan. Cadets are sent here for navigation drills under one of the most beautiful night skies in the system. The methane lakes shine like mercury when the parent planet is up.',
    poetic: 'The rings cast shadows on the lake.'
  },

  // ——— Trans-Neptunian (rank 3) ———
  {
    id: 'pluto-archive',
    name: 'Pluto Archive',
    subtitle: 'Cold-storage records facility',
    distanceDays: 42,
    minRank: 3,
    description:
      'A vast underground archive cut into the heart-shaped plain of Tombaugh Regio. The librarians here speak softly, and the climate has not changed in three centuries. A research voyage with weight.',
    poetic: 'Some records keep themselves.'
  },
  {
    id: 'sedna-monastery',
    name: 'Sedna Monastery',
    subtitle: 'Contemplative outer-system order',
    distanceDays: 45,
    minRank: 3,
    description:
      'A monastic order keeping watch from one of the most distant inhabited bodies. The brothers and sisters here have given up most things, including hurry. Long study voyages end well at Sedna.',
    poetic: 'A bell rings once a century.'
  },

  // ——— Heliopause & beyond (rank 4) ———
  {
    id: 'voyager-memorial',
    name: 'Voyager Memorial',
    subtitle: 'Site of the original probes',
    distanceDays: 56,
    minRank: 4,
    description:
      'The point in space where the original Voyager probes crossed the heliopause, now marked by a small monument carried out by hand. Captains who reach it leave something behind — a coin, a note, a name. Most do not say what.',
    poetic: 'The first ones did not come back. None of us were meant to.'
  },
  {
    id: 'oort-listening-post',
    name: 'Oort Listening Post',
    subtitle: 'Deep-space radio observatory',
    distanceDays: 60,
    minRank: 4,
    description:
      'A radio observatory at the edge of the Oort cloud, listening for signals that take centuries to arrive. The crew speaks of "patience as a science." A natural destination for captains practicing focus.',
    poetic: 'We hear yesterday. We send tomorrow.'
  },

  // ——— Nearest stars (rank 5) ———
  {
    id: 'proxima-b',
    name: 'Proxima Centauri b',
    subtitle: 'The closest exoplanet',
    distanceDays: 68,
    minRank: 5,
    description:
      'The nearest exoplanet to Earth, locked in tidal embrace with a small red star. Half the world is permanent dusk, half is permanent dawn. Most settlements are in the twilight band, where the wind is constant and the stars never quite come out.',
    poetic: 'The terminator does not move. Everything else does.'
  },
  {
    id: 'alpha-cen-a',
    name: 'Alpha Centauri A',
    subtitle: 'Old colony in the binary system',
    distanceDays: 72,
    minRank: 5,
    description:
      'One of the original interstellar colonies. The architecture is ornate, the wine is excellent, and the people speak a softened dialect of an old Earth language. Reaching Alpha Cen A is a milestone many captains pause at for a long time.',
    poetic: 'Two suns. One long afternoon.'
  },

  // ——— Mid-stellar (rank 6) ———
  {
    id: 'barnards-star',
    name: 'Barnard\'s Star',
    subtitle: 'Fast-moving red dwarf system',
    distanceDays: 80,
    minRank: 6,
    description:
      'A small, ancient star moving across the sky faster than any other. Settlements here are built on rails — entire cities slide a few meters a year to maintain their bearings. Long-haul captains favor it; the work feels like it is moving with you.',
    poetic: 'Even the ground travels.'
  },
  {
    id: 'wolf-1061c',
    name: 'Wolf 1061c',
    subtitle: 'Habitable-zone exoplanet',
    distanceDays: 84,
    minRank: 6,
    description:
      'A rocky world in the habitable zone of a small star, with shallow seas and short days. The colony here is young — three generations — and still figuring out who it is. Captains often return to Wolf 1061c more than once.',
    poetic: 'The first questions have not been answered. They have been improved.'
  },

  // ——— Long voyage (rank 7) ———
  {
    id: 'trappist-1e',
    name: 'TRAPPIST-1e',
    subtitle: 'Earth-sized world in a seven-planet system',
    distanceDays: 110,
    minRank: 7,
    description:
      'One of seven planets orbiting a single tiny star. From the surface, the other six worlds appear as crescents and disks at all hours, sometimes larger than Luna from Earth. The skies here are crowded with relatives.',
    poetic: 'You are never alone in the sky.'
  },
  {
    id: 'gliese-581g',
    name: 'Gliese 581g',
    subtitle: 'Tidally-locked super-Earth',
    distanceDays: 120,
    minRank: 7,
    description:
      'A heavy world of perpetual twilight on the dayside ring, with deep oceans on the night side that have never seen the sun. The settlements here are old. People speak slowly. Fast voyages are not welcomed.',
    poetic: 'On the dark side, the fish are larger than the boats.'
  },

  // ——— Pathfinder-only (rank 8) ———
  {
    id: 'kepler-186f',
    name: 'Kepler-186f',
    subtitle: 'Earth-cousin in a distant system',
    distanceDays: 140,
    minRank: 8,
    description:
      'A long voyage to one of the most Earth-like worlds yet found. The light there is reddish-orange and the plants, where they exist, are dark — almost black. Few captains visit. Those who do tend not to write about it.',
    poetic: 'A cousin. Not a sibling.'
  },
  {
    id: 'ross-128b',
    name: 'Ross 128 b',
    subtitle: 'Quiet star, quiet world',
    distanceDays: 148,
    minRank: 8,
    description:
      'A temperate world orbiting one of the calmest stars known — no flares, no tantrums. The settlements have an unhurried quality the rest of the catalog cannot match. The Pathfinder is the only hull that can reach it. Most who go, stay a while.',
    poetic: 'Some stars do not interrupt.'
  },
  {
    id: 'tau-ceti-f',
    name: 'Tau Ceti f',
    subtitle: 'Edge of the inhabited catalog',
    distanceDays: 153,
    minRank: 8,
    description:
      'The farthest currently-charted habitable world. A small colony, founded by Pathfinder captains, refuses to grow. Reaching it is, for most, the final voyage they need to make. After Tau Ceti, captains often start returning to Luna.',
    poetic: 'You came this far. Now go anywhere.'
  }
]

export function destinationById(id) {
  return DESTINATIONS.find(d => d.id === id)
}

/**
 * Returns all destinations the captain can SEE in the UI list.
 * Visible = unlocked + the next 2 locked-but-foreshadowed entries.
 * Anything beyond that is hidden behind a "more await" indicator.
 */
export function visibleDestinations(captainRank) {
  const sorted = [...DESTINATIONS].sort((a, b) => a.distanceDays - b.distanceDays)
  const reachable = sorted.filter(d => d.minRank <= captainRank)
  const locked    = sorted.filter(d => d.minRank >  captainRank).slice(0, 2)
  const hiddenCount = sorted.length - reachable.length - locked.length
  return { reachable, locked, hiddenCount }
}
