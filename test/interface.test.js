const { eventBus } = require('../WhisperEngine.v3/utils/eventBus');
const ritualBar = require('../interface/ritualBar');
const whisperEchoes = require('../interface/whisperEchoes');
const invocationUI = require('../interface/invocationUI');
let fired = false;
ritualBar.init();
whisperEchoes.setDiagnostic(true);
whisperEchoes.init();
const cards = [
  { id: 'caelistra-card', classList: { toggle: (cls, hide) => { cards[0].hidden = hide; } }, hidden: true },
  { id: 'vektorikon-card', classList: { toggle: () => {} }, hidden: true }
];
global.document = { querySelectorAll: sel => (sel === '.entity-card.summoned' ? cards : []) };
invocationUI.init();
eventBus.on('loop:invocation', () => { fired = true; });
eventBus.emit('loop:invocation', {});
eventBus.emit('whisper', { text: 'hi', level: 1 });
eventBus.emit('entity:summon', { name: 'Caelistra' });
if (cards[0].hidden) throw new Error('invocationUI did not reveal card');
if (!fired) throw new Error('ritualBar did not react');
if (whisperEchoes.snapshots.length !== 1 || whisperEchoes.snapshots[0].level !== 1) throw new Error('diagnostic snapshot missing');
console.log('interface tests passed');
