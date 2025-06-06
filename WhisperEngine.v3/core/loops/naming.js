const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Binder');
  recordLoop('naming', success);
  if (success) reduceEntropy();
  eventBus.emit('loop:naming', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'name'}`;
}

module.exports = { trigger };
