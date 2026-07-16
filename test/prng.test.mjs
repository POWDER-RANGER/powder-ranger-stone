/**
 * Tests for core/prng.mjs: Mulberry32 PRNG.
 * 
 * @module test/prng.test
 */

import { Mulberry32, hashSeed } from '../core/prng.mjs';
import assert from 'node:assert';

// --- Determinism ---
Deno.test('Mulberry32: same seed produces same sequence', () => {
  const seed = 3098546205;
  const rng1 = new Mulberry32(seed);
  const rng2 = new Mulberry32(seed);
  
  for (let i = 0; i < 100; i++) {
    assert.strictEqual(rng1.next(), rng2.next());
  }
});

// --- Float Seed Collision Fix ---
Deno.test('hashSeed: float seeds do not collide (3.14159 vs 3.99999)', () => {
  const seed1 = hashSeed(3.14159);
  const seed2 = hashSeed(3.99999);
  assert.notStrictEqual(seed1, seed2);
});

Deno.test('hashSeed: integer seeds are passed through as uint32', () => {
  const seed = 3098546205;
  assert.strictEqual(hashSeed(seed), seed >>> 0);
});

Deno.test('hashSeed: string seeds are deterministic', () => {
  const seed = 'test-seed';
  assert.strictEqual(hashSeed(seed), hashSeed(seed));
});

// --- Trace ---
Deno.test('Mulberry32: trace logs all drawn values', () => {
  const rng = new Mulberry32(3098546205, { trace: true });
  rng.next();
  rng.next();
  assert.strictEqual(rng.log.length, 2);
});

// --- No Default Seed ---
Deno.test('Mulberry32: throws on missing seed', () => {
  assert.throws(() => new Mulberry32(), /requires a seed/);
});

// --- Range and Distribution ---
Deno.test('Mulberry32: next() returns uint32', () => {
  const rng = new Mulberry32(3098546205);
  for (let i = 0; i < 1000; i++) {
    const val = rng.next();
    assert.ok(val >= 0 && val < 0x100000000);
  }
});

Deno.test('Mulberry32: nextFloat() returns [0, 1)', () => {
  const rng = new Mulberry32(3098546205);
  for (let i = 0; i < 1000; i++) {
    const val = rng.nextFloat();
    assert.ok(val >= 0 && val < 1);
  }
});

Deno.test('Mulberry32: nextInt(min, max) returns [min, max)', () => {
  const rng = new Mulberry32(3098546205);
  const min = 5;
  const max = 10;
  for (let i = 0; i < 1000; i++) {
    const val = rng.nextInt(min, max);
    assert.ok(val >= min && val < max);
  }
});

// --- Sampling ---
Deno.test('Mulberry32: sample() returns an element from the array', () => {
  const rng = new Mulberry32(3098546205);
  const arr = ['a', 'b', 'c'];
  for (let i = 0; i < 100; i++) {
    const val = rng.sample(arr);
    assert.ok(arr.includes(val));
  }
});

// --- Shuffling ---
Deno.test('Mulberry32: shuffle() permutes the array', () => {
  const rng = new Mulberry32(3098546205);
  const arr = [1, 2, 3, 4, 5];
  const original = [...arr];
  rng.shuffle(arr);
  assert.deepStrictEqual(arr.sort(), original.sort());
  assert.notDeepStrictEqual(arr, original);
});
