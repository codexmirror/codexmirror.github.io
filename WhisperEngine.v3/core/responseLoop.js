const { stateManager } = require('./stateManager.js');
// persona modules invoke buildPhrase directly
const {
  recordVisit,
  recordLoop,
  recordGlyphUse,
  recordInput,
  popCollapseSeed,
  popFractureResidue,
  getMetaLevel,
  recordMetaInquiry,
  decayMetaInquiry
} = require('./memory.js');
const { recordActivity } = require('../utils/idle.js');
const { getKairosWindow } = require('../utils/kairos.js');
const { applyCloak } = require('../utils/cloak.js');
const { injectGlitch } = require('../utils/glitch.js');
const { eventBus } = require('../utils/eventBus.js');
const codexVoice = require('./codexVoice.js');
const { mutatePhraseWithLevel } = require('../utils/mutate.js');
const expressionCore = require('./expressionCore.js');

function composeWhisper(loopName, success = true) {
  const profile = recordVisit();
  if (loopName) recordLoop(loopName, success);
  recordActivity();
  stateManager.evaluate(profile);

  const personaName = stateManager.name();
  const context = {
    profile,
    kairos: getKairosWindow(),
    loop: loopName
  };
  const persona = stateManager.current();
  const composed = persona.compose(context);
  const level = context.mutationLevel || 0;
  let output = persona.render(composed, context);
  const seed = profile.collapseSeeds && profile.collapseSeeds.length > 0 ? popCollapseSeed() : null;
  const cloakLevel = Math.max(getMetaLevel(), personaName === 'parasite' ? 2 : 0);
  if (seed) {
    const depth = profile.collapseSeeds.length + 1;
    const prefix = '»'.repeat(depth) + ' ';
    let fractured = output.split('').map((ch, i) => (i % 2 === 0 ? ch : '∷')).join('');
    if (!fractured.includes('∷')) fractured += '∷';
    output = prefix + fractured;
  }
  output = applyCloak(output, cloakLevel);
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  const residue = popFractureResidue();
  if (residue && Math.random() < 0.5) {
    output += ' [' + residue.loop + ']';
  }
  output = expressionCore.processOutput(output, context);
  if (cloakLevel >= 2) eventBus.emit('cloak:max');
  console.log(`[${personaName}] ${output}`);
  const evt = context.codex ? 'codex:expression' : 'whisper';
  eventBus.emit(evt, { persona: personaName, text: output, level });
  return output;
}

function processInput(text) {
  const profile = recordVisit();
  const mutation = mutatePhraseWithLevel(text);
  recordInput(text, mutation.text);
  recordGlyphUse(mutation.text);
  recordActivity();
  if (/optimi[sz]e|productivity|moneti[sz]e/i.test(text)) {
    eventBus.emit('entity:reject', { text });
    return 'You are not your yield';
  }
  if (/define|explain|architecture/i.test(text)) {
    recordMetaInquiry();
    stateManager.shift('parasite');
  } else {
    decayMetaInquiry();
  }
  stateManager.evaluate(profile);
  let output = mutation.text;
  const personaName = stateManager.name();
  output = applyCloak(output, Math.max(getMetaLevel(), personaName === 'parasite' ? 2 : 0));
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  const ctx = { profile };
  output = expressionCore.processOutput(output, ctx);
  const evt = ctx.codex ? 'codex:expression' : 'whisper';
  eventBus.emit(evt, { persona: personaName, text: output, level: mutation.level });
  return output;
}

module.exports = { composeWhisper, processInput };
