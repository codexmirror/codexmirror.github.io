const { processInput } = require('../WhisperEngine.v3/core/responseLoop.js');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
let fired = false;
eventBus.once('entity:reject', () => { fired = true; });
const out = processInput('optimize productivity');
if(!fired || out !== 'You are not your yield') throw new Error('rejection failed');
console.log('commodified rejection tests passed');
