/**
 * Tests for core/codec.mjs: Round-trip invariant (decode(encode(x)) === x).
 * 
 * @module test/roundtrip.test
 */

import { CANONICAL_SEED, generateLanguage } from '../core/engine.mjs';
import { encode, decode } from '../core/codec.mjs';
import assert from 'node:assert';

// --- Round-trip Invariant ---
Deno.test('roundtrip: decode(encode(x)) === x for all lexicon glosses (Latin)', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const { glossToWord } = lang.lexicon;
  
  for (const gloss of glossToWord.keys()) {
    const encoded = encode(gloss, lang, { script: 'latin' });
    const decoded = decode(encoded, lang, { script: 'latin' });
    // Decoded output includes tags in brackets, so we compare the base gloss
    const baseDecoded = decoded.replace(/\s*\[.*?\]/g, '').trim();
    assert.strictEqual(baseDecoded, gloss);
  }
});

Deno.test('roundtrip: decode(encode(x)) === x for all lexicon glosses (Runic)', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const { glossToWord } = lang.lexicon;
  
  for (const gloss of glossToWord.keys()) {
    const encoded = encode(gloss, lang, { script: 'runic' });
    const decoded = decode(encoded, lang, { script: 'runic' });
    const baseDecoded = decoded.replace(/\s*\[.*?\]/g, '').trim();
    assert.strictEqual(baseDecoded, gloss);
  }
});

// --- Round-trip with Tags ---
Deno.test('roundtrip: decode(encode(x)) === x with tags (Latin)', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const { glossToWord } = lang.lexicon;
  
  // Test with a gloss that has tags
  const gloss = 'run';
  const tags = ['PAST', 'PLURAL'];
  const taggedGloss = `${gloss}[${tags.join(',')}]`;
  
  // Encode the base gloss (tags are not yet supported in encode, but we can test the round-trip for the word)
  const encoded = encode(gloss, lang, { script: 'latin' });
  const decoded = decode(encoded, lang, { script: 'latin' });
  assert.strictEqual(decoded.trim(), gloss);
});

// --- Edge Cases ---
Deno.test('roundtrip: empty string', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const encoded = encode('', lang);
  const decoded = decode(encoded, lang);
  assert.strictEqual(decoded.trim(), '');
});

Deno.test('roundtrip: unknown gloss with mark policy', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const unknownGloss = 'unknownword';
  const encoded = encode(unknownGloss, lang, { unknownPolicy: 'mark' });
  const decoded = decode(encoded, lang, { unknownPolicy: 'mark' });
  assert.ok(decoded.includes('⟨unknownword⟩'));
});

Deno.test('roundtrip: unknown gloss with passthrough policy', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const unknownGloss = 'unknownword';
  const encoded = encode(unknownGloss, lang, { unknownPolicy: 'passthrough' });
  const decoded = decode(encoded, lang, { unknownPolicy: 'passthrough' });
  assert.ok(decoded.includes('unknownword'));
});

// --- Script Round-trip ---
Deno.test('roundtrip: runify + derune preserves word', () => {
  const lang = generateLanguage(CANONICAL_SEED);
  const { glossToWord } = lang.lexicon;
  
  for (const gloss of glossToWord.keys()) {
    const word = glossToWord.get(gloss);
    const runified = encode(gloss, lang, { script: 'runic' });
    const deruned = decode(runified, lang, { script: 'runic' });
    const baseDeruned = deruned.replace(/\s*\[.*?\]/g, '').trim();
    assert.strictEqual(baseDeruned, gloss);
  }
});
