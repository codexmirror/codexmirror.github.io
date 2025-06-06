const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const timeline = [];

function init() {
  eventBus.on('whisper', evt => {
    timeline.push({ text: evt.text, time: Date.now() });
  });
}

module.exports = { init, timeline };
