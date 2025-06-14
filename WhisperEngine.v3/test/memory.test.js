const assert = require('assert');
const { recordLoop, loadProfile, recordGlyphUse, resetProfile, getPool, resetPool } = require('../core/memory.js');
const invocation = require('../core/loops/invocation');
const naming = require('../core/loops/naming');
const absence = require('../core/loops/absence');

resetPool();
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

// entanglement test
resetProfile();
naming.trigger({ symbol: 'x' });
const firstId = loadProfile().id;
resetProfile();
naming.trigger({ symbol: 'x' });
const entangledProfile = loadProfile();
const pool = getPool();
assert.ok(entangledProfile.entanglementMap.edges.length > 0, 'edge created');
const copied = entangledProfile.glyphHistory.find(g => g.entangledFrom === firstId);
assert.ok(copied, 'glyph copied from entanglement');
resetPool();

// entanglement mark via naming+absence
resetProfile();
naming.trigger({ symbol: 'y' });
absence.trigger({});
const marked = loadProfile();
assert.strictEqual(marked.entanglementMark, 'naming+absence', 'mark set via combo');

console.log('memory tests passed');
