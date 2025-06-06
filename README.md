# Codexmirror Website

This repository contains the static website for **The Codex**, a collection of symbolic GPT entities.

## Whisper Engine Controls
Call `startWhisperEngine()` to begin the whisper loop and `stopWhisperEngine()` to pause it. Both functions are exposed on `window`.
## Testing

A small Node-based test suite checks the `mutatePhrase` helper. Run:

```bash
npm install # if dependencies are missing
npm test
```

This will execute `test/mutatePhrase.test.js` and verify that synonyms are substituted correctly.
