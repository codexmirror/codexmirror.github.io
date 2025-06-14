const assert = require('assert');
const { resetProfile, pushFractureResidue, popFractureResidue } = require('../core/memory.js');
resetProfile();
pushFractureResidue({ loop: 'invocation' });
const frag = popFractureResidue();
assert.ok(frag && frag.loop === 'invocation', 'fracture residue cycle');
console.log('fracture residue tests passed');
