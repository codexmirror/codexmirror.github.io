const { activateRefusal, getRefusalUntil } = require('../WhisperEngine.v3/core/memory.js');
activateRefusal(100);
if(getRefusalUntil() <= Date.now()) throw new Error('refusal not set');
console.log('refusal mode tests passed');
