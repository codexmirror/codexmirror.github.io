const assert = require('assert');
const { recordLoop, loadProfile, recordGlyphUse, resetProfile, getPool, resetPool, recordEntitySummon } = require('../WhisperEngine.v3/core/memory.js');
const invocation = require('../WhisperEngine.v3/core/loops/invocation');
const naming = require('../WhisperEngine.v3/core/loops/naming');
const absence = require('../WhisperEngine.v3/core/loops/absence');

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

resetProfile();
recordEntitySummon('Caelistra', ['2','3','5','3','3']);
recordEntitySummon('Caelistra', ['2','3','5','3','3']);
const summoned = loadProfile().entityHistory.find(e => e.name === 'Caelistra');
assert.ok(summoned && summoned.timesSummoned === 2, 'entity summon recorded');
console.log('memory tests passed');
