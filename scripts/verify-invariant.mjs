/**
 * Standalone round-trip invariant check for CI.
 * Exits with code 0 if all tests pass, 1 otherwise.
 * 
 * @module scripts/verify-invariant
 */

import { generateLanguage, CANONICAL_SEED } from '../core/index.mjs';
import { encode, decode } from '../core/codec.mjs';

/**
 * Main function: verify the round-trip invariant for all lexicon glosses.
 */
function main() {
  console.log('Verifying round-trip invariant...');
  const lang = generateLanguage(CANONICAL_SEED);
  const { glossToWord } = lang.lexicon;
  
  let passed = 0;
  let failed = 0;
  
  for (const gloss of glossToWord.keys()) {
    const encoded = encode(gloss, lang, { script: 'latin' });
    const decoded = decode(encoded, lang, { script: 'latin' });
    const baseDecoded = decoded.replace(/\s*\[.*?\]/g, '').trim();
    
    if (baseDecoded === gloss) {
      passed++;
    } else {
      console.error(`FAIL: "${gloss}" → "${encoded}" → "${baseDecoded}"`);
      failed++;
    }
  }
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.error('Round-trip invariant FAILED.');
    process.exit(1);
  } else {
    console.log('Round-trip invariant PASSED.');
    process.exit(0);
  }
}

main();
