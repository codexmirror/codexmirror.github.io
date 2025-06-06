const assert = require('assert');
const { mutatePhrase, setSynonymDrift } = require('../js/mutatePhrase');

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

console.log('mutatePhrase tests passed');

