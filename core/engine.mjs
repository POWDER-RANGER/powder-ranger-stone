/**
 * Engine module: orchestrates language generation from a seed.
 * 
 * @module core/engine
 */

import { Mulberry32, hashSeed } from './prng.mjs';
import { generatePhonology } from './phonology.mjs';
import { generateLexicon } from './lexicon.mjs';
import { MARKERS } from './morphology.mjs';

// Canonical seed for the language
const CANONICAL_SEED = 3098546205;

/**
 * Generate a deterministic language from a seed.
 * @param {number|string} seed - The seed for the language.
 * @param {Object} [opts] - Options.
 * @param {boolean} [opts.trace=false] - If true, enables PRNG trace logging.
 * @returns {Object} - The generated language: { phonology, lexicon, markers, seed, rngTrace? }.
 */
function generateLanguage(seed, { trace = false } = {}) {
  const hashedSeed = hashSeed(seed);
  const rng = new Mulberry32(hashedSeed, { trace });
  
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  const language = {
    seed: hashedSeed,
    phonology,
    lexicon,
    markers: MARKERS,
  };
  
  if (trace) {
    language.rngTrace = rng.log;
  }
  
  return Object.freeze(language);
}

export { CANONICAL_SEED, generateLanguage };
