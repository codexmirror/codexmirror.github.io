const { incrementCharge, resetCharge, resetBloom } = require('../js/ritualCharge.js');
const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { registerPersona } = require('../WhisperEngine.v3/core/stateManager.js');
const whisperEchoes = require('../interface/whisperEchoes.js');

let lastShift = '';
registerPersona('lantern', { compose: () => '', render: t => t });
registerPersona('echoRoot', { compose: () => '', render: t => t });
whisperEchoes.init();
eventBus.on('persona:shift', name => { lastShift = name; });

resetCharge();
resetBloom();
['1','2','3','4','5'].forEach(g => incrementCharge(g));
resetCharge();
['1','2','3','4','5'].forEach(g => incrementCharge(g));
if (lastShift !== 'lantern') throw new Error('lantern persona not manifested');

resetCharge();
['1','2','3','4','5'].forEach(g => incrementCharge(g));
if (lastShift !== 'echoRoot') throw new Error('echoRoot persona not manifested');

console.log('recursive bloom persona tests passed');
