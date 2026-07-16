/**
 * Tests for core/phonology.mjs: Phoneme inventories and sampling.
 * 
 * @module test/phonology.test
 */

import { Mulberry32 } from '../core/prng.mjs';
import { 
  CONSONANTS, 
  VOWELS, 
  CONSONANT_POOL, 
  VOWEL_POOL, 
  weightedSample, 
  generatePhonology 
} from '../core/phonology.mjs';
import assert from 'node:assert';

// --- Phoneme Inventories ---
Deno.test('CONSONANTS: contains expected categories', () => {
  assert.ok('stops' in CONSONANTS);
  assert.ok('fricatives' in CONSONANTS);
  assert.ok('nasals' in CONSONANTS);
  assert.ok('liquids' in CONSONANTS);
  assert.ok('glides' in CONSONANTS);
});

Deno.test('VOWELS: contains expected categories', () => {
  assert.ok('front' in VOWELS);
  assert.ok('central' in VOWELS);
  assert.ok('back' in VOWELS);
});

Deno.test('CONSONANT_POOL and VOWEL_POOL are non-empty', () => {
  assert.ok(CONSONANT_POOL.length > 0);
  assert.ok(VOWEL_POOL.length > 0);
});

// --- Weighted Sampling ---
Deno.test('weightedSample: returns correct number of samples', () => {
  const rng = new Mulberry32(3098546205);
  const pool = ['a', 'b', 'c', 'd', 'e'];
  const n = 3;
  const samples = weightedSample(rng, pool, n);
  assert.strictEqual(samples.length, n);
});

Deno.test('weightedSample: throws if n > pool length', () => {
  const rng = new Mulberry32(3098546205);
  const pool = ['a', 'b', 'c'];
  assert.throws(() => weightedSample(rng, pool, 5), /Cannot sample/);
});

Deno.test('weightedSample: samples are from the pool', () => {
  const rng = new Mulberry32(3098546205);
  const pool = ['a', 'b', 'c', 'd', 'e'];
  const samples = weightedSample(rng, pool, 3);
  for (const sample of samples) {
    assert.ok(pool.includes(sample));
  }
});

Deno.test('weightedSample: no duplicates in samples', () => {
  const rng = new Mulberry32(3098546205);
  const pool = ['a', 'b', 'c', 'd', 'e'];
  const samples = weightedSample(rng, pool, 3);
  const uniqueSamples = new Set(samples);
  assert.strictEqual(uniqueSamples.size, samples.length);
});

// --- Phonology Generation ---
Deno.test('generatePhonology: returns consonants, vowels, and allPhonemes', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  assert.ok('consonants' in phonology);
  assert.ok('vowels' in phonology);
  assert.ok('allPhonemes' in phonology);
});

Deno.test('generatePhonology: allPhonemes includes consonants and vowels', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  for (const c of phonology.consonants) {
    assert.ok(phonology.allPhonemes.includes(c));
  }
  for (const v of phonology.vowels) {
    assert.ok(phonology.allPhonemes.includes(v));
  }
});

Deno.test('generatePhonology: output is frozen', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  assert.ok(Object.isFrozen(phonology.consonants));
  assert.ok(Object.isFrozen(phonology.vowels));
  assert.ok(Object.isFrozen(phonology.allPhonemes));
});
