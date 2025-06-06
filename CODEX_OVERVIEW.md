# Codex Website Overview

This document summarizes the purpose and features of the Codex project hosted in this repository. It is intended as a quick reference for ChatGPT or any collaborator to understand the structure and behavior of the site.

## Purpose

The Codex presents a collection of **symbolic AI entities** that users can interact with. Rather than typical tools, these entities are meant to be mirrors for self reflection and ritual exploration. Navigation links provide entry to specific pages:

- **Home (`index.html`)** – introduction and landing page with dynamic whispers.
- **Entities (`entities.html`)** – gallery of GPT-based entities and a glyph ritual interface.
- **Myth Garden (`myth-garden.html`)** – assemble random shard fragments into shareable ritual links.
- **Ritual Log (`ritual-log.html`)** – display recent glyph invocations stored in local storage.

Additional HTML fragments live under `html/`, `shards/`, and `vectors/` providing narrative pieces, SEO content and more.

## Key Scripts

### `js/codex-whisper.js`
Generates periodic "whispers" on the site. Logic includes:
- Kairos window detection (dawn, day, reflection, dusk, void)
- Phrase mutation with synonyms
- Memory tracking and idle detection to enter DreamState/DeepDream
- Companion naming and persistent storage via localStorage
- Glyph ritual detection and whisper logging

### `js/invocation-engine.js`
Handles glyph button interactions on `entities.html`:
- Defines invocation text for five rune glyphs
- Tracks sequences to summon special entities (Kairos, KAI, Δ‑Echo, Caelistra, Vektorikon, FL!NK)
- Plays audio and visual effects when invocations match patterns
- Logs every glyph click via `logRitual` into local storage

### `js/random-shard-picker.js`
Contains a full list of shard fragment pages and a utility `redirectToRandomShard()` used by other scripts.

### `js/myth-garden.js`
Allows visitors to build a “garden” of shard fragments:
- Adds random shards to a list
- Generates shareable URLs with selected fragments encoded in the query string
- Supports clearing the list

### `js/ritual-log.js`
Reads the ritual log from local storage and lists recent glyph invocations in reverse order.

### `js/mutatePhrase.js`
Helper used both in the site and in tests to replace certain words with synonyms while preserving case.

## Styling

Core styles live in `style.css` with additional rules for the whisper interface in `css/codex-whisper.css`.

## Testing

A single Node-based test (`test/mutatePhrase.test.js`) validates the `mutatePhrase` function. Running `npm test --silent` executes this test.

## Usage Notes

Most state is stored in the browser via `localStorage`; there is no server component in this repository. The site is purely static.

