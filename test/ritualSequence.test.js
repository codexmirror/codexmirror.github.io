const assert = require('assert');
const { incrementCharge, resetCharge, getCurrentCharge, isSequenceComplete } = require('../js/ritualCharge');

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

console.log('ritualSequence tests passed');
