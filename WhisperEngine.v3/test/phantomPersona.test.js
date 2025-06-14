const { resetProfile, recordPersonaShift, checkPhantomInfluence } = require('../WhisperEngine.v3/core/memory.js');
resetProfile();
recordPersonaShift('dream');
recordPersonaShift('watcher');
recordPersonaShift('archive');
if(!checkPhantomInfluence()) throw new Error('phantom not triggered');
console.log('phantom persona tests passed');
