/**
 * Core module: public API surface.
 * 
 * @module core/index
 */

import { CANONICAL_SEED, generateLanguage } from './engine.mjs';
import { encode, decode, UNKNOWN_POLICY } from './codec.mjs';
import { runify, derune } from './orthography.mjs';

// Metadata about the Stone language
const STONE_METADATA = Object.freeze({
  name: 'Powder-Ranger Stone',
  version: '6.0.0',
  canonicalSeed: CANONICAL_SEED,
  description: 'A deterministic, reversible procedural conlang with runic orthography.',
});

export {
  CANONICAL_SEED,
  generateLanguage,
  encode,
  decode,
  UNKNOWN_POLICY,
  runify,
  derune,
  STONE_METADATA,
};
