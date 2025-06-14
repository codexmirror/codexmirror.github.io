const assert = require('assert');
const { mutatePhrase, mutatePhraseWithLevel, setSynonymDrift } = require('../js/mutatePhrase');

// Mock synonymDrift with predictable values
setSynonymDrift({
  echo: ['sound', 'reflection']
});

// Lowercase input returns lowercase synonym
const resultLower = mutatePhrase('echo');
assert.ok(['sound', 'reflection'].includes(resultLower), 'lowercase mutation');

// Capitalized input preserves case
const resultUpper = mutatePhrase('Echo');
assert.ok(['Sound', 'Reflection'].includes(resultUpper), 'case preserved');

const levelInfo = mutatePhraseWithLevel('echo echo');
assert.strictEqual(levelInfo.level, 2, 'mutation level counts replacements');

console.log('mutatePhrase tests passed');

