const { resetProfile, triggerMirrorBloom, getSigilArchive } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
triggerMirrorBloom();
if(getSigilArchive().length === 0) throw new Error('mirror bloom missing');
console.log('mirror bloom tests passed');
