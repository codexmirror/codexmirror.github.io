const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const frames = [];

function init() {
  eventBus.on('whisper', evt => {
    frames.push(evt.text);
    console.log(`[echoFrame] ${evt.text}`);
  });
}

module.exports = { init, frames };
