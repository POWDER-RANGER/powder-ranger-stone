/**
 * Tests for core/engine.mjs: Language generation orchestrator.
 * 
 * @module test/engine.test
 */

import { CANONICAL_SEED, generateLanguage } from '../core/engine.mjs';
import assert from 'node:assert';

// --- Canonical Seed ---
Deno.test('CANONICAL_SEED: is 3098546205', () => {
  assert.strictEqual(CANONICAL_SEED, 3098546205);
});

// --- Language Generation ---
Deno.test('generateLanguage: returns frozen object', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  assert.ok(Object.isFrozen(lang));
});

Deno.test('generateLanguage: contains required fields', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  assert.ok('seed' in lang);
  assert.ok('phonology' in lang);
  assert.ok('lexicon' in lang);
  assert.ok('markers' in lang);
});

Deno.test('generateLanguage: seed is hashed', () => {
  const seed = 3098546205;
  const lang = generateLanguage(seed);
  assert.strictEqual(lang.seed, seed >>> 0);
});

Deno.test('generateLanguage: same seed produces same language', () => {
  const seed = 3098546205;
  const lang1 = generateLanguage(seed);
  const lang2 = generateLanguage(seed);
  
  assert.strictEqual(lang1.seed, lang2.seed);
  assert.deepStrictEqual(
    Array.from(lang1.lexicon.glossToWord.entries()),
    Array.from(lang2.lexicon.glossToWord.entries())
  );
});

Deno.test('generateLanguage: different seeds produce different languages', () => {
  const lang1 = generateLanguage(3098546205);
  const lang2 = generateLanguage(123456789);
  
  assert.notStrictEqual(lang1.seed, lang2.seed);
});

// --- Trace ---
Deno.test('generateLanguage: trace option logs PRNG draws', () => {
  const lang = generateLanguage(CANONICAL_SEED, { trace: true });
  assert.ok('rngTrace' in lang);
  assert.ok(Array.isArray(lang.rngTrace));
  assert.ok(lang.rngTrace.length > 0);
});

Deno.test('generateLanguage: no trace by default', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  assert.ok(!('rngTrace' in lang));
});

// --- Phonology and Lexicon ---
Deno.test('generateLanguage: phonology is generated', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  assert.ok('consonants' in lang.phonology);
  assert.ok('vowels' in lang.phonology);
  assert.ok('allPhonemes' in lang.phonology);
});

Deno.test('generateLanguage: lexicon is generated', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  assert.ok(lang.lexicon.glossToWord instanceof Map);
  assert.ok(lang.lexicon.wordToGloss instanceof Map);
});

// --- Markers ---
Deno.test('generateLanguage: markers are included', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  assert.ok('PAST' in lang.markers);
  assert.ok('PLURAL' in lang.markers);
});
