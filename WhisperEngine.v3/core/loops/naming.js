const { recordLoop, addRole, reduceEntropy, attemptEntanglement } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Binder');
  recordLoop('naming', success);
  if (!success) require('../memory.js').pushCollapseSeed('naming');
  let ent = null;
  if (success) {
    reduceEntropy();
    const token = `naming:${context.symbol || '∴'}`;
    ent = attemptEntanglement(token, context.symbol || '∴');
  }
  eventBus.emit('loop:naming', { context, success });
  if (ent && ent.partner) eventBus.emit('entanglement', { mark: `naming:${context.symbol || '∴'}`, partner: ent.partner.profileId });
  return `${context.symbol || '∴'} ${context.action || 'name'}`;
}

module.exports = { trigger };
