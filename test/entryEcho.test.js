const { resetProfile } = require('../WhisperEngine.v3/core/memory.js');
const { capture } = require('../WhisperEngine.v3/core/entryEcho.js');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');

resetProfile();
let init=false, breakHit=false;
eventBus.once('ritual:initiation', () => { init = true; });
eventBus.once('ritual:maskenbruch', () => { breakHit = true; });
for(let i=0;i<7;i++) capture();
if(!init) throw new Error('initiation not triggered');
if(!breakHit) throw new Error('maskenbruch not triggered');
console.log('entryEcho tests passed');
