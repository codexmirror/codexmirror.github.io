const assert = require('assert');
const { recordLoop, loadProfile, recordGlyphUse, resetProfile } = require('../WhisperEngine.v3/core/memory.js');
const invocation = require('../WhisperEngine.v3/core/loops/invocation');

const before = loadProfile();
recordLoop('invocation');
const after = loadProfile();
assert.strictEqual(after.glyphHistory.length, before.glyphHistory.length + 1, 'glyphHistory increased');

recordGlyphUse('void-23');
const myth = loadProfile().mythMatrix.find(g => g.name === 'void-23');
assert.ok(myth && myth.resonanceScore === 1, 'mythMatrix updated');

resetProfile();
invocation.trigger({});
const profileWithRole = loadProfile();
assert.ok(profileWithRole.roles.includes('Wanderer'), 'role added on invocation');
console.log('memory tests passed');
