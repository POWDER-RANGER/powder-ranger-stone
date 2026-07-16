/**
 * Codec module: encode/decode for English ↔ Stone.
 * 
 * @module core/codec
 */

import { applyAffixes, stripAffixes, MARKERS } from './morphology.mjs';
import { runify, derune } from './orthography.mjs';

// Unknown token policy
const UNKNOWN_POLICY = {
  PASSTHROUGH: 'passthrough',
  MARK: 'mark',
  THROW: 'throw',
};

/**
 * Tokenize English text into glosses and tags.
 * @param {string} text - English text.
 * @returns {Array<{ gloss: string, tags: Array<string> }>} - Tokenized glosses and tags.
 */
function tokenizeEnglish(text) {
  // Simple tokenizer: split on whitespace and punctuation
  // TODO: Replace with a proper tokenizer for production
  const tokens = text.split(/\s+/).filter(token => token.length > 0);
  return tokens.map(token => {
    // Remove punctuation from the token
    const cleanToken = token.replace(/[^a-zA-Z]/g, '').toLowerCase();
    return { gloss: cleanToken, tags: [] };
  });
}

/**
 * Encode English text to Stone.
 * @param {string} text - English text.
 * @param {Object} lang - Generated language from engine.
 * @param {Object} [opts] - Options.
 * @param {string} [opts.script='latin'] - Output script: 'latin' or 'runic'.
 * @param {string} [opts.unknownPolicy='mark'] - Policy for unknown tokens: 'passthrough', 'mark', or 'throw'.
 * @returns {string} - Encoded Stone text.
 */
function encode(text, lang, { script = 'latin', unknownPolicy = 'mark' } = {}) {
  const tokens = tokenizeEnglish(text);
  const { glossToWord } = lang.lexicon;
  const { markers } = lang;
  
  const encodedTokens = [];
  for (const { gloss, tags } of tokens) {
    if (glossToWord.has(gloss)) {
      let word = glossToWord.get(gloss);
      // Apply affixes for tags
      if (tags.length > 0) {
        word = applyAffixes(word, tags, markers);
      }
      encodedTokens.push(word);
    } else {
      // Handle unknown tokens
      switch (unknownPolicy) {
        case UNKNOWN_POLICY.PASSTHROUGH:
          encodedTokens.push(gloss);
          break;
        case UNKNOWN_POLICY.MARK:
          encodedTokens.push(`⟨${gloss}⟩`);
          break;
        case UNKNOWN_POLICY.THROW:
          throw new Error(`Unknown gloss: ${gloss}`);
        default:
          encodedTokens.push(`⟨${gloss}⟩`);
      }
    }
  }
  
  let result = encodedTokens.join(' ');
  if (script === 'runic') {
    result = runify(result);
  }
  return result;
}

/**
 * Decode Stone text to English.
 * @param {string} text - Stone text (Latin or runic).
 * @param {Object} lang - Generated language from engine.
 * @param {Object} [opts] - Options.
 * @param {string} [opts.script='latin'] - Input script: 'latin' or 'runic'.
 * @param {string} [opts.unknownPolicy='mark'] - Policy for unknown tokens: 'passthrough', 'mark', or 'throw'.
 * @returns {string} - Decoded English text.
 */
function decode(text, lang, { script = 'latin', unknownPolicy = 'mark' } = {}) {
  let latinText = text;
  if (script === 'runic') {
    latinText = derune(text);
  }
  
  const tokens = latinText.split(/\s+/).filter(token => token.length > 0);
  const { wordToGloss } = lang.lexicon;
  const { markers } = lang;
  
  const decodedTokens = [];
  for (const token of tokens) {
    // Check for marked unknowns
    if (token.startsWith('⟨') && token.endsWith('⟩')) {
      const unknown = token.slice(1, -1);
      switch (unknownPolicy) {
        case UNKNOWN_POLICY.PASSTHROUGH:
          decodedTokens.push(unknown);
          break;
        case UNKNOWN_POLICY.MARK:
          decodedTokens.push(`⟨${unknown}⟩`);
          break;
        case UNKNOWN_POLICY.THROW:
          throw new Error(`Unknown token: ${unknown}`);
        default:
          decodedTokens.push(`⟨${unknown}⟩`);
      }
      continue;
    }
    
    // Strip affixes
    const { stem, tags } = stripAffixes(token, markers);
    
    if (wordToGloss.has(stem)) {
      const gloss = wordToGloss.get(stem);
      decodedTokens.push({ gloss, tags });
    } else {
      // Handle unknown stems
      switch (unknownPolicy) {
        case UNKNOWN_POLICY.PASSTHROUGH:
          decodedTokens.push({ gloss: stem, tags: [] });
          break;
        case UNKNOWN_POLICY.MARK:
          decodedTokens.push({ gloss: `⟨${stem}⟩`, tags: [] });
          break;
        case UNKNOWN_POLICY.THROW:
          throw new Error(`Unknown stem: ${stem}`);
        default:
          decodedTokens.push({ gloss: `⟨${stem}⟩`, tags: [] });
      }
    }
  }
  
  // Reconstruct English text with tags
  return decodedTokens.map(({ gloss, tags }) => {
    let result = gloss;
    if (tags.length > 0) {
      result += `[${tags.join(',')}]`;
    }
    return result;
  }).join(' ');
}

export { encode, decode, UNKNOWN_POLICY };
