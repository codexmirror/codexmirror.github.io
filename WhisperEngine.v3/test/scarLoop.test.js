const { resetProfile, recordScarLoop, isScarred } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
for(let i=0;i<3;i++) recordScarLoop(['1','1']);
if(!isScarred(['1','1'])) throw new Error('scar loop missing');
console.log('scar loop tests passed');
