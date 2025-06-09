const assert = require('assert');
const { resetProfile, recordEntitySummon, loadProfile } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
recordEntitySummon('Caelistra', ['1','2','3']);
recordEntitySummon('Caelistra', ['1','2','3']);
recordEntitySummon('Caelistra', ['1','2','3']);
const prof = loadProfile();
assert.ok(prof.possessedEntity === 'Caelistra', 'entity possession recorded');
console.log('entity possession tests passed');
