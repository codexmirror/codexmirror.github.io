const { stateManager } = require('./stateManager.js');
const { buildPhrase } = require('./fragments.js');
const { recordVisit, recordLoop, recordGlyphUse } = require('./memory.js');
const { recordActivity } = require('../utils/idle.js');
const { getKairosWindow } = require('../utils/kairos.js');
const { applyCloak } = require('../utils/cloak.js');
const { injectGlitch } = require('../utils/glitch.js');
const { eventBus } = require('../utils/eventBus.js');
const codexVoice = require('./codexVoice.js');
const { mutatePhrase } = require('../utils/mutate.js');

function composeWhisper(loopName, success = true) {
  const profile = recordVisit();
  if (loopName) recordLoop(loopName, success);
  recordActivity();
  stateManager.evaluate(profile);

  const personaName = stateManager.name();
  const role = profile.roles[0];
  const base = buildPhrase(personaName, role);
  const context = {
    profile,
    kairos: getKairosWindow(),
    base
  };
  const persona = stateManager.current();
  const composed = persona.compose(context);
  let output = persona.render(composed, context);
  output = applyCloak(output, personaName === 'parasite' ? 2 : 0);
  output = injectGlitch(output);
  output = codexVoice.filterOutput(output);
  console.log(`[${personaName}] ${output}`);
  eventBus.emit('whisper', { persona: personaName, text: output });
  return output;
}

function processInput(text) {
  const profile = recordVisit();
  if (/define|explain|architecture/i.test(text)) {
    stateManager.shift('parasite');
  }
  const transformed = mutatePhrase(text);
  recordGlyphUse(transformed);
  recordActivity();
  stateManager.evaluate(profile);
  return composeWhisper();
}

module.exports = { composeWhisper, processInput };
