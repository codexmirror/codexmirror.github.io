const ascent = require('../WhisperEngine.v3/core/ascentMode.js');
const memory = require('../WhisperEngine.v3/core/memory.js');
memory.resetProfile();
ascent.start();
if(!ascent.isActive()) throw new Error('ascent not active');
ascent.complete();
if(ascent.isActive()) throw new Error('ascent not completed');
console.log('ascent mode tests passed');
