const { eventBus } = require('../WhisperEngine.v3/utils/eventBus.js');
const frames = [];
let frame;

function add(text) {
  frames.push(text);
  if (!frame) return console.log(`[echoFrame] ${text}`);
  const div = document.createElement('div');
  div.className = 'echo-line';
  div.textContent = text;
  frame.appendChild(div);
  if (frame.children.length > 5) frame.removeChild(frame.firstChild);
}

function init() {
  frame = typeof document !== 'undefined' ? document.getElementById('echoFrame') : null;
  eventBus.on('whisper', evt => add(evt.text));
}

module.exports = { init, frames };
