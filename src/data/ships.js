export const SHIPS = [
  {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'A first vessel.',
    rankRequired: 1,    // Cadet
    maxRangeDays: 14,
    velocity: 1.0,
    bonus: null,
    description: 'A small, dependable ship for short voyages. Built for first crossings — modest range, simple systems, forgiving handling. Every captain begins here.'
  },
  {
    id: 'frigate',
    name: 'Frigate',
    tagline: 'Workhorse of the inner systems.',
    rankRequired: 2,    // Ensign
    maxRangeDays: 30,
    velocity: 1.1,
    bonus: 'engineering',
    description: 'A stout dual-engine vessel that handles longer crossings with patience. Cargo bays for substantial provisions; reinforced hull for casual debris. The standard ship of the inner systems.'
  },
  {
    id: 'science-vessel',
    name: 'Science Vessel',
    tagline: 'Equipped to learn.',
    rankRequired: 3,    // Lieutenant
    maxRangeDays: 45,
    velocity: 1.2,
    bonus: 'research',
    description: 'Built around its sensor array. Slower in atmosphere but observation-rated for deep voyages. Lieutenants commanding science vessels build the catalogs everyone else uses.'
  },
  {
    id: 'cutter',
    name: 'Cutter',
    tagline: 'Fast, sharp, focused.',
    rankRequired: 4,    // Commander
    maxRangeDays: 60,
    velocity: 1.4,
    bonus: 'navigation',
    description: 'Sleek and aggressive, with high velocity for medium-range crossings. Favored by Commanders who value covering distance over carrying mass. The cutter rewards captains who plan ahead.'
  },
  {
    id: 'corvette',
    name: 'Corvette',
    tagline: 'A captain\'s first command.',
    rankRequired: 5,    // Captain
    maxRangeDays: 70,
    velocity: 1.5,
    bonus: null,
    description: 'A versatile mid-tier vessel — neither specialist nor generalist, but capable across all categories. The corvette is what a captain receives upon their first formal commission. Good for crews still finding their identity.'
  },
  {
    id: 'long-hauler',
    name: 'Long-Hauler',
    tagline: 'Patience as a system.',
    rankRequired: 6,    // Senior Captain
    maxRangeDays: 75,
    velocity: 1.5,
    bonus: 'life-support',
    description: 'A heavy ship built for endurance. Generous quarters, redundant life support, food stocks for the long dark. The long-hauler is the ship for crews who have learned that voyages take time.'
  },
  {
    id: 'liner',
    name: 'Star Liner',
    tagline: 'Comfortable across the void.',
    rankRequired: 7,    // Fleet Captain
    maxRangeDays: 85,
    velocity: 1.6,
    bonus: 'life-support',
    description: 'Crew accommodations rivaling any inner-system station. The liner moves crews and dignitaries across long distances in conditions that don\'t feel like sacrifice. Trusted only to Fleet Captains.'
  },
  {
    id: 'pathfinder',
    name: 'Pathfinder',
    tagline: 'A voyage in itself.',
    rankRequired: 8,    // Commodore
    maxRangeDays: 90,
    velocity: 1.7,
    bonus: null,
    description: 'A deep-range vessel built around accumulated lessons. Pathfinders carry equipment for every contingency — extended life support, redundant comms, scientific suite, defensive measures. The Commodore\'s ship.'
  },
  {
    id: 'voyager',
    name: 'Voyager',
    tagline: 'Beyond the charts.',
    rankRequired: 9,    // Rear Admiral
    maxRangeDays: 110,
    velocity: 1.8,
    bonus: null,
    description: 'Built for the spaces past where most fleets go. The voyager is rated for crossings that make the long-hauler\'s endurance look conservative. Rear Admirals receive these ships when their service record demands a destination no one else has reached.'
  },
  {
    id: 'flagship',
    name: 'Flagship',
    tagline: 'The captain\'s mark, made vessel.',
    rankRequired: 10,   // Admiral
    maxRangeDays: 130,
    velocity: 2.0,
    bonus: null,
    description: 'The ship of an Admiral. Range and velocity beyond any other vessel; bonuses across all four ship systems. The flagship is less a transport and more a statement — a captain has reached the rank where the destination is no longer the limit.'
  }
]

export function shipById(id) {
  return SHIPS.find(s => s.id === id)
}

export function shipsAvailable(rank) {
  return SHIPS.filter(s => s.rankRequired <= rank)
}

export function visibleShips(captainRank) {
  const sorted = [...SHIPS].sort((a, b) => a.captainRank - b.captainRank)
  const unlocked = sorted.filter(d => d.rankRequired <= captainRank)
  const locked    = sorted.filter(d => d.rankRequired >  captainRank).slice(0, 2)
  const hiddenCount = sorted.length - unlocked.length - locked.length
  return { unlocked, locked, hiddenCount }
}