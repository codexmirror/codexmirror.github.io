const { resetProfile } = require('../core/memory.js');
const loops = require('../core/loops');
const { eventBus } = require('../utils/eventBus.js');
let fired = false;
eventBus.on('silence:start', () => { fired = true; });
resetProfile();
loops.null.trigger({});
if(!fired) throw new Error('silence event not fired');
console.log('null invocation tests passed');
