const assert = require('assert');
const { resetProfile, resetRecursion, loadProfile } = require('../core/memory.js');
const recursive = require('../core/loops/recursive.js');

resetProfile();
resetRecursion();
recursive.trigger({ anchor: 'alpha' });
recursive.trigger({ anchor: 'beta' });
assert.strictEqual(loadProfile().recursionDepth, 2, 'recursion depth increments');
recursive.reset();
assert.strictEqual(loadProfile().recursionDepth, 0, 'recursion depth resets');
console.log('recursive loop tests passed');
