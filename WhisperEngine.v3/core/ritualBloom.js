const { playChime } = require('../utils/tonalGlyphs.js');
const { logGlyphEntry } = require('./glyphChronicle.js');
const { stateManager } = require('./stateManager.js');
const memory = require('./memory.js');
const { eventBus } = require('../utils/eventBus.js');

const emotionalKeys = ['fractured', 'sacred', 'longing'];

function hasEmotion(seq) {
  const str = Array.isArray(seq) ? seq.join(' ').toLowerCase() : String(seq).toLowerCase();
  return emotionalKeys.some(k => str.includes(k));
}

function rarityGate(entropy) {
  const chance = Math.max(0.01, 0.1 - (entropy || 0) * 0.01);
  return Math.random() < chance;
}

function shouldBloom(sequence, driftScore) {
  if (typeof driftScore !== 'number') return false;
  if (driftScore < 0.7 || driftScore > 0.9) return false;
  if (!hasEmotion(sequence)) return false;
  const profile = memory.loadProfile();
  return rarityGate(profile.entropy);
}

function triggerBloom(context = {}) {
  const persona = stateManager.name();
  const info = {
    sequence: context.sequence || [],
    driftScore: context.driftScore || 0,
    persona,
    emotion: context.emotion || 'bloom',
    time: Date.now()
  };
  logGlyphEntry('bloom', persona, info.emotion);
  if (playChime) playChime('bloom');
  if (memory && memory.recordBloom) memory.recordBloom(info);
  eventBus.emit('ritual:bloom', info);
  return info;
}

module.exports = { shouldBloom, triggerBloom };
