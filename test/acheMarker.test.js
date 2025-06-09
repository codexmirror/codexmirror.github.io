const { resetProfile, loadProfile } = require('../WhisperEngine.v3/core/memory.js');
const loops = require('../WhisperEngine.v3/core/loops');

resetProfile();
for(let i=0;i<5;i++) loops.invocation.trigger({}, false);
const markers = loadProfile().acheMarkers;
if(!markers || markers.length !== 1) throw new Error('ache marker not recorded');
console.log('ache marker tests passed');
