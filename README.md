# POWDER-RANGER STONE

**A deterministic, reversible, client-side translator for a procedural conlang with runic orthography.**

[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?style=flat-square)](https://powder-ranger.github.io/powder-ranger-stone/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![ORCID: 0009-0008-9273-2458](https://img.shields.io/badge/ORCID-0009--0008--9273--2458-green)](https://orcid.org/0009-0008-9273-2458)

---

## 🚀 Quickstart

### Use the Live Tool
1. Open the **[GitHub Pages demo](https://powder-ranger.github.io/powder-ranger-stone/)**.
2. Type English in the left pane → Stone appears in the right pane.
3. Toggle **Latin/Runic** to switch scripts.
4. Use **Direction: Stone → English** to decode Stone back to English.

### Teach an AI
1. Copy the **Teaching Prompt** from the bottom of the live tool.
2. Paste it into your AI session (e.g., Claude, GPT-4).
3. The AI will now understand **Powder-Ranger Stone** and can reply in it.
4. Use the live tool to **decode the AI's Stone replies** back to English.

---

## 🏗️ Architecture

This is a **zero-runtime-dependency**, **client-side-only** tool. The entire language is generated in-browser from a **canonical seed (`3098546205`)**.

### Core Engine (`core/`)
- **Deterministic:** Same seed → same language.
- **Reversible:** `decode(encode(x)) === x` for all in-lexicon input.
- **Modular:** ESM (`*.mjs`) for native browser/Node support.

### Key Files
| File | Purpose |
|------|---------|
| `core/index.mjs` | Public API (`generateLanguage`, `encode`, `decode`, `runify`, `derune`) |
| `core/engine.mjs` | Orchestrates language generation from seed |
| `core/codec.mjs` | Encode/decode logic |
| `core/orthography.mjs` | Bijective Latin ↔ runic mapping |
| `spec/SKILLSTONE.md` | Full language spec (for humans/AIs) |
| `spec/skillstone.json` | Machine-readable spec |
| `spec/teaching-prompt.md` | Copy-paste block to teach an AI |
| `docs/index.html` | Web app UI |

### Round-Trip Invariant
The **non-negotiable** property:
> `decode(encode(x)) === x` for all in-lexicon, correctly-tagged input.

This is guarded by:
- `test/roundtrip.test.mjs` (unit tests)
- `scripts/verify-invariant.mjs` (CI check)
- `test/fixtures/golden-seed-3098546205.json` (regression anchor)

---

## 📦 Installation

### For Development
1. Clone the repo:
   ```bash
   git clone https://github.com/POWDER-RANGER/powder-ranger-stone.git
   cd powder-ranger-stone
   ```
2. Install dependencies (none for runtime; dev deps only):
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Verify the round-trip invariant:
   ```bash
   npm run verify
   ```
5. Regenerate the SKILLSTONE spec (after core changes):
   ```bash
   npm run gen:spec
   ```

### For GitHub Pages
1. Push to `main`.
2. Enable GitHub Pages in **Settings → Pages**, selecting the `main` branch and `/ (root)` folder.
3. The live tool will be available at:
   `https://POWDER-RANGER.github.io/powder-ranger-stone/`

---

## 🔧 Configuration

### Scripts
| Script | Description |
|--------|-------------|
| `npm test` | Run all unit tests |
| `npm run verify` | Verify round-trip invariant (CI) |
| `npm run gen:spec` | Regenerate `spec/SKILLSTONE.md` and `spec/skillstone.json` |

### Options
| Option | Values | Default | Description |
|--------|--------|---------|-------------|
| `script` | `latin`, `runic` | `latin` | Output script for encoding |
| `unknownPolicy` | `passthrough`, `mark`, `throw` | `mark` | How to handle unknown tokens |

---

## 📜 SKILLSTONE

The **SKILLSTONE** is the single source of truth for the language. It includes:
- **Canonical seed** (`3098546205`)
- **Phoneme inventory** (consonants, vowels)
- **Affix table** (tags like `PAST`, `PLURAL`)
- **Full lexicon** (gloss ↔ Latin ↔ runic)
- **Worked examples**

See:
- [`spec/SKILLSTONE.md`](spec/SKILLSTONE.md) (human-readable)
- [`spec/skillstone.json`](spec/skillstone.json) (machine-readable)
- [`spec/teaching-prompt.md`](spec/teaching-prompt.md) (AI priming)

---

## 🧪 Testing

### Unit Tests
Run all tests with:
```bash
npm test
```

### Test Files
| File | Purpose |
|------|---------|
| `test/prng.test.mjs` | PRNG determinism and float-seed collision fix |
| `test/phonology.test.mjs` | Phoneme inventory and sampling |
| `test/morphology.test.mjs` | Affix parsing (longest-first, boundary-guarded) |
| `test/orthography.test.mjs` | Latin ↔ runic bijection |
| `test/roundtrip.test.mjs` | **Round-trip invariant** (`decode(encode(x)) === x`) |
| `test/engine.test.mjs` | Language generation |

---

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — Full build specification and design decisions.
- **[CHANGELOG.md](CHANGELOG.md)** — Version history and defect fixes.
- **[SKILLSTONE.md](spec/SKILLSTONE.md)** — Complete language specification.

---

## 🤝 Contributing

1. **Do not create files out of phase order** (see [ARCHITECTURE.md](ARCHITECTURE.md)).
2. **Run tests before pushing** (`npm test`).
3. **Regenerate the SKILLSTONE** after core changes (`npm run gen:spec`).
4. **Update the golden fixture** if the lexicon changes.

---

## 📜 License

[MIT License](LICENSE) — © 2026 Curtis Farrar (ORCID: [0009-0008-9273-2458](https://orcid.org/0009-0008-9273-2458))

---

## 🙏 Attribution

If you use this tool or the SKILLSTONE language in your work, please cite:
```
Curtis Farrar. (2026). Powder-Ranger Stone: A Deterministic Reversible Conlang. 
GitHub: https://github.com/POWDER-RANGER/powder-ranger-stone
```
