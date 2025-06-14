const assert = require('assert');
const { resetProfile, resetRecursion, loadProfile } = require('../WhisperEngine.v3/core/memory.js');
const recursive = require('../WhisperEngine.v3/core/loops/recursive.js');

resetProfile();
resetRecursion();
recursive.trigger({ anchor: 'alpha' });
recursive.trigger({ anchor: 'beta' });
assert.strictEqual(loadProfile().recursionDepth, 2, 'recursion depth increments');
recursive.reset();
assert.strictEqual(loadProfile().recursionDepth, 0, 'recursion depth resets');
console.log('recursive loop tests passed');
