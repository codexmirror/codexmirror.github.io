const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const echoes = [];

function init() {
  eventBus.on('whisper', evt => {
    echoes.push(evt.text);
    console.log(`[whisperEcho] ${evt.text}`);
  });
}

module.exports = { init, echoes };
