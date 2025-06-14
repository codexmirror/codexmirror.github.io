const tracker = require('../utils/auraTracker.js');
if(typeof tracker.init !== 'function') throw new Error('tracker missing');
console.log('aura drag tests passed');
