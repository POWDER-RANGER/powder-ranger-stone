/**
 * Phonology module: phoneme inventories and weighted sampling.
 * 
 * @module core/phonology
 */

// Frozen phoneme inventories (single code points only for v1)
const CONSONANTS = Object.freeze({
  stops: ['p', 'b', 't', 'd', 'k', 'g'],
  fricatives: ['f', 'v', 's', 'z', 'ʃ', 'ʒ', 'h'],
  nasals: ['m', 'n', 'ŋ'],
  liquids: ['l', 'r'],
  glides: ['j', 'w'],
});

const VOWELS = Object.freeze({
  front: ['i', 'e', 'æ'],
  central: ['ɨ', 'ə', 'ɐ'],
  back: ['u', 'o', 'ɑ'],
});

// Flattened pools with weights (higher = more frequent)
const CONSONANT_POOL = Object.freeze([
  ...CONSONANTS.stops.flatMap(c => Array(10).fill(c)),
  ...CONSONANTS.fricatives.flatMap(c => Array(8).fill(c)),
  ...CONSONANTS.nasals.flatMap(c => Array(6).fill(c)),
  ...CONSONANTS.liquids.flatMap(c => Array(7).fill(c)),
  ...CONSONANTS.glides.flatMap(c => Array(5).fill(c)),
]);

const VOWEL_POOL = Object.freeze([
  ...VOWELS.front.flatMap(v => Array(12).fill(v)),
  ...VOWELS.central.flatMap(v => Array(8).fill(v)),
  ...VOWELS.back.flatMap(v => Array(10).fill(v)),
]);

/**
 * Efraimidis-Spirakis weighted sampling without replacement.
 * @param {Mulberry32} rng - The PRNG instance.
 * @param {Array} pool - The pool to sample from.
 * @param {number} n - Number of samples.
 * @returns {Array} - The sampled elements.
 */
function weightedSample(rng, pool, n) {
  if (n > pool.length) {
    throw new Error(`Cannot sample ${n} from pool of size ${pool.length}`);
  }
  
  // Assign random keys to each element
  const indexedPool = pool.map((item, index) => ({
    item,
    key: Math.pow(rng.nextFloat(), 1 / (n + 1)),
  }));
  
  // Sort by key (descending) and take top n
  indexedPool.sort((a, b) => b.key - a.key);
  return indexedPool.slice(0, n).map(({ item }) => item);
}

/**
 * Generate phonology tables for the language.
 * @param {Mulberry32} rng - The PRNG instance.
 * @returns {Object} - Phonology tables: { consonants, vowels, allPhonemes }.
 */
function generatePhonology(rng) {
  // Sample consonants and vowels (all available for v1)
  const consonants = [...new Set(CONSONANT_POOL)];
  const vowels = [...new Set(VOWEL_POOL)];
  const allPhonemes = [...consonants, ...vowels];
  
  return {
    consonants: Object.freeze(consonants),
    vowels: Object.freeze(vowels),
    allPhonemes: Object.freeze(allPhonemes),
  };
}

export { CONSONANTS, VOWELS, CONSONANT_POOL, VOWEL_POOL, weightedSample, generatePhonology };
