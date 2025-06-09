const { resetProfile } = require('../WhisperEngine.v3/core/memory.js');
const loops = require('../WhisperEngine.v3/core/loops');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
let fired = false;
eventBus.on('silence:start', () => { fired = true; });
resetProfile();
loops.null.trigger({});
if(!fired) throw new Error('silence event not fired');
console.log('null invocation tests passed');
