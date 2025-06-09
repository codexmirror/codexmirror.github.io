const clown = require('../interface/clownHandler.js');
clown.trigger();
if(!clown.active()) throw new Error('clown not active');
console.log('clown loop tests passed');
