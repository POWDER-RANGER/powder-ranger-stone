/**
 * Lexicon module: deterministic word generation and gloss-word mapping.
 * 
 * @module core/lexicon
 */

import { weightedSample } from './phonology.mjs';

// Core concepts (glosses) for the lexicon
const CORE_CONCEPTS = Object.freeze([
  'I', 'you', 'he', 'she', 'it', 'we', 'they',
  'man', 'woman', 'child', 'person', 'king', 'queen', 'leader',
  'cat', 'dog', 'bird', 'fish', 'horse', 'tree', 'rock', 'water', 'fire',
  'eat', 'drink', 'run', 'walk', 'see', 'hear', 'speak', 'think', 'know',
  'good', 'bad', 'big', 'small', 'hot', 'cold', 'new', 'old', 'true', 'false',
  'one', 'two', 'three', 'many', 'all', 'some', 'none',
  'here', 'there', 'now', 'then', 'today', 'tomorrow', 'yesterday',
  'love', 'hate', 'fear', 'hope', 'dream', 'live', 'die', 'fight', 'win', 'lose',
  'house', 'city', 'land', 'sky', 'star', 'moon', 'sun', 'light', 'dark',
  'name', 'word', 'language', 'story', 'song', 'dance', 'play', 'work', 'rest',
]);

/**
 * Generate a deterministic lexicon from phonology and PRNG.
 * @param {Mulberry32} rng - The PRNG instance.
 * @param {Object} phonology - Phonology tables: { consonants, vowels, allPhonemes }.
 * @returns {Object} - { glossToWord: Map, wordToGloss: Map }.
 */
function generateLexicon(rng, phonology) {
  const glossToWord = new Map();
  const wordToGloss = new Map();
  
  const { consonants, vowels, allPhonemes } = phonology;
  
  for (const gloss of CORE_CONCEPTS) {
    let word;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      word = generateWord(rng, allPhonemes, consonants, vowels);
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to generate unique word for gloss "${gloss}" after ${maxAttempts} attempts`);
      }
    } while (wordToGloss.has(word));
    
    glossToWord.set(gloss, word);
    wordToGloss.set(word, gloss);
  }
  
  return {
    glossToWord: Object.freeze(new Map(glossToWord)),
    wordToGloss: Object.freeze(new Map(wordToGloss)),
  };
}

/**
 * Generate a single word using phonotactic rules.
 * @param {Mulberry32} rng - The PRNG instance.
 * @param {Array<string>} allPhonemes - All available phonemes.
 * @param {Array<string>} consonants - All consonants.
 * @param {Array<string>} vowels - All vowels.
 * @returns {string} - A generated word.
 */
function generateWord(rng, allPhonemes, consonants, vowels) {
  // Word length: 1-4 syllables (Zipf-ish bias toward shorter words)
  const numSyllables = weightedSample(rng, [1, 2, 3, 4], 1)[0];
  
  let word = '';
  for (let i = 0; i < numSyllables; i++) {
    // Syllable structure: (C)(C)V(C)
    // Onset: 0-2 consonants
    const numOnsetConsonants = weightedSample(rng, [0, 1, 2], 1)[0];
    for (let j = 0; j < numOnsetConsonants; j++) {
      word += rng.sample(consonants);
    }
    
    // Nucleus: 1 vowel
    word += rng.sample(vowels);
    
    // Coda: 0-1 consonant
    const numCodaConsonants = weightedSample(rng, [0, 1], 1)[0];
    for (let j = 0; j < numCodaConsonants; j++) {
      word += rng.sample(consonants);
    }
  }
  
  return word;
}

export { CORE_CONCEPTS, generateLexicon };
