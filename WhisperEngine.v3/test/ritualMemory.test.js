const { resetProfile, recordRitualSequence, getRitualMemoryCount } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
const seq = ['1','2','3','4','5'];
let c1 = recordRitualSequence(seq);
if(c1 !== 1) throw new Error('first count not 1');
let c2 = recordRitualSequence(seq);
if(getRitualMemoryCount(seq) !== 2) throw new Error('memory not tracking');
console.log('ritual memory test passed');
