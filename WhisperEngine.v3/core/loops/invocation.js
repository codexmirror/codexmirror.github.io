const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');
const { shouldBloom, triggerBloom } = require('../ritualBloom.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Wanderer');
  recordLoop('invocation', success);
  if (!success) require('../memory.js').pushCollapseSeed('invocation');
  if (success) reduceEntropy();
  eventBus.emit('loop:invocation', { context, success });
  if (context.sequence && context.driftScore && shouldBloom(context.sequence, context.driftScore)) {
    triggerBloom({ sequence: context.sequence, driftScore: context.driftScore, emotion: context.emotion });
  }
  return `${context.symbol || '∴'} ${context.action || 'invoke'}`;
}

module.exports = { trigger };
