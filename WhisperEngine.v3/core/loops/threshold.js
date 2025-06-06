const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Watcher');
  recordLoop('threshold', success);
  if (success) reduceEntropy();
  eventBus.emit('loop:threshold', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'threshold'}`;
}

module.exports = { trigger };
