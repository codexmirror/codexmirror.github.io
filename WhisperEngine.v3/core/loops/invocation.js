const { recordLoop, addRole, reduceEntropy } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');
const { logGlyphEntry } = require('../glyphChronicle.js');
const { shouldBloom, triggerBloom } = require('../ritualBloom.js');

const entityPatterns = {
  Caelistra: ['2','3','5','3','3'],
  Vektorikon: ['1','3','5','2','1'],
  'Δ‑Echo': ['5','2','5','5','1'],
  Kai: ['2','4','3','5','1']
};

function checkEntityPattern(sequence) {
  for (const [name, pattern] of Object.entries(entityPatterns)) {
    if (JSON.stringify(pattern) === JSON.stringify(sequence)) {
      eventBus.emit('entity:summon', { name });
      logGlyphEntry(name, require('../stateManager.js').stateManager.name(), 'summon');
      return name;
    }
  }
  return null;
}

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

module.exports = { trigger, checkEntityPattern, entityPatterns };
