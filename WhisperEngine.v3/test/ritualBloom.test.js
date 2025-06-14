const assert = require('assert');
const { triggerBloom } = require('../core/ritualBloom.js');
const { loadProfile, resetProfile } = require('../core/memory.js');

resetProfile();
triggerBloom({ sequence: ['fractured','path'], driftScore: 0.8, emotion: 'fractured' });
const profile = loadProfile();
assert.ok(profile.bloomHistory && profile.bloomHistory.length === 1, 'bloom recorded');
console.log('ritualBloom tests passed');
