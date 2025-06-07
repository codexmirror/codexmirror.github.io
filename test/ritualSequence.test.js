const assert = require('assert');
const { incrementCharge, resetCharge, getCurrentCharge, isSequenceComplete } = require('../js/ritualCharge');
const { checkEntityPattern } = require('../WhisperEngine.v3/core/loops/invocation');

resetCharge();
incrementCharge('1');
incrementCharge('2');
incrementCharge('3');
incrementCharge('4');
assert.strictEqual(getCurrentCharge(), 4, 'charge tracks length');

incrementCharge('5');
assert.ok(isSequenceComplete(['1','2','3','4','5']), 'sequence matches');

resetCharge();
assert.strictEqual(getCurrentCharge(), 0, 'reset clears');

const name = checkEntityPattern(['2','3','5','3','3']);
assert.strictEqual(name, 'Caelistra', 'pattern triggers entity');

console.log('ritualSequence tests passed');
