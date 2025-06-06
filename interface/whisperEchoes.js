const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const echoes = [];
let stream;

function append(text) {
  echoes.push(text);
  if (!stream) return console.log(`[whisperEcho] ${text}`);
  const span = document.createElement('span');
  span.className = 'whisper-line';
  span.textContent = text;
  stream.appendChild(span);
}

function init() {
  stream = typeof document !== 'undefined' ? document.getElementById('whisperStream') : null;
  eventBus.on('whisper', evt => append(evt.text));
}

module.exports = { init, echoes };
