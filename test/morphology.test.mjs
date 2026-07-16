/**
 * Tests for core/morphology.mjs: Affix parsing and application.
 * 
 * @module test/morphology.test
 */

import { MARKERS, applyAffixes, stripAffixes } from '../core/morphology.mjs';
import assert from 'node:assert';

// --- Affix Table ---
Deno.test('MARKERS: contains expected tags', () => {
  assert.ok('PAST' in MARKERS);
  assert.ok('PLURAL' in MARKERS);
  assert.ok('FIRST' in MARKERS);
  assert.ok('NEGATIVE' in MARKERS);
});

Deno.test('MARKERS: affixes are non-empty for non-empty tags', () => {
  for (const [tag, marker] of Object.entries(MARKERS)) {
    if (tag !== 'SINGULAR') {
      assert.ok(marker.affix.length > 0, `Affix for ${tag} is empty`);
    }
  }
});

// --- applyAffixes ---
Deno.test('applyAffixes: applies suffixes correctly', () => {
  const stem = 'run';
  const tags = ['PAST', 'PLURAL'];
  const result = applyAffixes(stem, tags);
  assert.strictEqual(result, 'runed' + 's');
});

Deno.test('applyAffixes: applies prefixes correctly', () => {
  const stem = 'run';
  const tags = ['FIRST', 'NEGATIVE'];
  const result = applyAffixes(stem, tags);
  assert.strictEqual(result, 'ne' + 'im' + 'run');
});

Deno.test('applyAffixes: applies mixed prefixes and suffixes', () => {
  const stem = 'run';
  const tags = ['FIRST', 'PAST', 'PLURAL'];
  const result = applyAffixes(stem, tags);
  assert.strictEqual(result, 'im' + 'run' + 'ed' + 's');
});

Deno.test('applyAffixes: ignores unknown tags', () => {
  const stem = 'run';
  const tags = ['PAST', 'UNKNOWN_TAG'];
  const result = applyAffixes(stem, tags);
  assert.strictEqual(result, 'runed');
});

// --- stripAffixes ---
Deno.test('stripAffixes: strips suffixes correctly (longest first)', () => {
  const word = 'runned';
  const result = stripAffixes(word);
  assert.strictEqual(result.stem, 'run');
  assert.deepStrictEqual(result.tags, ['PAST']);
});

Deno.test('stripAffixes: strips prefixes correctly (longest first)', () => {
  const word = 'neimrun';
  const result = stripAffixes(word);
  assert.strictEqual(result.stem, 'run');
  assert.deepStrictEqual(result.tags.sort(), ['FIRST', 'NEGATIVE'].sort());
});

Deno.test('stripAffixes: strips mixed prefixes and suffixes', () => {
  const word = 'imruned';
  const result = stripAffixes(word);
  assert.strictEqual(result.stem, 'run');
  assert.deepStrictEqual(result.tags, ['FIRST', 'PAST']);
});

Deno.test('stripAffixes: handles stacked suffixes (longest first)', () => {
  // 's' (PLURAL) is shorter than 'ed' (PAST), but 'ed' should be stripped first
  const word = 'runed' + 's';
  const result = stripAffixes(word);
  assert.strictEqual(result.stem, 'run');
  assert.deepStrictEqual(result.tags.sort(), ['PAST', 'PLURAL'].sort());
});

Deno.test('stripAffixes: handles boundary collisions', () => {
  // Ensure 's' (PLURAL) is not stripped from a stem ending in 's'
  const word = 'bus';
  const result = stripAffixes(word);
  assert.strictEqual(result.stem, 'bus');
  assert.deepStrictEqual(result.tags, []);
});

Deno.test('stripAffixes: handles empty affixes (e.g., SINGULAR)', () => {
  const word = 'run';
  const result = stripAffixes(word);
  assert.strictEqual(result.stem, 'run');
  assert.deepStrictEqual(result.tags, []);
});

// --- Round-trip: apply then strip ---
Deno.test('applyAffixes + stripAffixes: round-trip for simple case', () => {
  const stem = 'run';
  const tags = ['PAST', 'PLURAL'];
  const inflected = applyAffixes(stem, tags);
  const result = stripAffixes(inflected);
  assert.strictEqual(result.stem, stem);
  assert.deepStrictEqual(result.tags.sort(), tags.sort());
});

Deno.test('applyAffixes + stripAffixes: round-trip for mixed prefixes/suffixes', () => {
  const stem = 'run';
  const tags = ['FIRST', 'PAST', 'PLURAL', 'NEGATIVE'];
  const inflected = applyAffixes(stem, tags);
  const result = stripAffixes(inflected);
  assert.strictEqual(result.stem, stem);
  assert.deepStrictEqual(result.tags.sort(), tags.sort());
});

// --- Edge Cases ---
Deno.test('stripAffixes: empty word returns empty stem and tags', () => {
  const result = stripAffixes('');
  assert.strictEqual(result.stem, '');
  assert.deepStrictEqual(result.tags, []);
});

Deno.test('applyAffixes: empty stem returns empty word', () => {
  const result = applyAffixes('', ['PAST']);
  assert.strictEqual(result, 'ed');
});
