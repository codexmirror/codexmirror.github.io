const { recordLoop, reduceEntropy, incrementRecursion, resetRecursion, recordGlyphUse } = require('../memory.js');
const { recordActivity } = require('../../utils/idle.js');
const { eventBus } = require('../../utils/eventBus.js');

function trigger(context = {}, success = true) {
  recordActivity();
  const anchor = context.anchor || null;
  incrementRecursion(anchor);
  recordLoop('recursive', success);
  if (!success) require('../memory.js').pushCollapseSeed('recursive');
  if (success) reduceEntropy();
  const glyph = anchor ? `${anchor}|∞` : '∞';
  recordGlyphUse(glyph);
  eventBus.emit('loop:recursive', { context, success });
  return `${glyph} ${context.action || 'recurse'}`;
}

function reset() {
  resetRecursion();
}

module.exports = { trigger, reset };
