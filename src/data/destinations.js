/**
 * Destinations catalog — 24 entries, balanced against the 10-named-rank system
 * and the 130-day maximum voyage duration.
 *
 * Distances are real astronomical references translated to a fictional "light-day"
 * unit. Scale calibrated so Proxima Centauri (4.24 real light-years) ≈ 140 ld,
 * making 1 real light-year ≈ 33 ld. The math works out so that every named real
 * star/system within reach maps to a voyage duration that fits ship capabilities.
 *
 * The closest known stars beyond Wolf 359 are beyond reach with current hulls —
 * they exist in the universe but not yet in the captain's catalog. A future ship
 * tier could open them.
 *
 * Distribution across the 10 named ranks:
 *   Cadet (R1):          3 destinations — Earth-Moon system
 *   Ensign (R2):         3                — inner solar / belt
 *   Lieutenant (R3):     3                — gas giant moons
 *   Commander (R4):      2                — outer planets
 *   Captain (R5):        2                — trans-neptunian
 *   Senior Captain (R6): 2                — heliosphere / oort
 *   Fleet Captain (R7):  3                — nearest stars (Proxima, Alpha Cen)
 *   Commodore (R8):      2                — Barnard's, Luhman 16
 *   Rear Admiral (R9):   2                — Lalande, WISE J0855
 *   Admiral (R10):       2                — Wolf 359 (the terminal voyage)
 */

export const DESTINATIONS = [
  // ════════════ Rank 1 — Cadet ════════════════════════════════════

  {
    id: 'luna-outpost',
    name: 'Luna Outpost',
    subtitle: 'Earth\'s nearest waypoint',
    distanceDays: 4,
    minRank: 1,
    description: 'A small permanent station on the lunar surface. Three-day voyages here are the standard first run — long enough to feel like a voyage, short enough that even a poorly-configured ship returns intact. Most captains begin their careers with a Luna run.',
    poetic: 'The dust hasn\'t moved in three billion years; you bring news.'
  },
  {
    id: 'l4-station',
    name: 'L4 Trojan Station',
    subtitle: 'Earth-Moon Lagrange point',
    distanceDays: 7,
    minRank: 1,
    description: 'A gravity-stable point ahead of the Moon in its orbit, home to a small research and refueling depot. The voyage is technically simple but the destination is a place that exists only because of math — pure orbital mechanics, nothing else holding it in place.',
    poetic: 'A place held in position by the shape of falling.'
  },
  {
    id: 'mars-helios',
    name: 'Mars · Helios Base',
    subtitle: 'The closer of the two worlds',
    distanceDays: 12,
    minRank: 1,
    description: 'The largest permanent settlement on Mars, situated near Hellas Basin. Voyages to Mars vary in duration depending on planetary alignment; the published figure assumes favorable approach. Crews arrive with the sky pinker than they expected.',
    poetic: 'A rust-colored quiet, with weather that lasts for centuries.'
  },

  // ════════════ Rank 2 — Ensign ═══════════════════════════════════

  {
    id: 'vesta',
    name: 'Vesta',
    subtitle: 'Bright asteroid, ancient surface',
    distanceDays: 20,
    minRank: 2,
    description: 'The second-largest object in the asteroid belt and the brightest visible from Earth. Vesta\'s surface bears the scars of a massive impact that scattered fragments across the solar system — many meteorites that fall to Earth originated here.',
    poetic: 'Look at any meteorite museum. Some of those rocks are from here.'
  },
  {
    id: 'ceres',
    name: 'Ceres',
    subtitle: 'Capital of the belt',
    distanceDays: 24,
    minRank: 2,
    description: 'The dwarf planet at the heart of the main asteroid belt — a small icy world that functions as the administrative center for belt mining operations. Voyages here cross more vacuum than most cadets have ever traversed.',
    poetic: 'Smaller than the moon, but the only world for a billion kilometers in any direction.'
  },
  {
    id: 'psyche',
    name: 'Psyche · Metal Bay',
    subtitle: 'Iron-cored asteroid',
    distanceDays: 28,
    minRank: 2,
    description: 'A mining outpost on the metallic asteroid Psyche, unusual among belt objects for being almost entirely exposed iron and nickel. The voyage is the longest most Ensigns have undertaken; the destination feels colder than its temperature explains.',
    poetic: 'A piece of a dead planet\'s core, drifting where no other planet remains.'
  },

  // ════════════ Rank 3 — Lieutenant ═══════════════════════════════

  {
    id: 'jupiter-europa',
    name: 'Europa · Subsurface Station',
    subtitle: 'Beneath the ice',
    distanceDays: 36,
    minRank: 3,
    description: 'A research station drilled through Europa\'s ice shell to the liquid ocean beneath. The voyage takes you to the gas giant system and through Jupiter\'s radiation belts. Crews who visit Europa often report a feeling that what they\'re studying is studying them back.',
    poetic: 'The ocean here is older than Earth and may not be empty.'
  },
  {
    id: 'jupiter-ganymede',
    name: 'Ganymede · Jovian Capital',
    subtitle: 'The largest moon in the system',
    distanceDays: 38,
    minRank: 3,
    description: 'The seat of the Jovian governmental coalition — a sprawling subsurface city beneath Ganymede\'s ancient ice. From here, Jupiter fills nearly a third of the sky, and its rings appear as faint horizontal lines through the observation deck windows.',
    poetic: 'The biggest moon, looking up at the biggest planet, in a city older than its government.'
  },
  {
    id: 'saturn-titan',
    name: 'Titan · Methane Coast',
    subtitle: 'Hydrocarbon shores',
    distanceDays: 44,
    minRank: 3,
    description: 'A research outpost on the shores of one of Titan\'s methane lakes. Titan is the only moon in the system with a substantial atmosphere — orange, hazy, denser than Earth\'s — and the surface has weather, rivers, and seas of liquid methane.',
    poetic: 'It rains here. It rains methane, but it rains.'
  },

  // ════════════ Rank 4 — Commander ════════════════════════════════

  {
    id: 'uranus-miranda',
    name: 'Miranda · The Patchwork Moon',
    subtitle: 'Uranus\'s strangest satellite',
    distanceDays: 60,
    minRank: 4,
    description: 'Miranda looks like a shattered moon reassembled by an unsteady hand — cliffs taller than anything on Earth, surface regions that don\'t match each other, an interior that suggests something violent in its past. Commanders who voyage here describe it as the most alien place a human has ever stood.',
    poetic: 'A moon that doesn\'t look like it was made; it looks like it was put back together.'
  },
  {
    id: 'neptune-triton',
    name: 'Triton · Retrograde Outpost',
    subtitle: 'Neptune\'s captured moon',
    distanceDays: 72,
    minRank: 4,
    description: 'Triton orbits Neptune backwards relative to the planet\'s rotation — a clue that it was captured from the Kuiper Belt long ago. The research station on its surface studies cryovolcanoes that erupt liquid nitrogen and walk an icy surface that is, geologically, recently disturbed.',
    poetic: 'It came from somewhere else, and it still moves like it remembers.'
  },

  // ════════════ Rank 5 — Captain ══════════════════════════════════

  {
    id: 'pluto-charon',
    name: 'Pluto · Charon Crossing',
    subtitle: 'Twin worlds in mutual orbit',
    distanceDays: 86,
    minRank: 5,
    description: 'Pluto and its largest moon Charon orbit a point in empty space between them — they are, in effect, a binary system. The crossing station hangs at the gravitational midpoint and rotates with the pair. Each body appears stationary in the other\'s sky.',
    poetic: 'Two worlds dancing slowly around an emptiness.'
  },
  {
    id: 'sedna-monastery',
    name: 'Sedna · The Long Monastery',
    subtitle: 'Deep trans-Neptunian object',
    distanceDays: 100,
    minRank: 5,
    description: 'A small monastic settlement on Sedna — a dwarf planet on an extraordinarily elliptical orbit that takes it well beyond the Kuiper Belt. Sedna only comes "close" once every 11,400 years. The monastery is studied by sociologists and visited by captains who find that distance changes them.',
    poetic: 'Most years, you cannot see the sun from here. Most lifetimes.'
  },

  // ════════════ Rank 6 — Senior Captain ═══════════════════════════

  {
    id: 'heliopause',
    name: 'Heliopause Station',
    subtitle: 'Edge of the solar wind',
    distanceDays: 108,
    minRank: 6,
    description: 'The boundary where the Sun\'s solar wind gives way to the interstellar medium — the technical edge of the solar system, marked by a slow research platform anchored at the transition zone. Senior Captains who reach the heliopause describe an exact moment of crossing.',
    poetic: 'On one side, the sun\'s breath. On the other, the wind between stars.'
  },
  {
    id: 'voyager-monument',
    name: 'Voyager Memorial',
    subtitle: 'Where the probes still travel',
    distanceDays: 115,
    minRank: 6,
    description: 'A small permanent monument trailing the Voyager 1 probe, which has been traveling outward since 1977. The probe is still moving, still transmitting faintly, still carrying its Golden Record. Captains visit not for the probe but for what it represents — patience as a doctrine.',
    poetic: 'It has been moving away from us for longer than most of us have been alive, and it is not done.'
  },

  // ════════════ Rank 7 — Fleet Captain ════════════════════════════

  {
    id: 'oort-listening',
    name: 'Oort Cloud · Listening Post',
    subtitle: 'Inner Oort comet field',
    distanceDays: 128,
    minRank: 7,
    description: 'A deep-space listening station in the inner Oort Cloud, where the solar system\'s long-period comets originate. The post listens for signals — natural or otherwise — and the silence it has recorded for the last century is itself considered data.',
    poetic: 'The silence here is not empty; it is patient.'
  },
  {
    id: 'proxima-b',
    name: 'Proxima Centauri b',
    subtitle: 'The first star, the first exoworld',
    distanceDays: 140,
    minRank: 7,
    description: 'The closest known exoplanet around the closest star to the Sun. Proxima b orbits a red dwarf in the habitable zone, but its star flares often and irradiates the surface frequently. The research outpost here is shielded and quiet. The first interstellar voyage every captain remembers.',
    poetic: 'The next sun over. Closer than anything else with a name.'
  },
  {
    id: 'alpha-centauri',
    name: 'Alpha Centauri · Crown System',
    subtitle: 'Triple-star system, our nearest neighbors',
    distanceDays: 145,
    minRank: 7,
    description: 'A triple-star system: two sun-like stars in close orbit, and Proxima Centauri in a wide distant orbit. The Crown Station hangs near the inner pair and watches three different sunrises across its observational year. Fleet Captains who visit return with strange light in their photographs.',
    poetic: 'Three suns; one of them ours, by a different name.'
  },

  // ════════════ Rank 8 — Commodore ════════════════════════════════

  {
    id: 'barnards-star',
    name: 'Barnard\'s Star',
    subtitle: 'The fastest-moving star in our sky',
    distanceDays: 197,
    minRank: 8,
    description: 'A red dwarf moving across Earth\'s sky faster than any other star we observe — a fact only visible from the destination itself, where the rest of the galaxy appears to be slowly drifting in the opposite direction. The outpost\'s researchers track its motion and consider implications.',
    poetic: 'Stand still long enough and the rest of the sky moves around you.'
  },
  {
    id: 'luhman-16',
    name: 'Luhman 16 · The Brown Dwarf Pair',
    subtitle: 'Failed stars, close binary',
    distanceDays: 215,
    minRank: 8,
    description: 'A pair of brown dwarfs — objects too small to ignite as stars, too large to be planets — orbiting each other at the third-closest stellar position from the Sun. Their light is faint, infrared, and slowly variable. The research mission here studies what the universe makes when it doesn\'t quite make a star.',
    poetic: 'Two suns that failed to ignite, holding each other up against the dark.'
  },

  // ════════════ Rank 9 — Rear Admiral ═════════════════════════════

  {
    id: 'lalande-21185',
    name: 'Lalande 21185',
    subtitle: 'High-velocity red dwarf',
    distanceDays: 224,
    minRank: 9,
    description: 'A red dwarf in the constellation Ursa Major, moving through our region of the galaxy at unusual speed. The outpost orbits its largest known planet — a super-Earth in an uncertain habitable zone. Rear Admirals who reach Lalande describe the star itself as more visible from the planet than the planet was from Earth.',
    poetic: 'A star traveling somewhere; we don\'t know where; we don\'t need to.'
  },
  {
    id: 'wise-0855',
    name: 'WISE 0855−0714',
    subtitle: 'The coldest known sub-stellar object',
    distanceDays: 248,
    minRank: 9,
    description: 'A sub-brown-dwarf — colder than any known star, colder even than Earth\'s arctic — discovered by the WISE infrared survey. It may have water-ice clouds in its upper atmosphere, the only known sub-stellar object cold enough to. The deep-mission station here observes the only place we have ever found in the universe with frozen weather.',
    poetic: 'Cold enough to snow, alone enough that no one is watching it.'
  },

  // ════════════ Rank 10 — Admiral ═════════════════════════════════

  {
    id: 'ross-128b',
    name: 'Ross 128 b',
    subtitle: 'Quiet red dwarf, temperate world',
    distanceDays: 250,
    minRank: 10,
    description: 'An Earth-mass exoplanet orbiting a quiet red dwarf, in what may be the habitable zone. Unlike most red dwarf systems, Ross 128 flares rarely, making it a candidate for stable surface conditions. The research mission here is decades old. The reports are patient.',
    poetic: 'A small sun, a small world, a small chance. The first three in a row we\'ve found.'
  },
  {
    id: 'wolf-359',
    name: 'Wolf 359',
    subtitle: 'The terminal voyage',
    distanceDays: 260,
    minRank: 10,
    description: 'A faint red dwarf in the constellation Leo — the fifth-closest known star to the Sun and the practical limit of voyage range with current hulls. There is no station here, no outpost, no settlement. The Admiral voyage to Wolf 359 is a journey to the boundary itself: a quiet star, a quiet system, a confirmation that you have reached as far as the fleet currently goes.',
    poetic: 'Past here, the stars are known but unreached. You have come to the edge of the map.'
  }
]

export function destinationById(id) {
  return DESTINATIONS.find(d => d.id === id)
}

/**
 * Visibility for the destination picker — same window logic as ships and ranks.
 * Returns all destinations the captain can reach at their current rank, plus
 * the next 2 locked destinations as foreshadowing, plus a count of further
 * hidden destinations.
 */
export function visibleDestinations(captainRank) {
  const reachable = DESTINATIONS.filter(d => d.minRank <= captainRank)
  const lockedAhead = DESTINATIONS
    .filter(d => d.minRank > captainRank)
    .sort((a, b) => a.minRank - b.minRank)
    .slice(0, 2)
  const hiddenCount = DESTINATIONS.length - reachable.length - lockedAhead.length
  return { reachable, locked: lockedAhead, hiddenCount }
}