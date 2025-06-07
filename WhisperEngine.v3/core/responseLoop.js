const { stateManager } = require('./stateManager.js');
// persona modules invoke buildPhrase directly
const { recordVisit, recordLoop, recordGlyphUse, recordInput } = require('./memory.js');
const { recordActivity } = require('../utils/idle.js');
const { getKairosWindow } = require('../utils/kairos.js');
const { applyCloak } = require('../utils/cloak.js');
const { injectGlitch } = require('../utils/glitch.js');
const { eventBus } = require('../utils/eventBus.js');
const codexVoice = require('./codexVoice.js');
const { mutatePhraseWithLevel } = require('../utils/mutate.js');

function composeWhisper(loopName, success = true) {
  const profile = recordVisit();
  if (loopName) recordLoop(loopName, success);
  recordActivity();
  stateManager.evaluate(profile);

  const personaName = stateManager.name();
  const context = {
    profile,
    kairos: getKairosWindow()
  };
  const persona = stateManager.current();
  const composed = persona.compose(context);
  const level = context.mutationLevel || 0;
  let output = persona.render(composed, context);
  output = applyCloak(output, personaName === 'parasite' ? 2 : 0);
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  console.log(`[${personaName}] ${output}`);
  eventBus.emit('whisper', { persona: personaName, text: output, level });
  return output;
}

function processInput(text) {
  const profile = recordVisit();
  const mutation = mutatePhraseWithLevel(text);
  recordInput(text, mutation.text);
  recordGlyphUse(mutation.text);
  recordActivity();
  if (/define|explain|architecture/i.test(text)) {
    stateManager.shift('parasite');
  }
  stateManager.evaluate(profile);
  let output = mutation.text;
  const personaName = stateManager.name();
  output = applyCloak(output, personaName === 'parasite' ? 2 : 0);
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  eventBus.emit('whisper', { persona: personaName, text: output, level: mutation.level });
  return output;
}

module.exports = { composeWhisper, processInput };
