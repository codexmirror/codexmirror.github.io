const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Witness');
  recordLoop('absence', success);
  if (success) reduceEntropy();
  eventBus.emit('loop:absence', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'absent'}`;
}

module.exports = { trigger };
