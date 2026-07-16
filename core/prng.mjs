/**
 * Mulberry32 PRNG with float-safe seed hashing and trace support.
 * 
 * @module core/prng
 */

/**
 * Hashes a seed to a uint32.
 * - Integers: passed through as-is (coerced to uint32).
 * - Floats: IEEE-754 bit hash (avoids collisions like 3.14159 vs 3.99999).
 * - Strings: char-code accumulator.
 * @param {number|string} input - The seed input.
 * @returns {number} - A uint32 hash.
 */
function hashSeed(input) {
  if (typeof input === 'number') {
    if (Number.isInteger(input)) {
      return input >>> 0;
    } else {
      // IEEE-754 bit hash for floats
      const buffer = new Uint8Array(new Float64Array([input]).buffer);
      let hash = 0;
      for (let i = 0; i < buffer.length; i++) {
        hash = (hash * 31 + buffer[i]) >>> 0;
      }
      return hash;
    }
  } else if (typeof input === 'string') {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    }
    return hash;
  }
  throw new Error(`Unsupported seed type: ${typeof input}`);
}

/**
 * Mulberry32 PRNG with optional trace logging.
 * @class
 */
class Mulberry32 {
  /**
   * @param {number} seed - A uint32 seed (required).
   * @param {Object} [opts] - Options.
   * @param {boolean} [opts.trace=false] - If true, logs all drawn values to `.log`.
   */
  constructor(seed, { trace = false } = {}) {
    if (seed === undefined) {
      throw new Error('Mulberry32 requires a seed. No default (Date.now) allowed.');
    }
    this.seed = hashSeed(seed);
    this.state = this.seed;
    this.trace = trace;
    this.log = [];
  }

  /**
   * Draw a uint32 from the PRNG.
   * @returns {number} - A uint32 pseudorandom number.
   */
  next() {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let z = this.state;
    z = (z ^ (z >>> 15)) | 0;
    z = (z ^ (z << 17)) | 0;
    z = (z ^ (z >>> 15)) | 0;
    z = (z ^ (z << 13)) | 0;
    z = (z ^ (z >>> 16)) | 0;
    if (this.trace) {
      this.log.push(z >>> 0);
    }
    return z >>> 0;
  }

  /**
   * Draw a float in [0, 1).
   * @returns {number} - A float in [0, 1).
   */
  nextFloat() {
    return this.next() / 0x100000000;
  }

  /**
   * Draw a random integer in [min, max).
   * @param {number} min - Inclusive lower bound.
   * @param {number} max - Exclusive upper bound.
   * @returns {number} - A random integer in [min, max).
   */
  nextInt(min, max) {
    return min + Math.floor(this.nextFloat() * (max - min));
  }

  /**
   * Draw a random element from an array.
   * @param {Array} array - The array to sample from.
   * @returns {*} - A random element from the array.
   */
  sample(array) {
    return array[this.nextInt(0, array.length)];
  }

  /**
   * Shuffle an array in-place using Fisher-Yates.
   * @param {Array} array - The array to shuffle.
   * @returns {Array} - The shuffled array (same reference).
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i + 1);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

export { Mulberry32, hashSeed };
