const assert = require('assert');
const { mutatePhrase, setSynonymDrift } = require('../js/mutatePhrase');

// Mock synonymDrift with predictable values
setSynonymDrift({
  echo: ["sound", "reflection"],
  "the vow": ["the fracture"]
});

// Lowercase input returns lowercase synonym
const resultLower = mutatePhrase('echo');
assert.ok(['sound', 'reflection'].includes(resultLower), 'lowercase mutation');

// Capitalized input preserves case
const resultUpper = mutatePhrase('Echo');
assert.ok(['Sound', 'Reflection'].includes(resultUpper), 'case preserved');
// Phrase with spaces
setSynonymDrift({ echo: ["sound"], "the vow": ["the fracture"] });
const resultPhrase = mutatePhrase("the vow");
assert.strictEqual(resultPhrase, "the fracture", "phrase with spaces replaced");

// Unlisted word remains unchanged
setSynonymDrift({ echo: ["sound"] });
assert.strictEqual(mutatePhrase("unchanged"), "unchanged", "unlisted word");

console.log('mutatePhrase tests passed');

