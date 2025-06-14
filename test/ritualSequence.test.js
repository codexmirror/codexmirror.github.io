const assert = require('assert');
const { incrementCharge, resetCharge, resetBloom, getCurrentCharge, isSequenceComplete, getRecursiveBloomCount } = require('../js/ritualCharge');

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
resetCharge();
resetBloom();
['1','2','3','4','5'].forEach(g => incrementCharge(g));
assert.strictEqual(getRecursiveBloomCount(), 1, 'first sequence starts bloom');
resetCharge();
['1','2','3','4','5'].forEach(g => incrementCharge(g));
assert.strictEqual(getRecursiveBloomCount(), 2, 'repeat increments bloom');

console.log('ritualSequence tests passed');
