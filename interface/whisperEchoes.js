const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const echoes = [];
let stream;
let diagnostic = false;
const snapshots = [];

function append(text, level = 0) {
  echoes.push(text);
  if (diagnostic) snapshots.push({ text, level });
  if (!stream) return console.log(`[whisperEcho] ${text}`);
  const span = document.createElement('span');
  span.className = 'whisper-line';
  span.textContent = text;
  stream.innerHTML = '';
  stream.appendChild(span);
}

function init() {
  stream = typeof document !== 'undefined' ? document.getElementById('whisperStream') : null;
  eventBus.on('whisper', evt => append(evt.text, evt.level));
}
function setDiagnostic(flag) {
  diagnostic = flag;
}

module.exports = { init, echoes, setDiagnostic, snapshots };
