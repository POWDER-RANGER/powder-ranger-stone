/**
 * Tests for core/orthography.mjs: Bijective Latin ↔ runic mapping.
 * 
 * @module test/orthography.test
 */

import { LATIN_TO_RUNE, RUNE_TO_LATIN, runify, derune } from '../core/orthography.mjs';
import assert from 'node:assert';

// --- Mapping Tables ---
Deno.test('LATIN_TO_RUNE: contains expected mappings', () => {
  assert.strictEqual(LATIN_TO_RUNE['p'], 'ᚾ');
  assert.strictEqual(LATIN_TO_RUNE['k'], 'ᚲ');
  assert.strictEqual(LATIN_TO_RUNE['i'], 'ᛁ');
});

Deno.test('RUNE_TO_LATIN: is the inverse of LATIN_TO_RUNE', () => {
  for (const [lat, rune] of Object.entries(LATIN_TO_RUNE)) {
    assert.strictEqual(RUNE_TO_LATIN[rune], lat);
  }
});

Deno.test('LATIN_TO_RUNE and RUNE_TO_LATIN are frozen', () => {
  assert.ok(Object.isFrozen(LATIN_TO_RUNE));
  assert.ok(Object.isFrozen(RUNE_TO_LATIN));
});

// --- runify ---
Deno.test('runify: converts Latin to runic', () => {
  const latin = 'pk';
  const expected = LATIN_TO_RUNE['p'] + LATIN_TO_RUNE['k'];
  assert.strictEqual(runify(latin), expected);
});

Deno.test('runify: passthroughs unknown characters', () => {
  const latin = 'p x k';
  const result = runify(latin);
  assert.strictEqual(result, LATIN_TO_RUNE['p'] + ' x ' + LATIN_TO_RUNE['k']);
});

Deno.test('runify: handles empty string', () => {
  assert.strictEqual(runify(''), '');
});

// --- derune ---
Deno.test('derune: converts runic to Latin', () => {
  const runic = LATIN_TO_RUNE['p'] + LATIN_TO_RUNE['k'];
  const expected = 'pk';
  assert.strictEqual(derune(runic), expected);
});

Deno.test('derune: passthroughs unknown characters', () => {
  const runic = LATIN_TO_RUNE['p'] + 'ᛌ' + LATIN_TO_RUNE['k'];
  const result = derune(runic);
  assert.strictEqual(result, 'pᛌk');
});

Deno.test('derune: handles empty string', () => {
  assert.strictEqual(derune(''), '');
});

// --- Bijection ---
Deno.test('runify + derune: round-trip for all Latin phonemes', () => {
  for (const [lat, rune] of Object.entries(LATIN_TO_RUNE)) {
    assert.strictEqual(derune(runify(lat)), lat);
  }
});

Deno.test('derune + runify: round-trip for all runes', () => {
  for (const [lat, rune] of Object.entries(LATIN_TO_RUNE)) {
    assert.strictEqual(runify(derune(rune)), rune);
  }
});

// --- Full Words ---
Deno.test('runify + derune: round-trip for full words', () => {
  const words = ['pak', 'tik', 'mik', 'run', 'sing'];
  for (const word of words) {
    assert.strictEqual(derune(runify(word)), word);
  }
});

// --- Edge Cases ---
Deno.test('runify: handles mixed case (passthrough uppercase)', () => {
  const latin = 'P';
  const result = runify(latin);
  assert.strictEqual(result, 'P'); // Uppercase not in LATIN_TO_RUNE
});

Deno.test('derune: handles mixed case (passthrough uppercase)', () => {
  const runic = 'P';
  const result = derune(runic);
  assert.strictEqual(result, 'P'); // Uppercase not in RUNE_TO_LATIN
});
