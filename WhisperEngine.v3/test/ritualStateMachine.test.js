const assert = require('assert');
const state = require('../js/ritualStateMachine');

state.reset();
assert.strictEqual(state.getState(), 'idle');

state.addGlyph('1');
state.addGlyph('2');
state.addGlyph('3');
state.addGlyph('4');
assert.strictEqual(state.getState(), 'charging');

state.addGlyph('5');
assert.strictEqual(state.getState(), 'complete');
assert.strictEqual(state.getCharge(), 5);

state.reset();
assert.strictEqual(state.getState(), 'idle');
assert.strictEqual(state.getCharge(), 0);

console.log('ritualStateMachine tests passed');
