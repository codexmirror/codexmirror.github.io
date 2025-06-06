const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Witness');
  recordLoop('quiet', success);
  if (success) reduceEntropy();
  eventBus.emit('loop:quiet', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'quiet'}`;
}

module.exports = { trigger };
