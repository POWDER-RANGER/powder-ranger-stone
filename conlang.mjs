/**
 * POWDER-RANGER STONE v5.1 — reversible procedural conlang core
 * Author: Curtis Farrar
 * ORCID: 0009-0008-9273-2458
 * Date: 2026-07-16
 */

const STONE_METADATA = Object.freeze({
  title: 'POWDER-RANGER STONE v5.1 — reversible procedural conlang core',
  author: 'Curtis Farrar',
  orcid: '0009-0008-9273-2458',
  date: '2026-07-16',
  version: 'v5.1',
  stoneType: 'procedural-conlang-receiver-protocol',
  languageName: 'Powder-Ranger',
  runicName: 'ᛈᛟᚹᛞᛖᚱ-ᚱᚨᚾᚷᛖᚱ',
  canonicalSeedUint32: 3098546205,
});

/** Deterministic Seeded PRNG (Xorshift32) */
class PRNG {
  constructor(seed) { this.state = seed || 1; }
  next() {
    let x = this.state;
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 4294967296;
  }
}

/** 
 * Procedural Language Engine
 * Deterministically generates phonology and vocabulary from a uint32 seed.
 */
function generateLanguage(seed) {
  const rng = new PRNG(seed);
  const vowels = "aeiou".split("");
  const consonants = "ptksmnlrwfgvj".split("");
  
  const genWord = (len) => {
    let w = "";
    for(let i=0; i<len; i++) {
      w += (i % 2 === 0) ? consonants[Math.floor(rng.next() * consonants.length)] : vowels[Math.floor(rng.next() * vowels.length)];
    }
    return w;
  };

  const lexicon = new Map();
  const reverseLexicon = new Map();
  
  // Base stems (gloss -> word)
  ["I", "you", "see", "house", "mountain", "three", "in", "the", "a", "man", "woman", "tree", "water"].forEach(g => {
    const w = genWord(3 + Math.floor(rng.next() * 3));
    lexicon.set(g, w);
    reverseLexicon.set(w, g);
  });

  // Grammatical markers
  const markers = {
    PST: "ko", // Past
    PL: "ri",  // Plural
    ACC: "na"  // Accusative (optional for this engine version)
  };

  return { lexicon, reverseLexicon, markers, seed };
}

/** Encode English gloss line to Stone latin */
function encode(text, lang) {
  return text.split(" ").map(token => {
    let stem = token.replace(/\[.*?\]/g, "");
    let tags = (token.match(/\[(.*?)\]/g) || []).map(t => t.slice(1, -1));
    
    let word = lang.lexicon.get(stem) || stem;
    tags.forEach(t => {
      if(lang.markers[t]) word += lang.markers[t];
    });
    return word;
  }).join(" ");
}

/** Decode Stone latin to English gloss line */
function decode(text, lang) {
  return text.split(" ").map(word => {
    let current = word;
    let foundTags = [];
    
    // Check for suffixes
    Object.entries(lang.markers).forEach(([tag, suffix]) => {
      if(current.endsWith(suffix)) {
        foundTags.push(tag);
        current = current.slice(0, -suffix.length);
      }
    });

    let stem = lang.reverseLexicon.get(current) || current;
    return stem + foundTags.map(t => `[${t}]`).join("");
  }).join(" ");
}

/** Map Latin letters to Elder Futhark */
function runify(text) {
  const map = {
    'a':'ᚨ', 'b':'ᛒ', 'c':'ᚲ', 'd':'ᛞ', 'e':'ᛖ', 'f':'ᚠ', 'g':'ᚷ', 'h':'ᚺ',
    'i':'ᛁ', 'j':'ᛃ', 'k':'ᚲ', 'l':'ᛚ', 'm':'ᛗ', 'n':'ᚾ', 'o':'ᛟ', 'p':'ᛈ',
    'q':'ᚲ', 'r':'ᚱ', 's':'ᛊ', 't':'ᛏ', 'u':'ᚢ', 'v':'ᚠ', 'w':'ᚹ', 'x':'ᛪ',
    'y':'ᛃ', 'z':'ᛈ'
  };
  return text.toLowerCase().split("").map(c => map[c] || c).join("");
}

export {
  STONE_METADATA,
  PRNG,
  generateLanguage,
  encode,
  decode,
  runify
};
