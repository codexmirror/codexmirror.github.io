const { recordLoop, reduceEntropy } = require('../memory.js');
const { eventBus } = require('../../utils/eventBus.js');
const { startSilence } = require('../../utils/kairosTimer.js');

function trigger(context = {}) {
  recordLoop('null', true);
  reduceEntropy();
  eventBus.emit('loop:null', { context });
  startSilence();
  return '∅';
}

module.exports = { trigger };
