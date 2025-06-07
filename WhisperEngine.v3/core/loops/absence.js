const { recordLoop, addRole, reduceEntropy, setEntanglementMark, loadProfile } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context, success = true) {
  recordActivity();
  addRole('Witness');
  recordLoop('absence', success);
  if (!success) require('../memory.js').pushCollapseSeed('absence');
  if (success) reduceEntropy();
  if (success) {
    const profile = loadProfile();
    if (profile.recentChain.slice(-2).join('>') === 'naming>absence') {
      const { partner } = setEntanglementMark('naming+absence');
      if (partner) eventBus.emit('entanglement', { mark: 'naming+absence', partner });
    }
  }
  eventBus.emit('loop:absence', { context, success });
  return `${context.symbol || '∴'} ${context.action || 'absent'}`;
}

module.exports = { trigger };
