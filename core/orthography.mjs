/**
 * Orthography module: bijective Latin ↔ runic mapping.
 * 
 * @module core/orthography
 */

// Bijective Latin ↔ runic map (Elder Futhark + extensions)
// Each Latin phoneme maps to exactly one rune and back.
const LATIN_TO_RUNE = Object.freeze({
  // Consonants
  'p': 'ᚾ', 'b': 'ᛒ', 't': 'ᛏ', 'd': 'ᛑ',
  'k': 'ᚲ', 'g': 'ᚷ',
  'f': 'ᚠ', 'v': 'ᚹ', 's': 'ᛋ', 'z': 'ᛡ',
  'ʃ': 'ᛞ', 'ʒ': 'ᚺ', 'h': 'ᚻ',
  'm': 'ᛗ', 'n': 'ᚾ', 'ŋ': 'ᛝ',
  'l': 'ᛚ', 'r': 'ᚱ',
  'j': 'ᛡ', 'w': 'ᚹ',
  
  // Vowels
  'i': 'ᛁ', 'e': 'ᛖ', 'æ': 'ᚨ',
  'ɨ': 'ᛇ', 'ə': 'ᚪ', 'ɐ': 'ᚫ',
  'u': 'ᚢ', 'o': 'ᚩ', 'ɑ': 'ᚪ',
});

// Invert the map for RUNE_TO_LATIN
const RUNE_TO_LATIN = Object.freeze(
  Object.fromEntries(
    Object.entries(LATIN_TO_RUNE).map(([lat, rune]) => [rune, lat])
  )
);

/**
 * Convert Latin text to runic.
 * @param {string} text - Latin text.
 * @returns {string} - Runic text.
 */
function runify(text) {
  let result = '';
  for (const char of text) {
    if (char in LATIN_TO_RUNE) {
      result += LATIN_TO_RUNE[char];
    } else {
      // Passthrough unknown characters (e.g., punctuation, spaces)
      result += char;
    }
  }
  return result;
}

/**
 * Convert runic text to Latin.
 * @param {string} text - Runic text.
 * @returns {string} - Latin text.
 */
function derune(text) {
  let result = '';
  for (const char of text) {
    if (char in RUNE_TO_LATIN) {
      result += RUNE_TO_LATIN[char];
    } else {
      // Passthrough unknown characters (e.g., punctuation, spaces)
      result += char;
    }
  }
  return result;
}

export { LATIN_TO_RUNE, RUNE_TO_LATIN, runify, derune };
