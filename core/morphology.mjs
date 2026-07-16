/**
 * Morphology module: affix tables and boundary-guarded parsing.
 * 
 * @module core/morphology
 */

// Frozen affix table: tag → { affix, position }
// Position: 'prefix' or 'suffix'
const MARKERS = Object.freeze({
  // Tense/Aspect
  PAST: { affix: 'ed', position: 'suffix' },
  PRESENT: { affix: 'ing', position: 'suffix' },
  FUTURE: { affix: 'on', position: 'suffix' },
  
  // Number
  PLURAL: { affix: 's', position: 'suffix' },
  SINGULAR: { affix: '', position: 'suffix' },
  
  // Person
  FIRST: { affix: 'im', position: 'prefix' },
  SECOND: { affix: 'am', position: 'prefix' },
  THIRD: { affix: 'un', position: 'prefix' },
  
  // Mood
  IMPERATIVE: { affix: 'ya', position: 'suffix' },
  CONDITIONAL: { affix: 'us', position: 'suffix' },
  
  // Polarity
  NEGATIVE: { affix: 'ne', position: 'prefix' },
  
  // Definiteness
  DEFINITE: { affix: 'da', position: 'suffix' },
  INDEFINITE: { affix: 'a', position: 'suffix' },
});

/**
 * Apply affixes to a stem based on tags.
 * @param {string} stem - The base word.
 * @param {Array<string>} tags - Array of tag names (e.g., ['PAST', 'PLURAL']).
 * @param {Object} markers - Affix table (default: MARKERS).
 * @returns {string} - The inflected word.
 */
function applyAffixes(stem, tags, markers = MARKERS) {
  let word = stem;
  const appliedAffixes = [];
  
  // Apply prefixes first (in order of tags)
  for (const tag of tags) {
    const marker = markers[tag];
    if (marker && marker.position === 'prefix') {
      word = marker.affix + word;
      appliedAffixes.push({ tag, affix: marker.affix, position: 'prefix' });
    }
  }
  
  // Apply suffixes next (in order of tags)
  for (const tag of tags) {
    const marker = markers[tag];
    if (marker && marker.position === 'suffix') {
      word += marker.affix;
      appliedAffixes.push({ tag, affix: marker.affix, position: 'suffix' });
    }
  }
  
  return word;
}

/**
 * Strip affixes from a word, returning the stem and tags.
 * Uses longest-affix-first, reverse-order, boundary-guarded parsing.
 * @param {string} word - The inflected word.
 * @param {Object} markers - Affix table (default: MARKERS).
 * @returns {Object} - { stem: string, tags: Array<string> }
 */
function stripAffixes(word, markers = MARKERS) {
  let remaining = word;
  const tags = [];
  
  // Collect all suffixes and prefixes from markers
  const suffixes = [];
  const prefixes = [];
  
  for (const [tag, marker] of Object.entries(markers)) {
    if (marker.position === 'suffix' && marker.affix) {
      suffixes.push({ tag, affix: marker.affix, length: marker.affix.length });
    } else if (marker.position === 'prefix' && marker.affix) {
      prefixes.push({ tag, affix: marker.affix, length: marker.affix.length });
    }
  }
  
  // Sort suffixes by length (longest first) for greedy matching
  suffixes.sort((a, b) => b.length - a.length);
  
  // Strip suffixes (longest first, reverse order of application)
  for (const { tag, affix, length } of suffixes) {
    if (remaining.endsWith(affix) && remaining.length > length) {
      remaining = remaining.slice(0, -length);
      tags.push(tag);
    }
  }
  
  // Sort prefixes by length (longest first) for greedy matching
  prefixes.sort((a, b) => b.length - a.length);
  
  // Strip prefixes (longest first, reverse order of application)
  for (const { tag, affix, length } of prefixes) {
    if (remaining.startsWith(affix) && remaining.length > length) {
      remaining = remaining.slice(length);
      tags.push(tag);
    }
  }
  
  return { stem: remaining, tags };
}

export { MARKERS, applyAffixes, stripAffixes };
