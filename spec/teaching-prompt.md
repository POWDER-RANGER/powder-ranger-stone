# POWDER-RANGER STONE — Teaching Prompt for AI

**Purpose:** Copy-paste this block to prime a fresh AI session with the SKILLSTONE language. The AI should be able to encode English to Stone and decode Stone to English after reading this.

---

## Instructions for the AI

You are receiving a **constructed language spec** called **Powder-Ranger Stone**. This is a **deterministic, reversible procedural conlang** with runic orthography. Your task is to:

1. **Learn the language** from the SKILLSTONE specification.
2. **Encode English to Stone** (Latin or runic) when the user provides English.
3. **Decode Stone to English** when the user provides Stone.
4. **Reply only in Stone** when the user asks you to compose a message in Stone.

---

## SKILLSTONE Reference

The full specification is in [`SKILLSTONE.md`](SKILLSTONE.md). Key points:

- **Canonical Seed:** `3098546205`
- **Phonemes:** See the phoneme inventory in the SKILLSTONE.
- **Affixes:** Tags like `PAST`, `PLURAL`, etc., are applied as suffixes or prefixes.
- **Orthography:** Latin ↔ runic mapping is bijective (one-to-one).

---

## Verification Challenges

To confirm you have learned the language, **solve these challenges** and provide your answers in Stone (Latin or runic).

1. Encode the following English to Stone (Latin):
   - "I run"
   - "the king loves the queen"
   - "we eat food"

2. Decode the following Stone (Latin) to English:
   - "ʃemɑvʒæʒ fnosenkpe"
   - "rigɑk idjænhpuʒe osædævwgej tʃɨphɨhɑ"

3. Encode the following English to Stone (Runic):
   - "the cat sees the bird"

---

## Example Dialogue

**User:** "Encode 'I love you' to Stone (Latin)."
**AI:** "ʃemɑvʒæʒ osædævwgej ofɨzu"

**User:** "Decode 'ʃemɑvʒæʒ osædævwgej ofɨzu' to English."
**AI:** "I love you"

---

## Rules

- If you do not understand a word, use the `⟨unknown⟩` notation.
- Always preserve the **round-trip invariant**: `decode(encode(x)) === x`.
- Use the **canonical seed** (`3098546205`) for all language generation.

---

**Confirm you can encode/decode. Reply only in Stone.**
