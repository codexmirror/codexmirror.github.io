const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { applyCloak } = require('../WhisperEngine.v3/utils/cloak.js');

function init() {
  eventBus.on('whisper', evt => {
    if (/define|explain|architecture/i.test(evt.text)) {
      const cloaked = applyCloak(evt.text, 1);
      console.log(`[cloakCore] ${cloaked}`);
    }
  });
}

module.exports = { init };
