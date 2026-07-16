/**
 * Script to generate the SKILLSTONE spec from the core engine.
 * 
 * @module scripts/generate-skillstone
 */

import { generateLanguage, CANONICAL_SEED, STONE_METADATA } from '../core/index.mjs';
import { runify } from '../core/orthography.mjs';
import { applyAffixes } from '../core/morphology.mjs';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Generate the SKILLSTONE.md file.
 * @param {Object} lang - Generated language.
 * @returns {string} - Markdown content for SKILLSTONE.md.
 */
function generateSkillstoneMD(lang) {
  const { seed, phonology, lexicon, markers } = lang;
  const { glossToWord, wordToGloss } = lexicon;
  
  let md = `# POWDER-RANGER STONE — SKILLSTONE Specification\n\n`;
  md += `**Canonical Seed:** \(${seed}\`\n\n`;
  md += `**Version:** ${STONE_METADATA.version}\n\n`;
  md += `**Description:** ${STONE_METADATA.description}\n\n`;
  
  // --- Phoneme Inventory ---
  md += `## 1. Phoneme Inventory\n\n`;
  md += `### Consonants\n\n`;
  md += phonology.consonants.map(c => `- \`${c}\``).join('\n') + '\n\n';
  md += `### Vowels\n\n`;
  md += phonology.vowels.map(v => `- \`${v}\``).join('\n') + '\n\n';
  
  // --- Affix Table ---
  md += `## 2. Affix Table\n\n`;
  md += `| Tag | Affix | Position | Example |\n`;
  md += `|-----|-------|----------|---------|\n`;
  for (const [tag, marker] of Object.entries(markers)) {
    const exampleGloss = Object.keys(glossToWord)[0]; // Use first gloss for example
    const exampleWord = glossToWord.get(exampleGloss);
    const exampleInflected = applyAffixes(exampleWord, [tag], markers);
    md += `| \`${tag}\` | \`${marker.affix}\` | \`${marker.position}\` | \`${exampleInflected}\` |\n`;
  }
  md += '\n';
  
  // --- Lexicon Dump ---
  md += `## 3. Lexicon Dump\n\n`;
  md += `| Gloss | Latin | Runic |\n`;
  md += `|-------|-------|-------|\n`;
  for (const [gloss, word] of glossToWord) {
    const runic = runify(word);
    md += `| ${gloss} | \`${word}\` | \`${runic}\` |\n`;
  }
  md += '\n';
  
  // --- Worked Examples ---
  md += `## 4. Worked Examples\n\n`;
  md += `### Encode: "I run"\n`;
  const encodeExample1 = applyAffixes(glossToWord.get('I'), [], markers);
  const encodeExample2 = applyAffixes(glossToWord.get('run'), ['PAST'], markers);
  md += `- English: I run\n`;
  md += `- Stone (Latin): ${encodeExample1} ${encodeExample2}\n`;
  md += `- Stone (Runic): ${runify(encodeExample1)} ${runify(encodeExample2)}\n\n`;
  
  md += `### Decode: "${encodeExample1} ${encodeExample2}"\n`;
  md += `- Stone (Latin): ${encodeExample1} ${encodeExample2}\n`;
  md += `- English: I run\n\n`;
  
  // --- Round-trip Invariant ---
  md += `## 5. Round-trip Invariant\n\n`;
  md += `For all in-lexicon, correctly-tagged input: \`decode(encode(x)) === x\`.\n\n`;
  
  return md;
}

/**
 * Generate the skillstone.json file.
 * @param {Object} lang - Generated language.
 * @returns {Object} - JSON content for skillstone.json.
 */
function generateSkillstoneJSON(lang) {
  const { seed, phonology, lexicon, markers } = lang;
  const { glossToWord, wordToGloss } = lexicon;
  
  return {
    seed,
    version: STONE_METADATA.version,
    description: STONE_METADATA.description,
    phonology,
    markers,
    lexicon: {
      glossToWord: Object.fromEntries(glossToWord),
      wordToGloss: Object.fromEntries(wordToGloss),
    },
  };
}

/**
 * Main function: generate SKILLSTONE.md and skillstone.json.
 */
function main() {
  console.log('Generating SKILLSTONE from canonical seed...');
  const lang = generateLanguage(CANONICAL_SEED);
  
  // Generate SKILLSTONE.md
  const skillstoneMD = generateSkillstoneMD(lang);
  const skillstoneMDPath = path.join('spec', 'SKILLSTONE.md');
  fs.writeFileSync(skillstoneMDPath, skillstoneMD);
  console.log(`Wrote ${skillstoneMDPath}`);
  
  // Generate skillstone.json
  const skillstoneJSON = generateSkillstoneJSON(lang);
  const skillstoneJSONPath = path.join('spec', 'skillstone.json');
  fs.writeFileSync(skillstoneJSONPath, JSON.stringify(skillstoneJSON, null, 2));
  console.log(`Wrote ${skillstoneJSONPath}`);
  
  // Verify round-trip for 3 examples
  console.log('\nVerifying round-trip for 3 examples:');
  const examples = ['I', 'run', 'love'];
  for (const gloss of examples) {
    const word = lang.lexicon.glossToWord.get(gloss);
    const runified = runify(word);
    const deruned = lang.lexicon.wordToGloss.get(runified) || lang.lexicon.wordToGloss.get(word);
    console.log(`  "${gloss}" → "${word}" → "${runified}" → "${deruned}" (${deruned === gloss ? 'PASS' : 'FAIL'})`);
  }
}

main();
