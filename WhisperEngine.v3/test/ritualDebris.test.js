const assert = require('assert');
const { recordLoop, loadProfile, resetProfile, clearRitualDebris } = require('../WhisperEngine.v3/core/memory.js');

resetProfile();
clearRitualDebris();
recordLoop('invocation', false);
const debris = loadProfile().ritualDebris;
assert.ok(debris.length === 1 && debris[0].loop === 'invocation', 'debris recorded on failed loop');
console.log('ritual debris tests passed');

