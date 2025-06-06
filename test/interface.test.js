const { eventBus } = require('../WhisperEngine.v3/utils/eventBus');
const ritualBar = require('../interface/ritualBar');
let fired = false;
ritualBar.init();
eventBus.on('loop:invocation', () => { fired = true; });
eventBus.emit('loop:invocation', {});
if (!fired) throw new Error('ritualBar did not react');
console.log('interface tests passed');
