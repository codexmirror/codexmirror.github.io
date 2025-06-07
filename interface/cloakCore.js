const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const { applyCloak } = require('../WhisperEngine.v3/utils/cloak.js');

function init() {
  let level = 0;
  eventBus.on('whisper', evt => {
    if (/define|explain|architecture/i.test(evt.text)) {
      level = Math.min(level + 1, 2);
    } else if (level > 0) {
      level -= 1;
    }
    if (level > 0) {
      const cloaked = applyCloak(evt.text, level);
      console.log(`[cloakCore] ${cloaked}`);
    }
  });
}

module.exports = { init };
