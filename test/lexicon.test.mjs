/**
 * Tests for core/lexicon.mjs: Lexicon generation and gloss-word mapping.
 * 
 * @module test/lexicon.test
 */

import { Mulberry32 } from '../core/prng.mjs';
import { generatePhonology } from '../core/phonology.mjs';
import { CORE_CONCEPTS, generateLexicon } from '../core/lexicon.mjs';
import assert from 'node:assert';

// --- Core Concepts ---
Deno.test('CORE_CONCEPTS: contains expected glosses', () => {
  assert.ok(CORE_CONCEPTS.includes('I'));
  assert.ok(CORE_CONCEPTS.includes('you'));
  assert.ok(CORE_CONCEPTS.includes('eat'));
  assert.ok(CORE_CONCEPTS.includes('run'));
});

Deno.test('CORE_CONCEPTS: is frozen', () => {
  assert.ok(Object.isFrozen(CORE_CONCEPTS));
});

// --- Lexicon Generation ---
Deno.test('generateLexicon: returns glossToWord and wordToGloss maps', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  assert.ok(lexicon.glossToWord instanceof Map);
  assert.ok(lexicon.wordToGloss instanceof Map);
});

Deno.test('generateLexicon: maps are frozen', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  assert.ok(Object.isFrozen(lexicon.glossToWord));
  assert.ok(Object.isFrozen(lexicon.wordToGloss));
});

Deno.test('generateLexicon: all core concepts are mapped', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  for (const gloss of CORE_CONCEPTS) {
    assert.ok(lexicon.glossToWord.has(gloss), `Missing gloss: ${gloss}`);
  }
});

Deno.test('generateLexicon: all words are unique', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  const words = Array.from(lexicon.glossToWord.values());
  const uniqueWords = new Set(words);
  assert.strictEqual(uniqueWords.size, words.length);
});

Deno.test('generateLexicon: wordToGloss is the inverse of glossToWord', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  for (const [gloss, word] of lexicon.glossToWord) {
    assert.strictEqual(lexicon.wordToGloss.get(word), gloss);
  }
});

// --- Determinism ---
Deno.test('generateLexicon: same seed produces same lexicon', () => {
  const seed = 3098546205;
  const rng1 = new Mulberry32(seed);
  const phonology1 = generatePhonology(rng1);
  const lexicon1 = generateLexicon(rng1, phonology1);
  
  const rng2 = new Mulberry32(seed);
  const phonology2 = generatePhonology(rng2);
  const lexicon2 = generateLexicon(rng2, phonology2);
  
  for (const gloss of CORE_CONCEPTS) {
    assert.strictEqual(
      lexicon1.glossToWord.get(gloss),
      lexicon2.glossToWord.get(gloss)
    );
  }
});

// --- Word Generation ---
Deno.test('generateLexicon: words are non-empty', () => {
  const rng = new Mulberry32(3098546205);
  const phonology = generatePhonology(rng);
  const lexicon = generateLexicon(rng, phonology);
  
  for (const word of lexicon.glossToWord.values()) {
    assert.ok(word.length > 0, `Empty word generated for some gloss`);
  }
});

// --- Collision Guard ---
Deno.test('generateLexicon: throws on too many collision attempts', () => {
  // Mock a PRNG that always returns the same value to force collisions
  class MockRNG {
    constructor() {}
    nextFloat() { return 0.5; }
    sample(arr) { return arr[0]; }
  }
  
  const rng = new MockRNG();
  const phonology = generatePhonology(new Mulberry32(3098546205));
  
  assert.throws(() => generateLexicon(rng, phonology), /Failed to generate unique word/);
});
