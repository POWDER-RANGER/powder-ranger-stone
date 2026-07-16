# POWDER-RANGER STONE — Repository Architecture & Build Specification

**Target:** `github.com/POWDER-RANGER/powder-ranger-stone`
**Author:** Curtis Farrar · ORCID: 0009-0008-9273-2458
**Version:** 6.0.0

---

## 0. Product Definition (What "Done" Means)

A **GitHub-Pages-hosted, client-side, bidirectional translator** for:

- **English → Stone (encode):** Gloss-tagged English → Powder-Ranger Latin → Runic display.
- **Stone → English (decode):** Powder-Ranger Latin (or runic) → Gloss-tagged English.

**Key Properties:**
- **Deterministic:** The entire language is regenerated in-browser from one `uint32` canonical seed (`3098546205`).
- **No server, no database, no build step** required to run. Ships as static files.
- **Workflow:** Teach an AI the language once (hand it the SKILLSTONE spec), then use the Pages tool to compose messages in Stone and decode the AI's Stone replies back to English.

**Non-Negotiable Invariant:**
> `decode(encode(x)) === x` for all in-lexicon, correctly-tagged input.

This is the property the current v5.1 core violates (lossy runify, greedy suffix strip). The test suite exists primarily to guard this invariant.

---

## 1. Critical Design Decisions

| # | Decision | Chosen | Rationale |
|---|----------|--------|-----------|
| D1 | PRNG algorithm | **Mulberry32** | Already validated with float-seed fix + trace in prior work. Xorshift32 in current core is fine but undocumented and duplicative. Pick one, delete the other. |
| D2 | Runic layer | **Reversible display over canonical Latin** | Decode always operates on the Latin form. Runic is presentation. A bijective map is provided so runic→Latin is *possible*, but the pipeline never depends on it. |
| D3 | Unknown-token handling | **Explicit policy enum** (`passthrough`/`mark`/`throw`), default `mark` | Silent passthrough is an invisible corruption path in a tool. |
| D4 | Affix parsing | **Longest-suffix-first, reverse-order, boundary-guarded** | Current greedy object-order strip mis-parses stacked markers. |
| D5 | Module system | **ESM (`.mjs`)** everywhere | Matches existing core; runs natively in browser and Node. No bundler required for v1. |
| D6 | Hosting | **GitHub Pages from root** | Keeps the deployable web app physically separate from source/tests. Pages serves the whole repo. |
| D7 | Dependencies | **Zero runtime deps** | Everything is vanilla ESM + hand-rolled logic. Dev-only deps (test runner) allowed. |

---

## 2. Repository Tree

```
powder-ranger-stone/
├── LICENSE                          [exists] MIT
├── README.md                        [REPLACED]
├── ARCHITECTURE.md                  This document
├── CHANGELOG.md                     Version history (v5.1→v6.0)
├── .gitignore                       node_modules, coverage, .DS_Store
├── .nojekyll                        REQUIRED — stops Pages mangling files starting with _
├── package.json                     name, type:module, scripts, dev deps only
│
├── core/                            ── the engine. pure logic, no I/O, no DOM ──
│   ├── prng.mjs                     Mulberry32 + hashSeed (float-safe) + trace
│   ├── phonology.mjs               Phoneme inventories + weighted selection
│   ├── morphology.mjs              Affix table + apply/strip (boundary-guarded)
│   ├── lexicon.mjs                 Gloss↔word maps, deterministic word gen
│   ├── orthography.mjs             Bijective Latin↔runic map + runify/derune
│   ├── engine.mjs                  generateLanguage() — assembles the above
│   ├── codec.mjs                   encode() / decode() — the round-trip pair
│   └── index.mjs                   Barrel export, public API surface
│
├── spec/                            ── the SKILLSTONE — what you hand an AI ──
│   ├── SKILLSTONE.md               Human+AI-readable full language spec
│   ├── skillstone.json             Machine-readable: seed, tables, lexicon dump
│   └── teaching-prompt.md          Copy-paste block to teach a fresh AI session
│
├── docs/                            ── GitHub Pages web app (the live tool) ──
│   ├── index.html                  Translator UI shell
│   ├── app.mjs                     UI logic, imports ../core/index.mjs
│   ├── styles.css                  The "classified interface" aesthetic
│   ├── favicon.svg
│   └── vendor/                     (empty in v1 — zero deps; placeholder for future)
│
├── test/                            ── verification. the invariant guards ──
│   ├── prng.test.mjs               Determinism, float-seed distinctness, trace
│   ├── roundtrip.test.mjs          decode(encode(x))===x across full lexicon
│   ├── morphology.test.mjs         Stacked-marker parse correctness
│   ├── orthography.test.mjs        runify/derune bijection
│   └── fixtures/
│       └── golden-seed-3098546205.json   Frozen expected output, regression anchor
│
├── scripts/                         ── build/maintenance automation ──
│   ├── generate-skillstone.mjs     Regenerates spec/ from core/ — run on any core change
│   └── verify-invariant.mjs        Standalone round-trip check for CI
│
└── .github/
    └── workflows/
        └── ci.yml                   Node test + invariant check on push/PR
```

---

## 3. File-by-File Build Specification

### `core/` — The Engine (Pure, Testable, No DOM)

#### `core/prng.mjs`
- **Lang:** JS (ESM). **LOC:** ~55.
- **Exports:** `class Mulberry32`, `hashSeed(input)`.
- **Content:** Mulberry32 with optional `{trace}` producing `.log[]`. `hashSeed` handles:
  - `int` (`>>>0`)
  - **Non-integer float via IEEE-754 bit hash** (the collision fix — `3.14159` and `3.99999` must NOT collide)
  - `string` (char-code accumulator).
- **Wire:** Consumed by `engine.mjs` only.
- **Guard:** `constructor(seed)` must **require** a seed — no `Date.now()` default.

#### `core/phonology.mjs`
- **Lang:** JS. **LOC:** ~70.
- **Exports:** `CONSONANTS`, `VOWELS` (weighted tables), `generatePhonology(rng)`, `weightedSample(rng, pool, n)`.
- **Content:** Frozen inventory tables (single code points only for v1 — no multi-char phonemes), Efraimidis-Spirakis weighted sampling without replacement.
- **Wire:** `engine.mjs` calls `generatePhonology` first. Output feeds `lexicon.mjs`.

#### `core/morphology.mjs`
- **Lang:** JS. **LOC:** ~90.
- **Exports:** `MARKERS` (tag→affix + position), `applyAffixes(stem, tags, markers)`, `stripAffixes(word, markers)`.
- **Content:** Affix table. `stripAffixes` MUST be **longest-affix-first, applied in reverse of application order, with a boundary check** so `stem+PST+PL` decodes to exactly `[PST][PL]` and never mis-splits a stem that happens to end in an affix string.
- **Wire:** `codec.mjs` uses both functions. This is the highest-bug-risk file — it owns most of `morphology.test.mjs`.

#### `core/lexicon.mjs`
- **Lang:** JS. **LOC:** ~75.
- **Exports:** `CORE_CONCEPTS`, `generateLexicon(rng, phonology)`, returns `{ glossToWord: Map, wordToGloss: Map }`.
- **Content:** Deterministic word generation from phonology, Zipf-ish length bias. **Collision guard:** If two glosses generate the same word, re-roll the second — a duplicate word breaks `wordToGloss` (last-write-wins silently corrupts decode).
- **Wire:** Built after phonology, before codec. Both maps frozen after build.

#### `core/orthography.mjs`
- **Lang:** JS. **LOC:** ~60.
- **Exports:** `LATIN_TO_RUNE`, `RUNE_TO_LATIN`, `runify(text)`, `derune(text)`.
- **Content:** **Bijective** map — every Latin token used by the lexicon maps to exactly one glyph and back. NO many-to-one collapses (the `c/k/q→ᚲ` problem). If the phoneme set is larger than clean Elder Futhark 1:1 coverage, extend with pointed/dotted runes or combining marks rather than collapsing.
- **Wire:** Display layer. `codec.mjs` may call `runify` on output and `derune` on runic input, but decode logic operates on Latin.

#### `core/engine.mjs`
- **Lang:** JS. **LOC:** ~45.
- **Exports:** `generateLanguage(seed, opts)`.
- **Content:** Orchestrator. Order is fixed: `hashSeed → new Mulberry32 → generatePhonology → generateLexicon → assemble {phonology, lexicon, markers, seed, rngTrace?}`. Freeze the returned object.
- **Wire:** The single entry point everything else builds on. `codec`, `docs/app`, `scripts/*`, tests all start here.

#### `core/codec.mjs`
- **Lang:** JS. **LOC:** ~110.
- **Exports:** `encode(text, lang, opts)`, `decode(text, lang, opts)`.
- **Content:** The round-trip pair. `opts.unknownPolicy: 'passthrough'|'mark'|'throw'` (default `'mark'` → wraps unknowns as `⟨word⟩`). `opts.script: 'latin'|'runic'`.
  - Encode: Tokenize → gloss lookup → apply affixes → optional runify.
  - Decode: Optional derune → strip affixes → reverse gloss lookup → re-emit tags.
- **Wire:** Imports `morphology` + `orthography` + consumes a `lang` from `engine`. This file's correctness IS the product invariant. Owns `roundtrip.test.mjs`.

#### `core/index.mjs`
- **Lang:** JS. **LOC:** ~15.
- **Content:** Barrel. Re-exports the public API: `generateLanguage, encode, decode, runify, derune, STONE_METADATA`. Nothing imports individual core files except through this — one seam to the outside.

---

### `spec/` — The SKILLSTONE (The Teachable Artifact)

#### `spec/SKILLSTONE.md`
- **Lang:** Markdown. **Length:** 400–700 lines / ~6–10k words.
- **Content:** The complete, self-contained language description an AI (or human) learns from. Sections:
  1. Canonical seed + reproduction instructions
  2. Phoneme inventory
  3. Phonotactic rules
  4. Full affix/marker table with examples
  5. Complete lexicon dump (gloss ↔ Latin ↔ runic)
  6. Worked encode/decode examples
  7. The round-trip invariant stated formally.
- **Wire:** Generated FROM `core`. Handed TO an AI. The bridge between engine and use.

#### `spec/skillstone.json`
- **Lang:** JSON. **Size:** ~50–150 KB depending on lexicon size.
- **Content:** Machine-readable twin of the .md — seed, tables, both lexicon maps as objects, marker table.
- **Wire:** Emitted by the same generator script. `docs/app.mjs` MAY load this instead of regenerating, as a speed/verification cross-check.

#### `spec/teaching-prompt.md`
- **Lang:** Markdown. **Length:** 40–80 lines.
- **Content:** The exact copy-paste block to prime a fresh AI session — "You are receiving a constructed language spec. Here is the SKILLSTONE. Confirm you can encode/decode. Reply only in Stone." Plus 3–5 verification challenges to confirm the AI actually learned it.
- **Wire:** References `SKILLSTONE.md`. Pure human workflow doc.

---

### `docs/` — The GitHub Pages Web App (The Live Tool)

#### `docs/index.html`
- **Lang:** HTML5. **LOC:** ~120.
- **Content:** UI shell. Two-pane translator (English ↔ Stone), direction toggle, script toggle (Latin/runic), unknown-policy selector, copy buttons, a "load SKILLSTONE for AI" panel that surfaces `teaching-prompt.md` content. Semantic, accessible, no framework.
- **Wire:** Loads `styles.css`, imports `app.mjs` as `<script type="module">`.

#### `docs/app.mjs`
- **Lang:** JS (ESM). **LOC:** ~180.
- **Content:** All UI logic. On load: `generateLanguage(3098546205)` once, cache it. Wire input events → `encode`/`decode` → render. Debounced live translation. Direction + script + policy state. No framework, no build step.
- **Wire:** `import { ... } from '../core/index.mjs'`. **This is the critical wiring seam:** Pages serves `/docs`, but core lives at `/core`. Either (a) relative import `../core/index.mjs` works because both are served from repo root on Pages, OR (b) a build step copies `core/` into `docs/core/`. **Decision: use relative `../core/` and confirm Pages serves the whole repo (it does when Pages source = branch root or when using an action). If Pages source = `/docs` folder only, `core/` is NOT served — then you MUST copy core into `docs/core/` via `scripts/`.** Flag this explicitly; it is the #1 thing that "blows up" GitHub Pages conlang tools.
- **Wiring resolution for this repo:** Set Pages to deploy from the **root** (serving `/core` and `/docs` directly).

#### `docs/styles.css`
- **Lang:** CSS. **LOC:** ~250.
- **Content:** The "classified system interface" aesthetic — monospace, dark, high-contrast, terminal-adjacent. Runic display in a larger glyph-friendly font stack. Responsive two-pane → stacked on mobile.
- **Wire:** Referenced by `index.html`. Pure presentation.

#### `docs/favicon.svg`
- **Lang:** SVG. **LOC:** ~15.
- **Content:** Inline runic glyph mark.

---

### `test/` — Verification

#### `test/prng.test.mjs`
- **LOC:** ~60. Asserts: same seed → identical sequence; `hashSeed(3.14159) !== hashSeed(3.99999)`; trace length matches draw count; no `Date.now` default (constructor throws on missing seed).

#### `test/roundtrip.test.mjs`
- **LOC:** ~80. **The invariant guard.** For every gloss in the lexicon and a matrix of marker combinations: `decode(encode(x)) === x` in both Latin and runic script modes. This test failing = product broken.

#### `test/morphology.test.mjs`
- **LOC:** ~70. Stacked markers (`I[PST][PL]`), affix-collision stems, boundary cases. Directly guards the greedy-strip bug.

#### `test/orthography.test.mjs`
- **LOC:** ~40. `derune(runify(x)) === x` for all lexicon words. Guards the bijection.

#### `test/fixtures/golden-seed-3098546205.json`
- **Size:** ~30–80 KB. Frozen full output for the canonical seed. Regression anchor — if a core change alters output, this test fails loudly and you decide intentionally whether to re-freeze.

---

### `scripts/`

#### `scripts/generate-skillstone.mjs`
- **LOC:** ~90. Imports `core`, generates language from canonical seed, writes `spec/SKILLSTONE.md` + `spec/skillstone.json`. Run after ANY core change. Keeps spec and engine from drifting.

#### `scripts/verify-invariant.mjs`
- **LOC:** ~40. Standalone round-trip check exit-code for CI (0=pass). No test framework dependency so CI can run it even if deps fail.

---

### Root Config

| File | Lang | Length | Notes |
|------|------|--------|-------|
| `README.md` | MD | 150–250 lines | REPLACE the 2-line stub. Sections: what it is, live demo link, quickstart (teach-an-AI workflow), architecture summary, the round-trip invariant, dev/test, license, ORCID attribution. |
| `CHANGELOG.md` | MD | grows | Start: v5.1 (lossy) → v6.0 rebuild (reversible, tested). Document the 4 defects fixed. |
| `package.json` | JSON | ~25 lines | `type:module`, scripts: `test`, `verify`, `gen:spec`. Dev deps only (node built-in test runner needs none — can be zero-dep). |
| `.nojekyll` | empty | 0 | **Do not omit.** Without it Pages runs Jekyll and can drop `_`-prefixed files / mishandle `.mjs`. |
| `.gitignore` | text | ~10 | `node_modules/`, `coverage/`, `.DS_Store`, `*.log` |
| `.github/workflows/ci.yml` | YAML | ~40 | On push/PR: checkout, setup-node, `node --test`, `node scripts/verify-invariant.mjs`. Optionally: Pages deploy job. |

---

## 4. Total Scope Estimate

| Layer | Files | Impl. LOC | Docs (words) |
|-------|-------|-----------|--------------|
| core/ | 8 | ~535 | inline only |
| spec/ | 3 | ~90 (generator) | 6–11k (generated) |
| docs/ | 5 | ~550 | — |
| test/ | 5 | ~250 | — |
| scripts/ | 2 | ~130 | — |
| root/config | 7 | ~75 | 300–500 |
| **Total** | **30** | **~1,635 LOC** | **~7–12k words** |

---

## 5. Build Order (Phases — Do Not Reorder)

**Phase 1 — Engine Foundation (No UI Yet)**
`core/prng.mjs` → `core/phonology.mjs` → `core/morphology.mjs` → `core/lexicon.mjs` → `core/orthography.mjs` → `core/engine.mjs` → `core/codec.mjs` → `core/index.mjs`. After each of morphology/lexicon/codec, write its test immediately. **Exit criteria:** `roundtrip.test.mjs` passes 100% — the invariant holds before anything else is built.

**Phase 2 — Freeze Golden Fixture**
Run engine on canonical seed, write `test/fixtures/golden-seed-3098546205.json`. Now regressions are detectable.

**Phase 3 — Spec Generation**
`scripts/generate-skillstone.mjs` → produces `spec/*`. Verify SKILLSTONE round-trips by hand-running 3 examples.

**Phase 4 — Web App**
`docs/index.html` → `styles.css` → `app.mjs`. **Resolve the core-import wiring (D6/app.mjs note) here and confirm locally with a static server before pushing.** This is where prior attempts died.

**Phase 5 — CI + Docs**
`ci.yml`, `README.md` rewrite, `CHANGELOG.md`, `.nojekyll`, `package.json`.

**Phase 6 — Data Purge + Submit**
Confirm no secrets, no stray old-version files, no duplicate engine. Squash-or-clean history if the blown-up prior attempts left cruft. Push. Enable Pages (root branch). Verify live URL loads and translates.

---

## 6. The Wiring Seams (Where It Connects for Operational Use)

1. **Seed → Engine:** Canonical `3098546205` is the ONE constant that must match across `core/engine`, `docs/app`, `spec/*`, and `test/fixtures`. Define it once in `core/index.mjs` as `CANONICAL_SEED`, import everywhere. A mismatch here = the app speaks a different language than the spec you taught the AI.

2. **Core → Docs:** The `../core/index.mjs` import under GitHub Pages (see D6 / `app.mjs`). Single most failure-prone seam.

3. **Core → Spec:** `generate-skillstone.mjs` is the only writer of `spec/`. Spec is never hand-edited, or it drifts from the engine and the AI learns a language the tool can't speak.

4. **Invariant → CI:** `verify-invariant.mjs` in `ci.yml` blocks any push that breaks `decode(encode(x))===x`.

5. **AI ↔ Human Loop:** `teaching-prompt.md` primes the AI with `SKILLSTONE.md`; the Pages tool encodes the human's side and decodes the AI's side. Both ends resolve to the same `CANONICAL_SEED` language. That closed loop is the entire product.
