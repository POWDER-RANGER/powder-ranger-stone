/**
 * UI logic for the Powder-Ranger Stone translator.
 * 
 * @module docs/app
 */

import { 
  generateLanguage, 
  CANONICAL_SEED, 
  encode, 
  decode,
  STONE_METADATA 
} from '../core/index.mjs';

// Cache the generated language
let lang;

// DOM elements
const englishInput = document.getElementById('english-input');
const stoneOutput = document.getElementById('stone-output');
const directionSelect = document.getElementById('direction');
const scriptRadios = document.querySelectorAll('input[name="script"]');
const unknownPolicySelect = document.getElementById('unknown-policy');
const copyEnglishBtn = document.getElementById('copy-english');
const copyStoneBtn = document.getElementById('copy-stone');
const clearEnglishBtn = document.getElementById('clear-english');
const clearStoneBtn = document.getElementById('clear-stone');
const teachingPromptTextarea = document.getElementById('teaching-prompt');
const copyPromptBtn = document.getElementById('copy-prompt');

// Initialize the app
function init() {
  // Generate the language with the canonical seed
  lang = generateLanguage(CANONICAL_SEED);
  
  // Load the teaching prompt
  loadTeachingPrompt();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial translation
  translate();
}

// Load the teaching prompt from the spec
async function loadTeachingPrompt() {
  try {
    const response = await fetch('spec/teaching-prompt.md');
    if (response.ok) {
      const prompt = await response.text();
      teachingPromptTextarea.value = prompt;
    } else {
      teachingPromptTextarea.value = 'Teaching prompt not found. See spec/teaching-prompt.md';
    }
  } catch (error) {
    teachingPromptTextarea.value = 'Error loading teaching prompt.';
  }
}

// Set up event listeners
function setupEventListeners() {
  // Translate on input
  englishInput.addEventListener('input', debounce(translate, 300));
  stoneOutput.addEventListener('input', debounce(translate, 300));
  
  // Direction/script/unknown policy changes
  directionSelect.addEventListener('change', translate);
  scriptRadios.forEach(radio => radio.addEventListener('change', translate));
  unknownPolicySelect.addEventListener('change', translate);
  
  // Copy buttons
  copyEnglishBtn.addEventListener('click', () => copyToClipboard(englishInput));
  copyStoneBtn.addEventListener('click', () => copyToClipboard(stoneOutput));
  copyPromptBtn.addEventListener('click', () => copyToClipboard(teachingPromptTextarea));
  
  // Clear buttons
  clearEnglishBtn.addEventListener('click', () => {
    englishInput.value = '';
    translate();
  });
  clearStoneBtn.addEventListener('click', () => {
    stoneOutput.value = '';
    translate();
  });
}

// Translate based on current settings
function translate() {
  const direction = directionSelect.value;
  const script = document.querySelector('input[name="script"]:checked').value;
  const unknownPolicy = unknownPolicySelect.value;
  
  if (direction === 'encode') {
    // English → Stone
    const english = englishInput.value;
    const stone = encode(english, lang, { script, unknownPolicy });
    stoneOutput.value = stone;
  } else {
    // Stone → English
    const stone = stoneOutput.value;
    const english = decode(stone, lang, { script, unknownPolicy });
    englishInput.value = english;
  }
}

// Copy to clipboard
function copyToClipboard(element) {
  element.select();
  document.execCommand('copy');
  
  // Show a brief notification
  const originalValue = element.value;
  element.value = 'Copied!';
  setTimeout(() => {
    element.value = originalValue;
  }, 1000);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);
