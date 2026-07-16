# Changelog

All notable changes to **Powder-Ranger Stone** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [v6.0.0] — 2026-07-16

### Rebuild from v5.1

This is a **complete rebuild** of the Powder-Ranger Stone engine, addressing the following **critical defects** in v5.1:

1. **Lossy Runification**
   - **Problem:** The runic display layer in v5.1 collapsed multiple Latin phonemes into a single rune (e.g., `c/k/q → ᚲ`), breaking the bijection.
   - **Fix:** Implemented a **strictly bijective** Latin ↔ runic map in `core/orthography.mjs`. Every Latin phoneme maps to exactly one rune and back.

2. **Greedy Suffix Stripping**
   - **Problem:** The morphology parser used `Object.entries` with a greedy approach, mis-parsing stacked markers (e.g., `stem+PST+PL` could lose affixes).
   - **Fix:** Rewrote `stripAffixes` in `core/morphology.mjs` to use **longest-affix-first, reverse-order, boundary-guarded** parsing.

3. **Silent Passthrough of Unknowns**
   - **Problem:** Unknown tokens were silently passed through, creating invisible corruption paths.
   - **Fix:** Added an **explicit policy enum** (`passthrough`/`mark`/`throw`) in `core/codec.mjs`, defaulting to `mark` (wraps unknowns as `⟨word⟩`).

4. **Non-Deterministic PRNG**
   - **Problem:** The v5.1 core used `Date.now()` as a default seed in some places, breaking reproducibility.
   - **Fix:** Replaced with **Mulberry32 PRNG** and a **required seed** in `core/prng.mjs`. The canonical seed (`3098546205`) is now the single source of truth.

### New Features

- **Deterministic Language Generation**
  - The entire language (phonology, lexicon, morphology) is regenerated in-browser from the canonical seed.
  - No server, no database, no build step required to run.

- **Round-Trip Invariant**
  - **Guaranteed:** `decode(encode(x)) === x` for all in-lexicon, correctly-tagged input.
  - Guarded by `test/roundtrip.test.mjs` and `scripts/verify-invariant.mjs`.

- **SKILLSTONE Spec**
  - Added `spec/SKILLSTONE.md` and `spec/skillstone.json` for teaching AIs the language.
  - Includes a **teaching prompt** (`spec/teaching-prompt.md`) for copy-paste AI priming.

- **GitHub Pages Hosting**
  - Static web app in `docs/` with a **bidirectional translator UI** (`docs/index.html`).
  - Supports Latin/runic script toggling and unknown token policies.

- **Zero Runtime Dependencies**
  - Pure ESM, vanilla JS, no bundler, no framework.

### Architecture

- **Core Engine** (`core/`)
  - `prng.mjs`: Mulberry32 PRNG with float-safe seed hashing.
  - `phonology.mjs`: Phoneme inventories + weighted sampling.
  - `morphology.mjs`: Affix tables + boundary-guarded parsing.
  - `lexicon.mjs`: Deterministic word generation + collision guard.
  - `orthography.mjs`: Bijective Latin ↔ runic mapping.
  - `engine.mjs`: Orchestrates language generation.
  - `codec.mjs`: Encode/decode for English ↔ Stone.
  - `index.mjs`: Public API surface.

- **Spec** (`spec/`)
  - `SKILLSTONE.md`: Human+AI-readable language spec.
  - `skillstone.json`: Machine-readable spec.
  - `teaching-prompt.md`: Copy-paste block for AI priming.

- **Web App** (`docs/`)
  - `index.html`: Translator UI shell.
  - `app.mjs`: UI logic.
  - `styles.css`: Classified interface aesthetic.

- **Tests** (`test/`)
  - `prng.test.mjs`, `phonology.test.mjs`, `morphology.test.mjs`, `orthography.test.mjs`, `engine.test.mjs`, `roundtrip.test.mjs`.
  - `fixtures/golden-seed-3098546205.json`: Regression anchor.

- **Scripts** (`scripts/`)
  - `generate-skillstone.mjs`: Regenerates `spec/` from `core/`.
  - `verify-invariant.mjs`: Standalone round-trip check for CI.

- **CI** (`.github/workflows/ci.yml`)
  - Runs `node --test` and `verify-invariant.mjs` on push/PR.

---

## [v5.1] — 2024-XX-XX

### Defects (Fixed in v6.0.0)

- Lossy runification (collapsed phonemes).
- Greedy suffix stripping (mis-parsed stacked markers).
- Silent passthrough of unknowns.
- Non-deterministic PRNG (default `Date.now()`).

---

[Unreleased]: https://github.com/POWDER-RANGER/powder-ranger-stone/compare/v6.0.0...HEAD
[v6.0.0]: https://github.com/POWDER-RANGER/powder-ranger-stone/compare/v5.1...v6.0.0
