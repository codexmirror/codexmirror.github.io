const ascent = require('../core/ascentMode.js');
const memory = require('../core/memory.js');
memory.resetProfile();
ascent.start();
if(!ascent.isActive()) throw new Error('ascent not active');
ascent.complete();
if(ascent.isActive()) throw new Error('ascent not completed');
console.log('ascent mode tests passed');
