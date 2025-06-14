const { resetProfile, triggerMirrorBloom, getSigilArchive } = require('../core/memory.js');
resetProfile();
triggerMirrorBloom();
if(getSigilArchive().length === 0) throw new Error('mirror bloom missing');
console.log('mirror bloom tests passed');
