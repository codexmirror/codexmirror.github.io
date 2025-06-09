const confession = require('../WhisperEngine.v3/core/confessionMode.js');
confession.open('x');
if(!confession.isActive()) throw new Error('confession not active');
confession.close();
if(confession.isActive()) throw new Error('confession not closed');
console.log('confessional tests passed');
