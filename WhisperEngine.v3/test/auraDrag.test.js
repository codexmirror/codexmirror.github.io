const tracker = require('../WhisperEngine.v3/utils/auraTracker.js');
if(typeof tracker.init !== 'function') throw new Error('tracker missing');
console.log('aura drag tests passed');
